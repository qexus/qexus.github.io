# qexus lab — independent project network

Public homepage: https://qexus.github.io/

## Projects

| Repository | Public URL | Role |
| --- | --- | --- |
| [qexus.github.io](https://github.com/qexus/qexus.github.io) | https://qexus.github.io/ | Portfolio, career hub, sitemap, project status and shared tools |
| [manac](https://github.com/qexus/manac) | https://qexus.github.io/manac/ | Independent Manac Saint-Georges career guide |
| [fisheries](https://github.com/qexus/fisheries) | https://qexus.github.io/fisheries/ | Norway fisheries research and 17 static guides |
| [fisheries-ca](https://github.com/qexus/fisheries-ca) | https://qexus.github.io/fisheries-ca/ | Canada fisheries research and 17 static guides |

All published sites use one domain `qexus.github.io`; they are maintained in separate GitHub repositories. The `qexus/qexus` repository is the GitHub profile README, not the website.

## Localization

- **RU (original)** · **FR** · **UA** selectable (the technical Ukrainian language code and URLs remain `uk`) in the header across all pages.
- Language uses **static, indexable paths** (`/fr/`, `/uk/`, `/manac/fr/`, `/fisheries-ca/uk/guides/lesson-07.html`, etc.). Original query-based links remain a UI compatibility fallback.
- Main portfolio, career directory and the Manac career guide have RU/FR/UK standalone pages. The employee's optional personal referral help in Manac is explicitly free on all three editions, with no guarantee of hiring.
- All **12 lessons in both Fisheries Academies** now have full, independently indexable French and Ukrainian reading versions (48 pages). All four extended reference articles per country (professions, employers, registries, glossary) have standalone FR and UK versions (16 pages). The interactive Academy now supports localized curricula, certificate cards, job-application checklists and source libraries. Some auxiliary dashboard tools remain in Russian; do not claim the entire dashboard is translated.
- `shared/site-i18n.js` is the single source of the runtime translation dictionary. The standalone applications reuse this URL instead of shipping redundant copies.

## Search & sitemap

- HTML navigation map: https://qexus.github.io/site-map.html — all projects and 24 Academy lessons.
- Canonical XML sitemap: https://qexus.github.io/sitemap.xml — **126 unique public canonical pages**.
- `robots.txt` already advertises this XML sitemap.
- Generator: `python scripts/build_sitemap.py`. Validator: `python -m unittest discover -s tests`.
- Google Search Console uses the same sitemap URL; update/resubmit it when adding or removing canonical pages. Google indexing is not guaranteed.

## Publishing

GitHub Pages for this repository builds from `main` branch. The Manac and Fisheries sites deploy from their own repositories. Do not add a duplicate `manac/` folder to this repository; it was removed after the independent Manac Pages site was verified.

Internal implementation notes and remaining limitations are maintained under [`.github/project/IMPLEMENTATION.md`](.github/project/IMPLEMENTATION.md) and [`.github/project/BFISHERMAN_ROADMAP.md`](.github/project/BFISHERMAN_ROADMAP.md). These are development notes, not part of the published website.
