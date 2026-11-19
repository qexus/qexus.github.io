# Fisheries 2.1 — implementation report

**Projects**: https://qexus.github.io/ · https://qexus.github.io/fisheries/ · https://qexus.github.io/fisheries-ca/

## Phase 1 — Vacancies

**Implemented:** independent `verified_live` data contract; `scripts/refresh_jobs.py` with source authorization flag, deduplication, expiry and 36-hour last-verification limit; tests; daily/weekly publishing; shared UI in «Объявления», and official search links for NAV and Job Bank. Archives remain archives.

**Current product decision:** weekly public registry snapshots plus direct NAV / Job Bank links. Archived ads are explicitly archived. No private live-vacancy feed, signup or token is required; deployment does not inject feed secrets. The dormant adapter remains tested for historical compatibility, not part of the current setup plan.

## Phase 2 — Qualifications and sources

Each of the 12 modules links directly to government or public official sources appropriate to the country. Certification matrix contains role-specific requirements, providers and example fees with manual verification date. Daily health monitor warns when the last manual review is over 45 days old. **Fee/immigration updates are not automatically extracted**: they require human review.

## Phase 3 — Learning

The shared interface adds «Следующий незавершённый урок» and official study links. Existing 12 modules, 60 quiz questions per language, supplemental older lessons, local completion tracking and backup are preserved. This platform does not issue STCW, MED, or any other licensed maritime certificate.

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

**Remaining risks:** `style-src 'unsafe-inline'`, generated `innerHTML` needs security-focused fuzz tests, full automated browser tests, and no guarantee from regex-based secret scans. GitHub Pages meta CSP is not a substitute for all security response headers.

## Phase 7 — Guided candidate journey (18 November 2026)

The shared candidate-journey.js / candidate-journey.css provide a manual, local-only RU/FR/UK career path for Norway and Canada. Each country has its own saved choices (shore, vessel, aquaculture; experience, languages and document-category readiness) and manually completed steps. The tool links to existing learning, qualification and employer sections and official UDI/IRCC work information, without deciding eligibility or sending applications.

Both Fisheries apps include the journey in existing JSON backup/restore, validate its schema before restoring, preserve older backups and protect the open journey from background registry refreshes. The root privacy policy is updated in all three languages. CI checks the menu, history wiring, translations, data handling and backup compatibility. Full mobile browser QA remains pending.

## Phase 8 — Local candidate pack and application tracker (18 November 2026)

A shared candidate-desk.js / candidate-desk.css module provides a RU/FR/UK CV editor, factual cover-letter templates for shore, vessel and aquaculture roles, a print/PDF-friendly preview, and a local-only application board. Cards contain user-entered employer/role, optional HTTPS source link, application/follow-up dates, six status choices and notes, with edit/filter/delete. No application is submitted or CV uploaded by the site.

Norway and Canada keep independent localStorage keys. Existing JSON backup/restore includes the complete candidate desk and validates schema, dates, links, data size and country before restoring. Prior backups without the desk remain supported. The app preserves an open desk while registries refresh in the background. The common router supports ?view=desk; localized landing pages link directly to it. Privacy policies disclose that names/contact details and application notes may be in downloaded JSON; users should protect their copies.

Validation: all shared mock-DOM scenarios and both country build/deploy tests passed, including form edit/delete, unsafe URL and impossible-date rejection, and data escaping. Live HTML confirms menus and CSS are published. Real-device interactive and print visual QA is not claimed.

## Phase 9 — Practical safety scenarios and conceptual diagrams (18 November 2026)

The shared practicum.js and practicum.css provide an interactive RU/FR/UK training section (?view=practice) for both Norway and Canada. Six authored situations cover unclear vessel instructions, damaged personal protection, food-processing contamination, fraudulent job solicitations, incomplete job conditions, and farm equipment biosecurity. Each problem gives three possible actions, a specific preferred response, a safety explanation and a direct country-specific official reference. The optional four-panel conceptual guide visualizes vessel categories, fishing-gear groups, a basic processing flow and aquaculture equipment checks. Schematics are intentionally illustrative, not technical drawings or regulatory checklists.

Correct answers contribute only to a non-certifying study score; answers are saved in separate country-local localStorage keys. The existing JSON export/restore now includes optional practice state, with strict validation of the country, known question IDs and permitted answer values. Older backups without that field remain importable. The shared router supports deep links, History and localized titles; background registry refresh cannot replace an active practice view. French and Ukrainian landing pages include direct links to the new module.

QA: Node mock-DOM scenario/translation checks, payload-shape tests, static accessibility assertions, country CI deployments and public asset verification. No automatic data transmission. Official references were rechecked against regulator/authority pages. Pending: real-device interactive layout, specialist safety editorial review and native-speaker translation proofreading. Voice pronunciation and formal certificates were not implemented.

## Phase 10 — Source and catalogue integrity (18 November 2026)

Both country catalogues now distinguish company career sites from a public Job Bank employer-search page. Of thirteen selected career channels, twelve company page addresses were rechecked against indexed public company pages and one Job Bank search retains its earlier source-check date. Each record exposes its check date, evidence kind, and explicit unknown vacancy and working-language status. The shared employer renderer displays these facts in RU/FR/UK, and marks entries older than 45 days as needing review. Generic Norwegian shore work and Canadian industrial mechanic references were replaced by role-relevant official workplace safety and Job Bank occupational-requirements pages.

The 14 role profiles show source type (public authority versus employer reference), applicability, and manual review date; published price examples remain historical and require rechecking. Norway NAV and Canada Job Bank cards show an explicit historical-snapshot warning; these are not verified-live vacancies. Reference-data.js and reference-i18n.js remain synchronized for all three languages. New Node tests exercise metadata validity, source dates, renderer proof labels, stale warnings, and archive language. Country builds, translations and GitHub Pages deployments passed. This release did not change registry cadence or introduce an on-demand scraping workflow.

Remaining release gates before calling the overall roadmap fully complete: human occupational-safety and immigration/editorial review, full external-link revalidation, and physical mobile Safari interactive/print layout QA. Until those gates pass, retain the public audit file as previously agreed.

## Validation

Country Pages builds run Python unit tests, JS syntax checks, content tests and security scans. Browser QA verified new vacancy-source panel, archived-status warnings, 12 modules, next-lesson navigation, qualification prices and source links on Norway and Canada. Public site monitoring has a scheduled and push-triggered check; monitor result may briefly fail during publication before new URLs become live.

## Priority after this release

See [BFISHERMAN_ROADMAP.md](BFISHERMAN_ROADMAP.md): candidate journey and application pack/tracker are implemented. Practical scenarios and catalog source-quality improvements are implemented; final mobile QA and independent review remain before declaring the whole roadmap complete. Keep the weekly registry / official-link model selected by the project owner.
