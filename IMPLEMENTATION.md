# Fisheries 2.1 — implementation report

**Projects**: https://qexus.github.io/ · https://qexus.github.io/fisheries/ · https://qexus.github.io/fisheries-ca/

## Phase 1 — Vacancies

**Implemented:** independent `verified_live` data contract; `scripts/refresh_jobs.py` with source authorization flag, deduplication, expiry and 36-hour last-verification limit; tests; daily/weekly publishing; shared UI in «Объявления», and official search links for NAV and Job Bank. Archives remain archives.

**Blocked:** automated sourcing of actual live jobs. A licensed/authorized provider has not been connected; `status=not_connected`. NAV's production feed uses signed JWT and registration/terms requiring prompt removal of inactive ads. Canada Job Bank has no confirmed public third-party read API available for our use. Do **not** scrape prohibited source sites, copy third-party contact data, or publish stale ads as live.

Connector instructions: [Norway](https://github.com/qexus/fisheries/blob/main/JOBS_FEED_SETUP_RU.md) · [Canada](https://github.com/qexus/fisheries-ca/blob/main/JOBS_FEED_SETUP_RU.md).

## Phase 2 — Qualifications and sources

Each of the 12 modules links directly to government or public official sources appropriate to the country. Certification matrix contains role-specific requirements, providers and example fees with manual verification date. Daily health monitor warns when the last manual review is over 45 days old. **Fee/immigration updates are not automatically extracted**: they require human review.

## Phase 3 — Learning

The shared interface adds «Следующий незавершённый урок» and official study links. Existing 12 modules, 24 quiz questions, supplemental older lessons, local completion tracking and backup are preserved. This platform does not issue STCW, MED, or any other licensed maritime certificate.

## Phase 4 — Shared components

Canonical cross-country styles and enhancements now live in:
- [fisheries-core.js](https://github.com/qexus/qexus.github.io/blob/main/shared/fisheries-core.js)
- [fisheries-core.css](https://github.com/qexus/qexus.github.io/blob/main/shared/fisheries-core.css)

Both country sites load them from the root domain. Existing legacy `app.js` pages are still country-specific; a complete architectural unification is a separate migration, not claimed as finished.

## Phase 5 — Monitoring

GitHub Actions scheduled daily health checks from the root repo:
https://github.com/qexus/qexus.github.io/actions/workflows/health.yml

Checks public HTTPS pages, source records, age and unexpected reductions, verified vacancy snapshot format, official reference review date and common code assets. Stores a JSON artifact for two weeks. A red workflow is an alert in GitHub Actions, **not a push/email notification**.

Public dashboard: https://qexus.github.io/status.html

## Phase 6 — Security

- First-party script CSP; inline Norway navigation moved to external `mobile-nav.js`.
- Restrictive referrer policy and safer external URL protocol/userinfo checks.
- Static secret/leak and file-type scanning in both Pages builds.
- Tests for invalid URLs, expired vacancies and source authorization.
- Scope GitHub write permission to Canada build stage only.
- Published privacy and SECURITY.md documentation.

**Remaining risks:** `style-src 'unsafe-inline'`, generated `innerHTML` needs security-focused fuzz tests, major version GitHub Actions pinning to verified SHAs, full automated browser tests, and no guarantee from regex-based secret scans. GitHub Pages meta CSP is not a substitute for all security response headers.

## Validation

Country Pages builds run Python unit tests, JS syntax checks, content tests and security scans. Browser QA verified new vacancy-source panel, archived-status warnings, 12 modules, next-lesson navigation, qualification prices and source links on Norway and Canada. Public site monitoring has a scheduled and push-triggered check; monitor result may briefly fail during publication before new URLs become live.

## Priority after this release

1. Obtain authorized live job-data provider with clear redistribution and removal terms.
2. Connect an appropriate production feed without putting private tokens in public GitHub.
3. Add browser regression tests and stronger CSP without inline styles.
4. Improve qualifications by verifying actual fees and availability on a recurring cadence.
5. Migrate remaining duplicated app rendering to a shared codebase.
