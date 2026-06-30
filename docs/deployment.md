# Deployment

The site builds to static files (`out/`) and is deployed to **GitHub Pages** via
GitHub Actions. Hosting is swappable later (Vercel/Cloudflare/Netlify) with no
code changes — just point the new host at the repo and repoint DNS.

## How it works

- `.github/workflows/deploy.yml` runs on every push to `main`: `npm ci` →
  `npm run build` → upload `out/` → deploy to Pages.
- `next.config.ts` sets `output: "export"`, `images.unoptimized`, and
  `trailingSlash: true`.
- `public/.nojekyll` stops GitHub Pages from mangling `_next/` paths.
- `public/CNAME` holds the custom domain (one line).

## One-time GitHub setup

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run the workflow manually) — the Action builds + deploys.

## Custom domain (Namecheap)

1. Put your domain in **`public/CNAME`** (e.g. `haroon.dev`) — replace the
   `example.com` placeholder. Also update `site.url` in `src/lib/site.ts`.
2. In **Namecheap → Domain List → Manage → Advanced DNS**, add:

   **Apex domain** (`example.com`) — four A records to GitHub Pages:

   ```
   A   @   185.199.108.153
   A   @   185.199.109.153
   A   @   185.199.110.153
   A   @   185.199.111.153
   ```

   **`www` subdomain** — a CNAME:

   ```
   CNAME   www   <your-github-username>.github.io.
   ```

   (Remove Namecheap's default "parking" records.)

3. In repo **Settings → Pages**, set the custom domain and enable
   **Enforce HTTPS** once the certificate is issued (can take a few minutes).

## Local verification

```bash
npm run build        # produces ./out
npx serve out        # serve the static export and click through routes
```

Check the home scroll-highlight, card hovers, a blog article (highlighted code),
and a project page. `trailingSlash` means nested routes resolve as
`/blog/<topic>/<slug>/`.

## Switching hosts later

- **Vercel / Netlify / Cloudflare Pages**: import the repo; build `npm run build`,
  output dir `out`. Then repoint DNS to the new host and remove the GitHub Pages
  `CNAME`/A records. No application code changes required.
