/*
  Read-only review of published, public career / qualification URLs.
  This is a reachability check, NOT proof that a vacancy exists or a regulation
  remains correct. It never edits manual last-reviewed dates in the websites.
*/
import { writeFileSync, appendFileSync } from 'node:fs';
import { isIP } from 'node:net';

const outputs = { json: 'source-link-health.json', markdown: 'source-link-health.md' };
const feeds = [
  'https://qexus.github.io/fisheries/reference-data.js',
  'https://qexus.github.io/fisheries-ca/reference-data.js'
];
const practicumFeed = 'https://qexus.github.io/shared/practicum.js';
const extras = [
  { url: 'https://www.manac.com/ca/fr/compagnie/carrieres/', label: 'Manac official careers', kind: 'career' },
  { url: 'https://arbeidsplassen.nav.no/stillinger', label: 'NAV official job search', kind: 'job_search' },
  { url: 'https://www.jobbank.gc.ca/', label: 'Job Bank official job search', kind: 'job_search' }
];
const maxRedirects = 5;
const seconds = 10;
const timeout = seconds * 1000;
const now = new Date().toISOString();
const stamp = (text = '') => String(text).replaceAll('|', '\\|').replace(/[\r\n]+/g, ' ').slice(0, 200);
function safeUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
    const host = u.hostname.toLowerCase();
    if (!host || isIP(host) || host === 'localhost' ||
        host.endsWith('.localhost') || host.endsWith('.local') ||
        host.endsWith('.internal') || host.endsWith('.test')) return null;
    return u;
  } catch { return null; }
}
function sourceItem(url, label, kind, checked) {
  return { url, label: String(label || 'Source'), kind, manualReviewed: checked || null };
}
async function request(url, method, hops = 0) {
  const parsed = safeUrl(url);
  if (!parsed) return { status: null, category: 'unsafe_url', finalUrl: url };
  if (hops > maxRedirects) return { status: null, category: 'redirect_loop', finalUrl: url };
  try {
    const resp = await fetch(parsed.href, {
      method, redirect: 'manual', headers: {
        'User-Agent': 'qexus-lab-public-source-check/1.0 (+https://qexus.github.io/privacy.html)',
        Accept: 'text/html,application/xhtml+xml,*/*;q=0.8'
      }, signal: AbortSignal.timeout(timeout)
    });
    const status = resp.status;
    const loc = resp.headers.get('location');
    await resp.body?.cancel?.();
    if (status >= 300 && status < 400 && loc) {
      const next = new URL(loc, parsed).href;
      if (!safeUrl(next)) return { status, category: 'unsafe_redirect', finalUrl: next };
      return request(next, method, hops + 1);
    }
    return { status, finalUrl: parsed.href };
  } catch (e) {
    return { status: null, category: 'unverified_network', detail: String(e?.message || e).slice(0, 120), finalUrl: parsed.href };
  }
}
function classify(status) {
  if (status === 404 || status === 410) return 'possible_broken';
  if (status >= 200 && status < 300) return 'reachable_not_content_verified';
  if ([401, 403, 429].includes(status)) return 'access_restricted_unverified';
  if (status >= 500) return 'server_error_unverified';
  if (status >= 300 && status < 400) return 'redirect_unverified';
  return 'http_error_unverified';
}
async function check(item) {
  let res = await request(item.url, 'HEAD');
  if ([400, 403, 404, 405, 406, 501].includes(res.status) || res.category === 'unverified_network') {
    // A lot of sites reject HEAD but serve GET; never treat HEAD-only 404 as
    // decisive. Don't retry 429: respect rate limits.
    const fallback = await request(item.url, 'GET');
    if (fallback.status !== null || fallback.category !== 'unverified_network') res = fallback;
  }
  return { ...item, ...res, category: res.category || classify(res.status) };
}
async function fetchData(url) {
  const r = await request(url, 'GET');
  if (r.status !== 200) throw new Error('Reference data unavailable (' + url + '): ' + (r.status || r.category));
  // Read body only for JSON data, with strict upper bound; NEVER evaluate JS.
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error('Reference data download failed: ' + response.status);
  const raw = await response.text();
  if (raw.length > 300_000) throw new Error('Reference data unusually large');
  const match = raw.match(/window\.qexusFisheriesReference=(\{[\s\S]*\});\s*$/);
  if (!match) throw new Error('Reference data JSON format changed: ' + url);
  return JSON.parse(match[1]);
}
async function collectPracticumReferences(map) {
  const r = await fetch(practicumFeed, { signal: AbortSignal.timeout(timeout) });
  if (!r.ok) throw new Error('Practicum source unavailable: HTTP ' + r.status);
  const raw = await r.text();
  if (raw.length > 120_000) throw new Error('Practicum script unexpectedly large');
  // Extract only the twelve literal authority links in sourceUrls. Never
  // evaluate code or scrape user-input strings from the training UI.
  const section = raw.match(/const sourceUrls = \{([\s\S]*?)\n  \};/);
  if (!section) throw new Error('Practicum authority list has an unknown format');
  const matches = [...section[1].matchAll(/'https:\/\/[^'\s]+'/g)];
  if (matches.length !== 12) throw new Error('Expected twelve country-specific practicum sources, found ' + matches.length);
  for (const match of matches) {
    const link = safeUrl(match[0].slice(1, -1));
    if (!link) throw new Error('Unsafe practicum source URL');
    const url = link.href;
    const item = map.get(url) || sourceItem(url, 'Practicum: safety / employment authority', 'training_scenario', null);
    item.provenance = [...new Set([...(item.provenance || []), practicumFeed])];
    map.set(url, item);
  }
}
function collect(doc, feed, map) {
  for (const country of ['norway', 'canada']) {
    for (const e of doc.employers?.[country] || []) {
      const u = safeUrl(e.url);
      if (!u) continue;
      const key = u.href;
      const item = map.get(key) || sourceItem(key, e.name, e.sourceKind || 'employer', e.checked);
      item.provenance = [...new Set([...(item.provenance || []), feed])];
      map.set(key, item);
    }
    for (const r of doc.roles?.[country] || []) {
      for (const k of ['source', 'training']) {
        if (!r[k]) continue;
        const u = safeUrl(r[k]); if (!u) continue;
        const key = u.href;
        const item = map.get(key) || sourceItem(key, r.role || r.id, k === 'source' ? 'qualification' : 'training', r.checked);
        item.provenance = [...new Set([...(item.provenance || []), feed])];
        map.set(key, item);
      }
    }
  }
}
const sources = new Map();
const errors = [];
for (const feed of feeds) {
  try {
    const doc = await fetchData(feed);
    collect(doc, feed, sources);
  } catch (e) { errors.push(String(e?.message || e)); }
}
try { await collectPracticumReferences(sources); }
catch (e) { errors.push(String(e?.message || e)); }
for (const extra of extras) sources.set(extra.url, sourceItem(extra.url, extra.label, extra.kind, null));

const queue = [...sources.values()].slice(0, 90);
const results = [];
const workers = Array.from({ length: Math.min(6, queue.length) }, async () => {
  while (queue.length) {
    const item = queue.shift();
    results.push(await check(item));
  }
});
await Promise.all(workers);
results.sort((a, b) => a.category.localeCompare(b.category) || a.url.localeCompare(b.url));
const counts = {};
for (const result of results) counts[result.category] = (counts[result.category] || 0) + 1;
const report = {
  checkedAt: now, scope: 'Curated career, qualifications and twelve practical-scenario authority links; HTTP only, not vacancy or legal validation',
  tested: results.length, counts, errors, results
};
writeFileSync(outputs.json, JSON.stringify(report, null, 2) + '\n', 'utf8');
const rows = [
  '# Public source-link reachability · QEXUS',
  '',
  'Run: ' + now,
  '',
  '**This report does NOT confirm that vacancies are open, that courses remain available, or that regulatory text is current.** Links blocked by robots, rate limits or geo-restrictions remain *unverified*, not broken.',
  '',
  'Checked URLs: ' + results.length,
  '',
  ...Object.entries(counts).map(([category, count]) => '- ' + category + ': ' + count),
  ...(errors.length ? ['', 'Feed errors:', ...errors.map(e => '- ' + stamp(e))] : []),
  '',
  '| Result | HTTP | Reference | URL |',
  '|---|---:|---|---|',
  ...results.map(x => '| ' + stamp(x.category) + ' | ' + (x.status ?? '—') +
    ' | ' + stamp(x.label) + ' | ' + stamp(x.url) + ' |'),
  ''
];
writeFileSync(outputs.markdown, rows.join('\n'), 'utf8');
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, rows.slice(0, 14).join('\n') + '\n');
}
for (const x of results.filter(x => x.category === 'possible_broken'))
  console.log('::warning::Possible broken public source (manual review): ' + x.url + ' (HTTP ' + x.status + ')');
if (errors.length) {
  for (const e of errors) console.log('::warning::Reference data fetch: ' + e);
}
console.log(JSON.stringify({ count: results.length, counts, feedErrors: errors.length }, null, 2));
// Only the absence of both public catalogues is a process failure. Individual
// external URLs remain report-only; source websites can block automation.
if (errors.length >= feeds.length + 1) process.exitCode = 1;
