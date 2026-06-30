@AGENTS.md

# Personal Website

Personal site + blog for Haroon Atif. Dark, terminal-themed, statically
exported, deployed to GitHub Pages. The point of the project is to publish
writing (grouped by topic) and projects with minimal friction — add a file,
push, done.

## What it is

- **Next.js 16 (App Router) + TypeScript**, fully static (`output: "export"`).
- **Tailwind CSS v4** — themed in CSS via `@theme` in `src/app/globals.css`.
  There is no `tailwind.config.ts`.
- **MDX** content via `next-mdx-remote/rsc` + `rehype-pretty-code` (Shiki).
- **No animation library** — hover/scroll effects are CSS + tiny vanilla client
  handlers, kept light on purpose.

## Map of the codebase

- `content/` — everything publishable (you edit this to ship):
  - `blog/<topic>/topic.json` + `<article>.mdx`
  - `projects/<project>.mdx`
  - `resume/experience.ts`
- `src/lib/` — build-time loaders that read `content/`: `blog.ts`, `projects.ts`,
  plus `site.ts` (identity/nav) and `format.ts`.
- `src/app/` — routes; dynamic routes pre-render via `generateStaticParams`.
- `src/components/` — grouped by area: `nav/ hero/ resume/ cards/ mdx/ ui/`.
- Aliases: `@/*` → `src/*`, `@content/*` → `content/*`.

## How to work on it

```bash
npm run dev      # local dev server
npm run build    # static export to ./out (this is what Pages deploys)
npm run lint     # eslint
npx tsc --noEmit # typecheck
npx prettier --write .   # format (don't hand-format; Prettier owns style)
```

- It's a **static export**: no SSR, API routes, or server-only runtime features.
  Anything dynamic must resolve at build time.
- After adding `content/`, the relevant pages appear automatically — no routing
  changes needed.

## Deeper docs (read when relevant)

- `docs/architecture.md` — structure, routes, where the interactivity lives.
- `docs/content-authoring.md` — how to add topics, articles, projects, resume.
- `docs/design-system.md` — tokens, fonts, UI primitives, motifs.
- `docs/deployment.md` — GitHub Pages + Namecheap DNS, switching hosts.
