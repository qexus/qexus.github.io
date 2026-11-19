import { expect } from '@playwright/test';

export const publicSites = Object.freeze({
  portfolio: 'https://qexus.github.io/',
  norway: 'https://qexus.github.io/fisheries/',
  canada: 'https://qexus.github.io/fisheries-ca/',
  manac: 'https://qexus.github.io/manac/',
});

export const sitesForRun = (ids) => {
  const selected = process.env.QA_SITE || 'all';
  return ids.filter((id) => selected === 'all' || selected === id);
};

export async function openPage(page, url) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response, 'Page navigation returned no HTTP response').not.toBeNull();
  expect(response.status(), url + ' HTTP status').toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
}

export async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      viewport: window.innerWidth,
      scrollWidth: root.scrollWidth,
      bodyWidth: document.body?.scrollWidth ?? 0,
      documentWidth: root.clientWidth,
    };
  });
  // Some engines round fractional CSS pixels; tolerate at most 3px.
  expect(metrics.scrollWidth, label + ' / root: ' + JSON.stringify(metrics))
    .toBeLessThanOrEqual(metrics.viewport + 3);
}

export async function screenshot(page, testInfo, label) {
  await page.screenshot({ path: testInfo.outputPath(label + '.png'), animations: 'disabled' });
}

export function runtimeErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  return {
    assertNone() {
      expect(errors, 'Uncaught page JavaScript errors').toEqual([]);
    },
  };
}
