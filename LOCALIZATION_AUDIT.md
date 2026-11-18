> Актуальный итог: [аудит от 18 ноября 2026](AUDIT_2026-11-18.md). Ниже сохранена предыдущая стадия работы.

# Localization continuation — 2026-11-17

## Shipped in this change

- The Norway and Canada interactive career directories now use the existing French and Ukrainian reference translations: 14 profession paths and 13 employer records across the two countries. Official URLs, employer names, contact addresses and local favorites keys remain unchanged.
- All 12 lessons now have five multiple-choice questions in French and Ukrainian (60 per language). Correct-answer indices are aligned with the original Russian bank. Grading, explanations and local pass records work in both languages; lesson completion remains an explicit checkbox.
- Translated select labels preserve their original option values, so filters and stored statuses do not silently change language-dependent keys.
- Language-switch links follow the current section, including Back/Forward navigation. The course-price, career-plan and source-library panels now have reloadable routes; the application plan uses `view=career` to distinguish it from archived job listings.
- Shared quick-start, learning and source-status labels are translated. Searching employers tolerates accents and common Norwegian ligatures.

## Validation

- All existing checks passed: 16 Norway Python tests, 22 Canada Python tests, 10 portal Python tests, both Academy content suites, Manac content checks, JS syntax and both security scans.
- Added a CI check for 120 translated questions, answer-key consistency, unchanged official URLs/employer identities, escaping of hostile text, and script execution order.
- Local structural audit: 126 sitemap URLs have existing HTML files and self-canonical URLs; all 3,176 internal link/asset references checked resolve to files.
- Browser checks: French Norway sector filtering; translated employer search; incomplete and fully correct French and Ukrainian quizzes; Canada lesson progress survives reload; switching languages preserves the section; the career-plan deep link survives reload; Canada ship roles filter correctly.

## Remaining scope, not claimed complete

- Older auxiliary tools and some archived descriptions still contain Russian; the visible localization note states this.
- The sitemap is prepared at https://qexus.github.io/sitemap.xml. Acceptance/indexing in Google Search Console is not verified by these source checks.
- Registry snapshots remain scheduled. Current vacancies are checked through official source links; no new private token or live-vacancy feed was configured.
