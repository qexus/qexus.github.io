import { test, expect } from '@playwright/test';
import { publicSites, sitesForRun, openPage, assertNoHorizontalOverflow, runtimeErrors, screenshot } from './helpers.mjs';

test.describe('QEXUS portfolio, localized work hub and shared footer', () => {
  test.skip(!sitesForRun(['portfolio']).length, 'Portfolio tests run centrally or for QA_SITE=portfolio');

  for (const lang of ['ru', 'fr', 'uk']) {
    const prefix = lang === 'ru' ? '' : lang + '/';
    test('homepage is readable and responsive in ' + lang, async ({ page }, testInfo) => {
      const errors = runtimeErrors(page);
      await openPage(page, publicSites.portfolio + prefix);
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator('.portfolio-hub')).toBeVisible();
      await expect(page.locator('.portfolio-hub')).toHaveAttribute('href', '/' + prefix + 'work.html');
      await assertNoHorizontalOverflow(page, 'Portfolio ' + lang);
      await screenshot(page, testInfo, 'portfolio-' + lang + '-hero');
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await footer.scrollIntoViewIfNeeded();
      await assertNoHorizontalOverflow(page, 'Portfolio footer ' + lang);
      await screenshot(page, testInfo, 'portfolio-' + lang + '-footer');
      errors.assertNone();
    });

    test('career hub exposes all three projects in ' + lang, async ({ page }) => {
      const errors = runtimeErrors(page);
      await openPage(page, publicSites.portfolio + prefix + 'work.html');
      await expect(page.locator('main')).toBeVisible();
      for (const destination of ['/fisheries/', '/fisheries-ca/', '/manac/']) {
        await expect(page.locator('a[href*="' + destination + '"]').first()).toBeAttached();
      }
      await assertNoHorizontalOverflow(page, 'Work hub ' + lang);
      errors.assertNone();
    });
  }
});
