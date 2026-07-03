# Testing

End-to-end tests exercise the site the way a visitor does — real routing, the
interactive terminal nav, content rendering, the project visualization, and the
CV download. They're written with **Playwright** and live in `tests/e2e/`.

## Run

```bash
npm test            # run the whole suite (starts the dev server automatically)
npm run test:ui     # Playwright UI mode (watch / step through)
npm run test:report # open the HTML report from the last run
```

The first run needs browsers installed once:

```bash
npx playwright install chromium
```

`playwright.config.ts` starts `next dev` on port **3123** as its `webServer`, so
you don't need a server running beforehand (it reuses one if already up). Two
browser projects run every spec: **desktop** (Desktop Chrome) and **mobile**
(Pixel 7) — the terminal nav and responsive menu are tested under both.

> Note: because `next dev` compiles each route on first request, first-visit
> navigations can take a few seconds. The config raises the default timeouts and
> caps workers so that on-demand compilation doesn't cause flakes. If you ever
> want to test the exact deployed artifact instead, run `npm run build` and point
> a static server at `out/`.

## What's covered (`tests/e2e/`)

| Spec                        | Covers                                                                 |
| --------------------------- | ---------------------------------------------------------------------- |
| `home.spec.ts`              | hero (real name/tagline), experience timeline, CTA + CV link           |
| `terminal-nav.spec.ts`      | `cd`/`help`/unknown-dir, always-on block cursor (both viewports)       |
| `content.spec.ts`           | blog topic → article, project cards → detail, about, 404               |
| `viz.spec.ts`               | AlSalah panels react to date/location; globe's reduced-motion fallback |
| `cv-and-responsive.spec.ts` | CV served as PDF, desktop links vs mobile menu, footer links           |

## Adding tests

- Prefer **role/label locators** (`getByRole`, `getByLabel`) over text — text
  like project titles often appears in more than one element and trips
  Playwright's strict mode.
- For a new visualization, assert against a **live `aria-label`** (as
  `viz.spec.ts` does) rather than prose that may repeat the same words.
- Viewport-specific behavior: branch on `testInfo.project.name`
  (`"desktop"` / `"mobile"`).
