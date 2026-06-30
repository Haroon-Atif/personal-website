# personal-website

A dark, terminal-themed personal site + blog, built with Next.js and statically
exported to GitHub Pages.

- **Blog** grouped by topic (security, dev notes, novel translation, …).
- **Projects** with demos / write-ups.
- **Interactive resume** that highlights each role as you scroll.
- Authored entirely as **MDX/JSON files** in `content/` — no CMS, no database.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

## Editing content

Add files under `content/` — pages appear automatically. See
[`docs/content-authoring.md`](docs/content-authoring.md).

## Docs

- [Architecture](docs/architecture.md)
- [Content authoring](docs/content-authoring.md)
- [Design system](docs/design-system.md)
- [Deployment (GitHub Pages + Namecheap)](docs/deployment.md)

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · MDX (`next-mdx-remote` +
`rehype-pretty-code`) · motion.

Built with the help of Claude Code.
