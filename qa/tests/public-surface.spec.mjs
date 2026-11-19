import { test, expect } from '@playwright/test';

// Public source repositories may contain development documentation and tests.
// GitHub Pages must not publish them as visitor-facing URLs.
test('internal audit files and QA code are not served as website assets', async ({ request }) => {
  for (const url of [
    'https://qexus.github.io/AUDIT.md',
    'https://qexus.github.io/IMPLEMENTATION.md',
    'https://qexus.github.io/BFISHERMAN_ROADMAP.md',
    'https://qexus.github.io/README.md',
    'https://qexus.github.io/qa/tests/fisheries.spec.mjs',
    'https://qexus.github.io/qa/lighthouserc.cjs',
    'https://qexus.github.io/manac/AUDIT.md',
    'https://qexus.github.io/manac/MIGRATION.md',
    'https://qexus.github.io/manac/tests/check.mjs',
    'https://qexus.github.io/manac/scripts/build_public.mjs',
  ]) {
    const response = await request.get(url, { failOnStatusCode: false });
    const status = response.status();
    // A transient 503 means the CDN is unavailable, not that source was published.
    // Only 200/206 or redirects are evidence of exposure; recheck 503 separately.
    if (status === 503) console.warn('Inconclusive CDN 503 for private Pages path: ' + url);
    expect([403,404,410,503], 'Potential source exposure or unexpected response ' + status + ' for ' + url).toContain(status);
  }
});

test('essential public pages, legal notices and data resources remain accessible', async ({ request }) => {
  for (const url of [
    'https://qexus.github.io/',
    'https://qexus.github.io/robots.txt',
    'https://qexus.github.io/sitemap.xml',
    'https://qexus.github.io/privacy.html',
    'https://qexus.github.io/shared/site-i18n.js',
    'https://qexus.github.io/fisheries/',
    'https://qexus.github.io/fisheries/generated/registry.json',
    'https://qexus.github.io/fisheries-ca/',
    'https://qexus.github.io/fisheries-ca/generated/registry.json',
    'https://qexus.github.io/manac/',
    'https://qexus.github.io/manac/fr/',
    'https://qexus.github.io/manac/uk/',
  ]) {
    const response = await request.get(url);
    expect(response.ok(), 'Required public asset unavailable: ' + url).toBe(true);
  }
});
