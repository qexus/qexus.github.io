import { defineConfig, devices } from '@playwright/test';

const site = process.env.QA_SITE || 'all';
const match = {
  portfolio: '**/portfolio.spec.mjs',
  manac: '**/manac.spec.mjs',
  norway: '**/fisheries.spec.mjs',
  canada: '**/fisheries.spec.mjs',
};
if (site !== 'all' && !(site in match)) {
  throw new Error('Unknown QA_SITE: ' + site);
}

export default defineConfig({
  testDir: './tests',
  testMatch: match[site] || '**/*.spec.mjs',
  timeout: 30_000,
  expect: { timeout: 12_000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'],
    ['html', { outputFolder: './playwright-report', open: 'never' }],
    ['json', { outputFile: './test-results/results.json' }],
  ],
  outputDir: './test-results',
  use: {
    headless: true,
    actionTimeout: 10_000,
    navigationTimeout: 25_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: false,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
    },
    {
      name: 'iphone-webkit',
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
});
