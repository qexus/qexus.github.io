import { test, expect } from '@playwright/test';
import { publicSites, sitesForRun, openPage, assertNoHorizontalOverflow, runtimeErrors, screenshot } from './helpers.mjs';

test.describe('Manac careers — iPhone layout, filters and localized pages', () => {
  test.skip(!sitesForRun(['manac']).length, 'Manac tests run centrally or for QA_SITE=manac');

  for (const lang of ['ru', 'fr', 'uk']) {
    const prefix = lang === 'ru' ? '' : lang + '/';
    test('all vacancies and the mobile header render in ' + lang, async ({ page }, testInfo) => {
      const errors = runtimeErrors(page);
      await openPage(page, publicSites.manac + prefix);
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator('article.job')).toHaveCount(11);
      await expect(page.locator('article.job:not([hidden])')).toHaveCount(11);
      // Privacy and visual-integrity guardrail: crossorigin images must
      // actually load; otherwise third-party cookie mitigation is not safe.
      const hero = page.locator('.hero-image img');
      await expect(hero).toHaveAttribute('crossorigin','anonymous');
      await expect.poll(() => hero.evaluate(img => img.complete && img.naturalWidth > 0), {timeout: 20000})
        .toBe(true);
      const cardPhoto = page.locator('article.job .job-photo img').first();
      await cardPhoto.scrollIntoViewIfNeeded();
      await expect(cardPhoto).toHaveAttribute('crossorigin','anonymous');
      await expect.poll(() => cardPhoto.evaluate(img => img.complete && img.naturalWidth > 0), {timeout: 20000})
        .toBe(true);
      const uaLink = page.locator('.qx-language-switch a[hreflang="uk"]');
      await expect(uaLink).toHaveText('UA');
      await expect(uaLink).toHaveAttribute('href', /(?:\/uk\/|[?&]lang=uk)/);
      await assertNoHorizontalOverflow(page, 'Manac ' + lang);
      await screenshot(page, testInfo, 'manac-' + lang + '-hero');
      await page.locator('footer').scrollIntoViewIfNeeded();
      await expect(page.locator('.qx-footer')).toBeVisible();
      await assertNoHorizontalOverflow(page, 'Manac footer ' + lang);
      await screenshot(page, testInfo, 'manac-' + lang + '-footer');
      errors.assertNone();
    });

    test('client-side category and vacancy search work in ' + lang, async ({ page }) => {
      const errors = runtimeErrors(page);
      await openPage(page, publicSites.manac + prefix);
      await page.locator('button[data-filter="office"]').click();
      await expect(page.locator('button[data-filter="office"]')).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(async () => page.locator('article.job:not([hidden])').count()).toBeGreaterThan(0);
      const officeCount = await page.locator('article.job:not([hidden])').count();
      expect(officeCount).toBeLessThan(11);
      await page.locator('#jobSearch').fill('zzzz-no-vacancy-match-qa');
      await expect(page.locator('article.job:not([hidden])')).toHaveCount(0);
      await expect(page.locator('#noJobs')).toBeVisible();
      await page.locator('#jobSearch').fill('');
      await page.locator('button[data-filter="all"]').click();
      await expect(page.locator('article.job:not([hidden])')).toHaveCount(11);
      errors.assertNone();
    });
  }
});
