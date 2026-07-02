# Architecture

A statically-exported Next.js (App Router) personal site. No server, no
database — everything is generated at build time into `out/`.

## Stack

- **Next.js 16 (App Router) + TypeScript**, `output: "export"` (`next.config.ts`).
- **Tailwind CSS v4** — config lives in CSS via `@theme` in `src/app/globals.css`
  (there is no `tailwind.config.ts`).
- **MDX** content rendered with `next-mdx-remote/rsc`, highlighted by
  `rehype-pretty-code` (Shiki), GFM via `remark-gfm`.
- **No animation library** — interactivity is plain CSS + small vanilla client
  handlers (kept deliberately light; see below).
- Fonts via `next/font`: JetBrains Mono (`--font-jetbrains`) + Inter
  (`--font-inter`).

## Routes (`src/app/`)

| Route                  | Source                               |
| ---------------------- | ------------------------------------ |
| `/`                    | `page.tsx` — hero + resume + contact |
| `/blog`                | `blog/page.tsx` — topic cards        |
| `/blog/[topic]`        | article list for a topic             |
| `/blog/[topic]/[slug]` | rendered MDX article                 |
| `/projects`            | `projects/page.tsx` — project cards  |
| `/projects/[slug]`     | rendered MDX project detail          |
| `/about`               | `about/page.tsx`                     |

Dynamic routes are fully pre-rendered via `generateStaticParams`.

## Content vs. code

- **Content** lives in `content/` (MDX + JSON + one TS file). This is what you
  edit to publish.
- **Loaders** in `src/lib/` (`blog.ts`, `projects.ts`) read `content/` from the
  filesystem at build time and expose typed helpers.
- **Components** in `src/components/` are grouped by area: `nav/`, `hero/`,
  `resume/`, `cards/`, `mdx/`, `ui/`, `viz/`.
- Path aliases: `@/*` → `src/*`, `@content/*` → `content/*` (`tsconfig.json`).

## Interactivity (where the moving parts are)

- `components/hero/Typewriter.tsx` — typing animation (client).
- `components/resume/ExperienceTimeline.tsx` — scroll-driven role highlighting
  via a rAF scroll listener picking the role nearest viewport centre (client).
- `components/cards/HoverCard.tsx` — cursor-tracking green spotlight + lift,
  reused by every card (client). Pure CSS variables set on `mousemove`; no
  animation library, so it stays cheap on card-heavy pages.
- `components/nav/NavPrompt.tsx` — the interactive `cd` prompt in the nav
  (client, on mobile + desktop). Draws its own always-on block cursor and hides
  the native caret so the visible caret matches the real insertion point.
- `components/viz/*` — interactive project visualizations (e.g. `MoonSighting`)
  embedded into project MDX by name; see `docs/visualizations.md`.

All animations honor `prefers-reduced-motion`.

## Testing

Playwright E2E tests in `tests/e2e/` drive the built site (routing, terminal
nav, content, the visualization, CV download) under desktop + mobile viewports.
See `docs/testing.md`. Run with `npm test`.
