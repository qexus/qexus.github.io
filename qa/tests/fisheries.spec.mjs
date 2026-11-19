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
        const uaLink = page.locator('.qx-language-switch a[hreflang="uk"]');
        await expect(uaLink).toHaveText('UA');
        await expect(uaLink).toHaveAttribute('href', /(?:\/uk\/|[?&]lang=uk)/);
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
        if (lang === 'fr') expect(await page.locator('#qp-title').innerText()).not.toMatch(/[А-Яа-яЁё]/);
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
        if (lang === 'fr') expect(await page.locator('#qj-title').innerText()).not.toMatch(/[А-Яа-яЁё]/);
        await expect(page.locator('.qj-step')).toHaveCount(9);
        await assertNoHorizontalOverflow(page, country + ' journey ' + lang);
        await openPage(page, base + '?view=desk&lang=' + lang);
        await expect(page.locator('#qd-title')).toBeVisible({ timeout: 15_000 });
        if (lang === 'fr') expect(await page.locator('#qd-title').innerText()).not.toMatch(/[А-Яа-яЁё]/);
        await expect(page.locator('#qd-print')).toBeVisible();
        await expect(page.locator('#qd-application-form')).toBeAttached();
        await assertNoHorizontalOverflow(page, country + ' CV ' + lang);
        errors.assertNone();
      });
    }

    test('registry hydration keeps mobile footer outside the initial viewport', async ({ page }) => {
      const errors = runtimeErrors(page);
      await page.addInitScript(() => {
        window.__qxCls = 0;
        try {
          new PerformanceObserver(list => {
            for (const item of list.getEntries()) {
              if (!item.hadRecentInput) window.__qxCls += item.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch { window.__qxCls = null; } // WebKit may not implement LayoutShift.
      });
      await openPage(page, base);
      await expect(page.locator('#main .norway-hero, #main .hero')).toBeVisible({ timeout: 15000 });
      await expect.poll(() => page.locator('#main .norway-hero, #main .hero').evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(100);
      const proof = await page.evaluate(() => ({
        minHeight: getComputedStyle(document.querySelector('#main')).minHeight,
        viewport: innerHeight
      }));
      expect(parseFloat(proof.minHeight), 'Initial content must reserve viewport height').toBeGreaterThanOrEqual(proof.viewport - 3);
      await page.waitForTimeout(1500);
      const cls = await page.evaluate(() => window.__qxCls);
      if (cls !== null) expect(cls, 'Hydration caused visible page jumping').toBeLessThan(0.1);
      errors.assertNone();
    });

    for (const lang of ['fr', 'uk']) {
      test('lesson permalink uses the selected language in ' + lang, async ({ page }) => {
        const errors = runtimeErrors(page);
        await openPage(page, base + '?view=curriculum&lang=' + lang);
        const link = page.locator('.qf-lesson-link').first();
        await expect(link).toBeAttached({ timeout: 15_000 });
        await expect(link).toContainText(lang === 'fr' ? 'Lien permanent vers la leçon' : 'Постійне посилання на урок');
        await expect(link).toHaveAttribute('href', /view=curriculum/);
        if (lang === 'fr') expect(await link.innerText()).not.toMatch(/[А-Яа-яЁё]/);
        errors.assertNone();
      });
    }

    for (const lang of ['fr', 'uk']) {
      test('standalone translated academy pages have UA switch in ' + lang, async ({ page }) => {
        const errors = runtimeErrors(page);
        for (const suffix of ['', 'guides/', 'guides/lesson-01.html', 'guides/lesson-12.html']) {
          await openPage(page, base + lang + '/' + suffix);
          const nav = page.locator('.translated-languages');
          await expect(nav, 'Standalone page must have a language switch: ' + suffix).toBeVisible();
          const ua = nav.locator('a[hreflang="uk"]');
          await expect(ua, country + ' ' + lang + ' ' + suffix).toHaveText('UA');
          await expect(ua).toHaveAttribute('href', /\/uk\//);
          await assertNoHorizontalOverflow(page, country + ' localized ' + lang + '/' + suffix);
        }
        errors.assertNone();
      });
    }

    // A transient CDN miss can serve the shared footer CSS while the local
    // guide.css is missing. Its width must still stay within the viewport.
    test('localized footer fits if guide stylesheet fails to load', async ({ page }) => {
      await page.route('**/guides/guide.css', route => route.abort('failed'));
      await openPage(page, base + 'fr/');
      await page.waitForLoadState('load');
      const footer = page.locator('footer.qx-footer .qx-footer__inner');
      await expect(footer).toBeVisible();
      const borderBox = await footer.evaluate(el => getComputedStyle(el).boxSizing);
      expect(borderBox, 'Shared footer must not depend on guide.css global box-sizing').toBe('border-box');
      await assertNoHorizontalOverflow(page, country + ' footer without guide stylesheet');
    });

    if (country === 'canada') {
      for (const lang of ['ru', 'fr', 'uk']) {
        test('province grid has readable labels on narrow and medium screens in ' + lang, async ({ page }, testInfo) => {
          const errors = runtimeErrors(page);
          await openPage(page, base + '?lang=' + lang);
          await expect(page.locator('.province-panel .province-map button')).toHaveCount(8, { timeout: 20_000 });
          for (const width of [1440, 1137, 780, 390, 320]) {
            await page.setViewportSize({ width, height: 900 });
            const geometry = await page.locator('.province-panel').evaluate(panel => {
              const map = panel.querySelector('.province-map');
              const box = map.getBoundingClientRect();
              const labels = [...map.querySelectorAll('button span')];
              return {
                panelWidth: panel.clientWidth,
                columnCount: getComputedStyle(map).gridTemplateColumns.split(' ').length,
                mapWidth: map.clientWidth,
                labels: labels.map(label => {
                  const b = label.getBoundingClientRect();
                  const card = label.closest('button').getBoundingClientRect();
                  return { text: label.textContent, scrollWidth: label.scrollWidth,
                    clientWidth: label.clientWidth, x: b.x, right: b.right,
                    cardRight: card.right, cardLeft: card.left,
                    cardBottom: card.bottom, labelBottom: b.bottom };
                })
              };
            });
            expect(geometry.labels).toHaveLength(8);
            for (const label of geometry.labels) {
              expect(label.scrollWidth, width + 'px: label overflows horizontally: ' + label.text)
                .toBeLessThanOrEqual(label.clientWidth + 2);
              expect(label.right, width + 'px: label outside card: ' + label.text)
                .toBeLessThanOrEqual(label.cardRight + 1);
              expect(label.x).toBeGreaterThanOrEqual(label.cardLeft - 1);
              expect(label.labelBottom, width + 'px: label clipped vertically: ' + label.text)
                .toBeLessThanOrEqual(label.cardBottom + 1);
            }
            if (width === 1137 && geometry.panelWidth <= 690) {
              expect(geometry.columnCount).toBeLessThanOrEqual(3);
            }
            await assertNoHorizontalOverflow(page, 'Canada province tiles ' + lang + ' ' + width);
            if (width === 1137 || width === 390) {
              await screenshot(page, testInfo, 'canada-' + lang + '-province-' + width);
            }
          }
          errors.assertNone();
        });
      }
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
