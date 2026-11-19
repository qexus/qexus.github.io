# QEXUS Playwright visual and interaction QA

One shared test suite for the four public GitHub Pages sites.

## Scope

- Portfolio: RU/FR/UK homepages, Work hub links, desktop and iPhone-sized layout, header and footer.
- Manac: RU/FR/UK pages, 11 cards, category and keyword filters, mobile layout and footer.
- Fisheries Norway + Canada: RU/FR/UK dashboards and deep links for candidate journey, CV/application desk and six-scenario practice; iPhone menu and Back; browser-only storage, reload persistence, safe mock applications and a stubbed print action.
- Captures desktop Chromium and mobile WebKit (iPhone 13 emulation). WebKit emulation is not physical iPhone Safari or an accessibility audit.

The tests operate against published https://qexus.github.io/ sites, not an unpublished local branch. Existing Python / Node tests still gate Fisheries build and publish steps. Browser QA is an additional post-deploy check and does not change the Monday registry-refresh process.

## Local use

Node.js 22 or compatible:

    cd qa
    npm install --no-audit --no-fund
    npx playwright install chromium webkit
    npx playwright test

Test a single project:

    QA_SITE=norway npx playwright test
    QA_SITE=canada npx playwright test
    QA_SITE=manac npx playwright test
    QA_SITE=portfolio npx playwright test

Test iPhone-sized WebKit:

    npx playwright test --project=iphone-webkit

Inspect the HTML report:

    npx playwright show-report

## GitHub Actions

- qexus/qexus.github.io: .github/workflows/visual-qa.yml tests all four sites on changes to shared modules and root pages, weekly, or manually.
- qexus/fisheries and qexus/fisheries-ca: same-name workflows run country tests after successful Pages deployment, or manually. Test code is checked out from the public main QEXUS repo; no extra token/PAT is needed.
- qexus/manac: runs after site-relevant pushes or manually.

Download qexus-*-browser-report from a run's Artifacts area. It includes screenshots, the HTML report and failure traces. Reports are retained for 14 days.

## Privacy, safety and limitations

All candidate names, CV snippets, and employer names used in the browser tests are synthetic, in fresh isolated browser contexts. No employer application is sent, no logins are performed, and no real user data is copied. The print flow is tested using a stubbed window.print(); real Safari-to-PDF page breaks and typography must still be inspected manually.

Third-party content, font loading, public network availability and GitHub Pages propagation can occasionally cause failures. Recheck the latest deployment before rerunning.

Visual QA cannot certify the legal accuracy of employment rules or occupational training content.
