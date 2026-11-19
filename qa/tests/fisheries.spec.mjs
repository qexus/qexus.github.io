import { test, expect } from '@playwright/test';
import { publicSites, sitesForRun, openPage, assertNoHorizontalOverflow, runtimeErrors, screenshot } from './helpers.mjs';

for (const country of sitesForRun(['norway', 'canada'])) {
  const base = publicSites[country];
  const suffix = country === 'norway' ? 'norway' : 'canada';

  test.describe('Fisheries ' + country + ' — responsive iPhone and browser flows', () => {
    for (const lang of ['ru', 'fr', 'uk']) {
      test('dashboard / header / footer / translations in ' + lang, async ({ page }, testInfo) => {
        const errors = runtimeErrors(page);
        await openPage(page, base + '?lang=' + lang);
        await expect(page.locator('#main h1').first()).toBeVisible({ timeout: 15_000 });
        await expect(page.locator('#nav')).toBeAttached();
        // Screenshots caught an untranslated Russian quick-start in FR/UK even
        // though the standard route and overflow tests had all passed.
        const quick = page.locator('.qf-first-steps');
        await expect(quick).toBeVisible();
        await expect(quick.locator('.qf-step')).toHaveCount(4);
        const quickLabels = {
          ru: ['С чего начать', 'Мой маршрут', 'Найти работодателя', 'Выбрать профессию', 'Начать обучение'],
          fr: ['Par où commencer', 'Mon parcours', 'Trouver un employeur', 'Choisir un métier', 'Commencer la formation'],
          uk: ['З чого почати', 'Мій маршрут', 'Знайти роботодавця', 'Обрати професію', 'Почати навчання'],
        };
        const quickText = await quick.innerText();
        for (const label of quickLabels[lang]) expect(quickText).toContain(label);
        if (lang === 'fr') expect(quickText, 'French quick-start must not leak Russian text').not.toMatch(/[А-Яа-яЁё]/);
        if (testInfo.project.name === 'iphone-webkit') {
          const headerGeometry = await page.evaluate(() => {
            const top = document.querySelector('header.topbar,header.header');
            const crumb = top?.querySelector('.crumb,.breadcrumb');
            const languages = top?.querySelector('.qx-language-switch');
            if (!top || !crumb || !languages) return null;
            const cr = crumb.getBoundingClientRect(), lr = languages.getBoundingClientRect();
            return { crumbY: cr.y, languagesBottom: lr.bottom,
              crumbWidth: crumb.clientWidth, crumbScroll: crumb.scrollWidth,
              topBottom: top.getBoundingClientRect().bottom };
          });
          expect(headerGeometry, 'Expected Fisheries mobile header structure').not.toBeNull();
          expect(headerGeometry.crumbY, 'Breadcrumb should have its own full-width row')
            .toBeGreaterThanOrEqual(headerGeometry.languagesBottom - 1);
          expect(headerGeometry.crumbScroll, 'Current page breadcrumb must not be cut off on iPhone 13')
            .toBeLessThanOrEqual(headerGeometry.crumbWidth + 3);
          expect(headerGeometry.topBottom).toBeGreaterThan(headerGeometry.crumbY);
        }
        await expect(page.locator('footer.qx-footer')).toBeVisible();
        await assertNoHorizontalOverflow(page, country + ' dashboard ' + lang);
        await screenshot(page, testInfo, country + '-' + lang + '-dashboard');
        await page.locator('footer.qx-footer').scrollIntoViewIfNeeded();
        await assertNoHorizontalOverflow(page, country + ' footer ' + lang);
        await screenshot(page, testInfo, country + '-' + lang + '-footer');
        errors.assertNone();
      });

      test('practice exercises render and fit the viewport in ' + lang, async ({ page }, testInfo) => {
        const errors = runtimeErrors(page);
        await openPage(page, base + '?view=practice&lang=' + lang);
        await expect(page.locator('#qp-title')).toBeVisible({ timeout: 15_000 });
        await expect(page.locator('.qp-card')).toHaveCount(6);
        await expect(page.locator('.qp-guide')).toBeAttached();
        await assertNoHorizontalOverflow(page, country + ' practice ' + lang);
        await screenshot(page, testInfo, country + '-' + lang + '-practice');
        errors.assertNone();
      });

      test('CV and candidate journey deep-links render in ' + lang, async ({ page }) => {
        const errors = runtimeErrors(page);
        await openPage(page, base + '?view=journey&lang=' + lang);
        await expect(page.locator('#qj-title')).toBeVisible({ timeout: 15_000 });
        await expect(page.locator('.qj-step')).toHaveCount(9);
        await assertNoHorizontalOverflow(page, country + ' journey ' + lang);
        await openPage(page, base + '?view=desk&lang=' + lang);
        await expect(page.locator('#qd-title')).toBeVisible({ timeout: 15_000 });
        await expect(page.locator('#qd-print')).toBeVisible();
        await expect(page.locator('#qd-application-form')).toBeAttached();
        await assertNoHorizontalOverflow(page, country + ' CV ' + lang);
        errors.assertNone();
      });
    }

    test('mobile hamburger opens and routes without losing browser history', async ({ page }) => {
      const errors = runtimeErrors(page);
      await openPage(page, base);
      const nav = page.locator('#menuToggle');
      if (test.info().project.name.includes('iphone')) {
        await expect(nav).toBeVisible();
        await nav.click();
        await expect(nav).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('#sidebar')).toBeVisible();
      }
      await page.locator('#nav [data-qj-view="journey"]').click();
      await expect(page.locator('#qj-title')).toBeVisible();
      await expect(page).toHaveURL(/view=journey/);
      // Verify the dynamic dashboard shortcuts after returning via History.
      await page.goBack();
      await expect(page.locator('#main h1').first()).toBeVisible();
      await expect(page).not.toHaveURL(/view=journey/);
      errors.assertNone();
    });

    test('candidate journey completion survives reload and track change clears it', async ({ page }) => {
      const errors = runtimeErrors(page);
      await openPage(page, base + '?view=journey&lang=ru');
      await expect(page.locator('#qj-title')).toBeVisible();
      const mark = page.locator('[data-qj-complete="eligibility"]');
      await mark.check();
      expect(await page.evaluate((id) => JSON.parse(localStorage.getItem(id)).completed.eligibility, 'qexus-candidate-journey-' + suffix + '-v1')).toBe(true);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('#qj-title')).toBeVisible();
      await expect(page.locator('[data-qj-complete="eligibility"]')).toBeChecked();
      await page.locator('#qj-track').selectOption('vessel');
      await expect(page.locator('[data-qj-complete="eligibility"]')).not.toBeChecked();
      errors.assertNone();
    });

    test('candidate CV, manual application tracker and print action remain browser-only', async ({ page }, testInfo) => {
      const errors = runtimeErrors(page);
      await openPage(page, base + '?view=desk&lang=ru');
      await expect(page.locator('#qd-title')).toBeVisible();
      await page.locator('[data-qd-field="name"]').fill('QA Test Candidate');
      await page.locator('[data-qd-field="experience"]').fill('Demonstration: industrial equipment experience (test only).');
      await expect(page.locator('#qd-print')).toContainText('QA Test Candidate');
      await page.locator('#qd-application-form [name="company"]').fill('Example QA Employer');
      await page.locator('#qd-application-form [name="role"]').fill('Quality assurance test role');
      await page.locator('#qd-application-form [name="link"]').fill('https://example.org/careers');
      await page.locator('#qd-application-form [name="status"]').selectOption('applied');
      await page.locator('#qd-application-form button[type="submit"]').click();
      await expect(page.locator('.qd-card')).toHaveCount(1);
      await expect(page.locator('.qd-card')).toContainText('Example QA Employer');
      // Tests use a fresh Playwright browser context, never the user's actual saved data.
      const snapshot = await page.evaluate((id) => JSON.parse(localStorage.getItem(id)), 'qexus-candidate-desk-' + suffix + '-v1');
      expect(snapshot.applications).toHaveLength(1);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('#qd-title')).toBeVisible();
      await expect(page.locator('.qd-card')).toHaveCount(1);
      await expect(page.locator('#qd-print')).toContainText('QA Test Candidate');
      await page.evaluate(() => { window.__qaPrintCalls = 0; window.print = () => { window.__qaPrintCalls++; }; });
      await page.locator('[data-qd-print]').click();
      expect(await page.evaluate(() => window.__qaPrintCalls)).toBe(1);
      await screenshot(page, testInfo, country + '-cv-preview');
      errors.assertNone();
    });

    test('practice scores and explanations survive a reload', async ({ page }) => {
      const errors = runtimeErrors(page);
      await openPage(page, base + '?view=practice&lang=ru');
      await expect(page.locator('#qp-title')).toBeVisible();
      await page.locator('input[name="qp-answer-vessel-command"][value="1"]').check();
      await page.locator('[data-qp-submit="vessel-command"]').click();
      await expect(page.locator('#qp-card-vessel-command .qp-result.is-right')).toBeVisible();
      await expect(page.locator('.qp-score')).toContainText('1 / 6');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('#qp-card-vessel-command .qp-result.is-right')).toBeVisible();
      const data = await page.evaluate((id) => JSON.parse(localStorage.getItem(id)), 'qexus-practice-' + suffix + '-v1');
      expect(data.answers['vessel-command']).toBe(1);
      errors.assertNone();
    });
  });
}
