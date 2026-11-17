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

- **RU (original)** · **FR** · **UK** selectable in the header across all pages.
- Language uses **static, indexable paths** (`/fr/`, `/uk/`, `/manac/fr/`, `/fisheries-ca/uk/guides/lesson-07.html`, etc.). Original query-based links remain a UI compatibility fallback.
- Main portfolio, career directory and the Manac career guide have substantial interface/content translations.
- All **12 lessons in both Fisheries Academies** now have full, independently indexable French and Ukrainian reading versions (48 pages). The four extended reference articles per country and some interactive modules remain in Russian. The non-Russian app interface discloses this; do not label those untranslated parts as complete.
- `shared/site-i18n.js` is the source of the translation dictionary; standalone repositories currently carry synchronized local copies.

## Search & sitemap

- HTML navigation map: https://qexus.github.io/site-map.html — all projects and 24 Academy lessons.
- Canonical XML sitemap: https://qexus.github.io/sitemap.xml — **110 unique public canonical pages**.
- `robots.txt` already advertises this XML sitemap.
- Generator: `python scripts/build_sitemap.py`. Validator: `python -m unittest discover -s tests`.
- Google Search Console uses the same sitemap URL; update/resubmit it when adding or removing canonical pages. Google indexing is not guaranteed.

## Publishing

GitHub Pages for this repository builds from `main` branch. The Manac and Fisheries sites deploy from their own repositories. Do not add a duplicate `manac/` folder to this repository; it was removed after the independent Manac Pages site was verified.

For a current audit and remaining limitations, see [MULTISITE_AUDIT.md](MULTISITE_AUDIT.md).
