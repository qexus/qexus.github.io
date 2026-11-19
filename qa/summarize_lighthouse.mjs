import { existsSync, readdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
const root = 'qa/lighthouse-reports';
if (!existsSync(root)) throw new Error('Lighthouse report directory missing');
const files = readdirSync(root).filter(x => x.endsWith('.report.json'));
if (files.length < 4) throw new Error('Expected four independent Lighthouse mobile page reports, found ' + files.length);
const rows = [];
const scores = [];
for (const file of files) {
  const report = JSON.parse(readFileSync(root + '/' + file, 'utf8'));
  const metric = id => {
    const x = report.audits?.[id];
    return typeof x?.numericValue === 'number' ? Math.round(x.numericValue) : null;
  };
  const score = id => typeof report.categories?.[id]?.score === 'number' ? Math.round(report.categories[id].score * 100) : 0;
  const row = {
    url: report.finalDisplayedUrl || report.finalUrl || report.requestedUrl,
    performance: score('performance'), accessibility: score('accessibility'),
    best: score('best-practices'), seo: score('seo'),
    fcp: metric('first-contentful-paint'), lcp: metric('largest-contentful-paint'),
    tbt: metric('total-blocking-time'), cls: report.audits?.['cumulative-layout-shift']?.numericValue ?? null
  };
  scores.push(row);
}
scores.sort((a, b) => a.url.localeCompare(b.url));
rows.push('# Lighthouse mobile · live QEXUS sites', '', '_Synthetic mobile scores, not field Core Web Vitals. Values vary with network, machine load and third-party assets._', '',
  '| Site | Perf | A11y | Best | SEO | FCP ms | LCP ms | TBT ms | CLS |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const x of scores) rows.push('| ' + x.url + ' | ' + x.performance + ' | ' + x.accessibility + ' | ' + x.best + ' | ' + x.seo + ' | ' + x.fcp + ' | ' + x.lcp + ' | ' + x.tbt + ' | ' + (x.cls === null ? '—' : x.cls.toFixed(3)) + ' |');
rows.push('', 'Raw HTML and JSON Lighthouse reports are retained in the Actions artifact.', '');
writeFileSync('qa/lighthouse-summary.md', rows.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, rows.join('\n'));
console.log(rows.join('\n'));
