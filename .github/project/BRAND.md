# qexus lab — Brand Guide / Фирменный стиль

**Status:** Approved by the project owner, 16 November 2026.
**Scope:** Main qexus lab site and future public projects. Project-specific accent colors are allowed.

## Brand idea

Technology that solves real problems. Clean, credible, modern interfaces that prioritize useful data and tools rather than decoration.

## Core palette (exact values from the published qexus.github.io/styles.css)

| Role | Name | HEX |
| --- | --- | --- |
| Primary dark background | Deep navy | `#071523` |
| Secondary panel background | Dark blue panel | `#0D2031` |
| Borders / separators | Steel blue | `#244358` |
| Main text | Cool white | `#EAF4F8` |
| Secondary text | Muted slate | `#91ACBA` |
| Primary accent | Qexus mint / turquoise | `#4ADAC2` |
| Secondary accent | Soft blue | `#69AFD1` |

**Do not change the core palette casually.** These values are the reference set used in the main portal, not replacements for every existing project's theme.

## Project palettes / variants already published

- **Fisheries Canada:** background `#061422`, panel `#0B2031`, primary accent `#48D6BE`. Keep compatible with the core palette.
- **Fisheries Norway:** aligned with Canada’s dark navy and turquoise interface (`#061422` / `#0B2031` / `#48D6BE`).
- **Future AI project:** optional purple accent, to be selected when implemented (not yet an official HEX).
- **Future robotics project:** optional amber accent, to be selected when implemented (not yet an official HEX).

## Typography

- Main portal: **DM Sans**, with system sans-serif fallback.
- Canada project: **Inter**, with system sans-serif fallback.
- Use clean sans-serif type, clear hierarchy, generous whitespace. Prefer consistent weights to overdecorative headings.

## Logo and navigation

- Official icon: **QX** silver/turquoise monogram with a subtle connected-node motif inside a dark rounded square with a cyan outline, approved by the project owner on 16 November 2026.
- Canonical assets: `assets/qx-logo.svg` (scalable wrapper), `assets/qx-logo-180.png` (website/app icon), `assets/qx-favicon-48.png` (favicon). Original high-resolution cropped PNG variants are available separately.
- Use the **same QX icon** for the main portal and all future qexus lab subprojects. Retain the lowercase **qexus lab** wordmark next to the icon. No fishing-specific imagery belongs in the parent brand mark.
- On subprojects, the qexus lab logo links to `https://qexus.github.io/`.
- Provide links between sibling projects, where relevant.
- Each project can have its own name and small accent identity without losing the shared brand family.

## UI principles

1. Mobile-first and accessible: readable font sizes, sufficient contrast, responsive navigation.
2. Dark navy + turquoise as the main visual language; use light areas where data readability benefits.
3. Rounded cards, restrained outlines, and subtle gradients; avoid excessive glow and visual noise.
4. Useful information first: search, transparent sourcing, status indicators and clear limitations.
5. Never publish personal resumes, private contacts, application history, or local browser exports to public GitHub Pages repos.
6. Treat public registry entries as registry entries, not confirmed open vacancies.
7. When making a new project, start from these design tokens and document any intentional deviations.

## Suggested reusable CSS

See `brand/tokens.css`. Use the tokens as a starting point; existing sites do not need to be forced into identical layouts.

## Current projects

- Portal: https://qexus.github.io/
- Norway: https://qexus.github.io/fisheries/
- Canada: https://qexus.github.io/fisheries-ca/

This is a *living design reference*, not a license or legal trademark registration.
