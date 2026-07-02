# Content Authoring

All publishable content lives in `content/`. No code changes are needed to add
articles or projects — add files and rebuild.

## Add a blog topic

A topic is a folder under `content/blog/`. Create the folder and a `topic.json`:

```
content/blog/<topic-slug>/topic.json
```

```json
{
  "title": "Cybersecurity",
  "description": "One-line summary shown on the topic card.",
  "accent": "green", // "green" | "cyan" | "amber"
  "icon": "⛨", // a short glyph/emoji
  "category": "security", // groups cards on the blog index
  "order": 1 // lower sorts first (also orders categories)
}
```

The topic card and `/blog/<topic-slug>` page appear automatically.

### Categories & novels

Topics are grouped on the blog index by their `category`. The `/blog` page
renders one heading per category with its cards underneath; category order
follows the lowest `order` among the topics in it. Add a friendly heading label
in `CATEGORY_LABELS` (`src/app/blog/page.tsx`) — unknown categories just show
their slug.

**Each novel you translate is its own topic** (its own folder + card), with
`"category": "novels"`, and its chapters are the articles inside. To add another
novel, create another topic folder with `"category": "novels"` — they group
together on the index automatically.

## Add a blog article

Add an `.mdx` file inside a topic folder:

```
content/blog/<topic-slug>/<article-slug>.mdx
```

```mdx
---
title: "Your Article Title"
date: "2026-05-12" # YYYY-MM-DD, used for sorting + display
description: "One-line summary for the list + SEO."
tags: ["web", "appsec"]
---

Write **Markdown / MDX** here. Fenced code blocks are syntax-highlighted:

\`\`\`python
print("hello")
\`\`\`
```

Articles sort newest-first by `date`.

## Add a project

Add an `.mdx` file under `content/projects/`:

```mdx
---
title: "Project Name"
summary: "One-line summary for the card."
tech: ["Next.js", "TypeScript"]
demoUrl: "https://..." # optional
repoUrl: "https://..." # optional
featured: true # optional — adds a badge
order: 1 # lower sorts first
---

Long-form write-up rendered on /projects/<slug>.
```

### Add an interactive visualization to a project

A project's detail page can embed an interactive visualization (e.g. the
moon-sighting calculator on the AlSalah project). Register a client component in
`src/components/viz/` and reference it by name in the MDX body:

```mdx
## How it works

<MoonSighting />
```

Full walkthrough (and how to add your own) in `docs/visualizations.md`.

## Edit the resume

Roles are a typed array in `content/resume/experience.ts`. Edit the entries
(newest first); the interactive timeline on the home page updates automatically.

## Edit identity / links

Name, tagline, email, socials, CV path, and nav items live in `src/lib/site.ts`.
The CV is served from `public/` — the current file is
`public/Haroon_Atif_CV.pdf` and `site.cv` points at `/Haroon_Atif_CV.pdf`. To
swap it, drop a new PDF in `public/` and update `site.cv` to match. CV links use
the `download` attribute so the file saves rather than opening in a tab.

Still placeholder (replace before a real deploy): `site.socials` (GitHub /
LinkedIn URLs), `site.url`, and `public/CNAME` (custom domain).
