# Security Audit Report — 2026-06-30

Defensive audit of this repository, following
`nextjs-security-audit-plan.md`, refined for the actual stack found here.

## Architecture summary (Phase 0)

This is a **fully static personal website**: Next.js 16 App Router with
`output: "export"` (`next.config.ts`), exported to plain HTML/CSS/JS and hosted
on GitHub Pages. There is **no server runtime in production** — no API routes
(`app/api/**` / `route.ts`: none), **no Server Actions** (`"use server"`: none),
**no authentication**, **no database**, and **no user-submitted data**. All
content is author-authored MDX/JSON/TS under `content/`, compiled at build time.

Because of this, most OWASP categories that dominate real-app audits **have no
attack surface here** (see "Phases marked N/A"). The real, reviewable surface is
small:

**Entry points / trust boundaries:**

- Build-time content files in `content/` (trusted; authored by the repo owner).
- The client-side nav prompt (`src/components/nav/NavPrompt.tsx`) which parses a
  typed command and calls `router.push()` for in-app navigation.
- External links rendered in MDX, the footer, buttons, and project cards.
- The build/deploy toolchain (npm dependencies + GitHub Actions workflow).

The "attacker-controlled input reaching a dangerous sink" model that the plan is
built around essentially does not exist at runtime for this site. Findings below
are therefore weighted toward **supply-chain** and **hardening**, not
exploitable application bugs.

---

## Executive summary

- **Total findings: 4** — Critical: 0 · High: 0 · Medium: 0 · Low: 4
- No exploitable application vulnerabilities were found. The site exposes no
  server, auth, database, or user input, which removes the high-risk classes
  entirely.
- Top items (all low / hardening):
  1. Transitive `postcss` advisory via Next's bundled copy — **build-time only,
     not exploitable in this app**; do **not** apply the suggested `--force` fix.
  2. No HTTP security headers (a limitation of static export + GitHub Pages).
  3. MDX renders trusted author content without sanitization — safe today, a
     risk only if third-party submissions are ever accepted.
  4. GitHub Actions pinned to mutable tags rather than commit SHAs.

---

## Status — owner decisions (2026-06-30)

- **VULN-001 (postcss):** Accepted / no override applied. Build-time only, not
  exploitable here. Track the Next.js bump manually (run `npm audit` / `npm
  outdated` periodically).
- **VULN-002 (headers):** **"Enforce HTTPS" enabled** in GitHub Pages settings
  (transport security covered). Content headers (CSP/nosniff/referrer) are
  **accepted risk / skipped** — defense-in-depth only on this no-input site.
- **VULN-003 (MDX):** Confirmed **not applicable** — all content enters via
  owner-reviewed git; no unreviewed third-party submissions are accepted.
- **VULN-004 (Actions):** **Open / accepted.** Actions remain on mutable major
  tags. (Dependabot was trialed but removed — see note below.)
- **CI status:** The `npm audit` + Dependabot CI added on 2026-06-30 was
  **reverted** — it surfaced an unrelated `npm ci` failure on the runner and
  generated noisy red checks. The repo's only workflow now is the Pages deploy.
  Re-introducing SCA later is a backlog item (see recommendations).

---

## Findings

### VULN-001 — Transitive `postcss < 8.5.10` advisory (build-time)

- **Severity:** Low · **Confidence:** High (advisory real) / exploitability: negligible here
- **OWASP:** A06 — Vulnerable & Outdated Components
- **Location:** `node_modules/next/node_modules/postcss` (transitive via `next@16.2.9`); surfaced by `npm audit`
- **Description:** `npm audit` reports 2 moderate issues, both the same advisory
  — GHSA-qx2v-qp2m-jg93, "PostCSS XSS via unescaped `</style>` in CSS stringify
  output." It is pulled in by Next's **internally bundled** PostCSS.
- **Impact:** The advisory requires PostCSS to process **attacker-controlled
  CSS**. This project processes only author-written CSS (`globals.css`) and
  Tailwind-generated CSS at **build time**; no untrusted CSS is ever parsed, and
  PostCSS does not run in the deployed static output. Practical exploitability
  here is effectively nil.
- **Remediation:**
  - **Do NOT run `npm audit fix --force`** — it tries to install `next@9.3.3`, a
    massive, breaking downgrade that would itself be far more dangerous.
  - Track Next.js releases and bump `next` once its bundled PostCSS is ≥ 8.5.10.
  - Optionally, force the transitive version via a `package.json` override and
    re-test the build:
    ```json
    "overrides": { "postcss": "^8.5.10" }
    ```

### VULN-002 — No HTTP security headers

- **Severity:** Low · **Confidence:** High
- **OWASP:** A05 — Security Misconfiguration
- **Location:** `next.config.ts` (no `headers()`); GitHub Pages host
- **Description:** There is no Content-Security-Policy, X-Content-Type-Options,
  Referrer-Policy, X-Frame-Options/`frame-ancestors`, or HSTS. Note that
  `next.config` `headers()` **does not apply under `output: "export"`**, and
  **GitHub Pages cannot serve custom headers at all**, so this can't be fully
  fixed on the current host.
- **Impact:** Lower than usual for a static, no-input, no-auth, no-cookie site
  (no sessions to steal, no forms to CSRF). Mainly defense-in-depth: a CSP would
  reduce the blast radius if a content/XSS issue were ever introduced;
  `X-Content-Type-Options: nosniff` and a `Referrer-Policy` are cheap wins.
- **Remediation (pick per appetite):**
  - Partial, host-independent: add a CSP and referrer policy via `<meta>` tags
    in `src/app/layout.tsx` (`export const metadata` / a `<meta httpEquiv>` in
    the head). `<meta>` CSP can't express `frame-ancestors` or HSTS but covers
    script/style sources.
  - Full headers: host on a platform that supports a `_headers` file or response
    headers (Cloudflare Pages, Netlify) or Vercel `headers()`. The site is
    already deploy-agnostic, so this is a host swap, not a code change.
  - Enable **"Enforce HTTPS"** in GitHub Pages settings (this is the available
    transport-security control).

### VULN-003 — MDX rendered without sanitization (trusted content today)

- **Severity:** Low (informational) · **Confidence:** High
- **OWASP:** A03 — Injection / XSS
- **Location:** `src/components/mdx/MdxContent.tsx`, `src/lib/blog.ts`, `src/lib/projects.ts`
- **Description:** Articles/projects are compiled with `next-mdx-remote/rsc`,
  which permits raw HTML/JSX in MDX and applies no HTML sanitization
  (`rehype-sanitize` is not in the pipeline). External links in
  `mdx-components.tsx` render the author-supplied `href` directly into an
  `<a>` (a `javascript:`/`data:` URL would be clickable).
- **Impact:** **None under the current model** — all MDX is committed to the repo
  by the owner and reviewed via git, i.e. it is trusted, build-time content.
  This becomes a real XSS vector only if the blog ever ingests **third-party or
  user-submitted** MDX/markdown.
- **Remediation:** No action needed now. If submissions are ever accepted, add
  `rehype-sanitize` to the rehype plugins in `MdxContent.tsx` and validate link
  schemes (allow `http/https/mailto` only). Documenting the "content is trusted"
  assumption in `docs/content-authoring.md` is enough for today.

### VULN-004 — GitHub Actions pinned to mutable tags

- **Severity:** Low · **Confidence:** High
- **OWASP:** A06 / A08 — Supply chain
- **Location:** `.github/workflows/deploy.yml`
- **Description:** Actions are referenced by mutable major tags
  (`actions/checkout@v4`, `actions/setup-node@v4`,
  `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`). A compromised
  upstream tag could run malicious code in CI.
- **Impact:** Low and bounded: the workflow already uses **least-privilege
  permissions** (`contents: read`, `pages: write`, `id-token: write`) and holds
  no long-lived secrets, so the blast radius is limited to the Pages deployment.
- **Remediation:** Optionally pin actions to full commit SHAs (with a comment
  noting the version) and let Dependabot bump them. The current least-privilege
  `permissions:` block is correct and should stay.

---

## Reviewed — no issue found (positive controls)

- **Secrets / config (Phase 1):** No hardcoded secrets, API keys, tokens, or
  connection strings. No `process.env` or `NEXT_PUBLIC_*` usage anywhere. No
  `.env*` files exist or are git-tracked; `.gitignore` covers `.env*`. The only
  "identity" data (`src/lib/site.ts`) is public contact info meant to be shipped.
- **Open redirect / navigation (Phase 4):** `NavPrompt.tsx` resolves the `cd`
  argument to an always-internal `/...` path and **checks it against the
  `directories` allowlist before `router.push()`** — it cannot navigate
  off-site or to arbitrary routes. No `window.location` redirects from user
  input.
- **DOM XSS sinks:** No `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`, no
  `child_process`.
- **External links:** All `target="_blank"` links carry
  `rel="noopener noreferrer"` (`Footer.tsx`, `ProjectCard.tsx`,
  `mdx-components.tsx`, `Button.tsx`) — no reverse-tabnabbing.
- **next.config:** No `eslint.ignoreDuringBuilds` / `typescript.ignoreBuildErrors`
  (build-time checks are not suppressed); `images.unoptimized` with **no**
  `domains`/`remotePatterns` wildcards.
- **CI permissions:** Least-privilege, as noted in VULN-004.

## Phases marked N/A (no attack surface in this stack)

- **Phase 2 — Authentication/session:** No auth, sessions, cookies, JWTs, or
  passwords exist.
- **Phase 3 — Authorization / IDOR (A01):** No protected resources, no
  per-user/`id`-based data access, no roles.
- **Phase 4 — SQLi / command injection / SSRF / path traversal:** No database,
  no shell calls, no server-side fetch of user URLs, no user-controlled file
  paths. (Only XSS/open-redirect sub-items applied — covered above.)
- **Phase 5 — API routes / Server Actions / CSRF / webhooks / uploads:** None
  exist.
- **Phase 6 — Data exposure:** No dynamic data, PII store, or error responses;
  only public, intentionally-published content is in the bundle.
- **Phase 9 — Dynamic self-testing:** Surface too small to warrant fuzzing;
  static review is conclusive for this stack.

---

## Remediation order

1. **Critical / High:** none.
2. **Medium:** none.
3. **Low (do soon):** enable GitHub Pages "Enforce HTTPS" (VULN-002); add a
   `postcss` override or track the Next bump (VULN-001).
4. **Low (backlog / optional):** `<meta>` CSP + referrer policy (VULN-002),
   SHA-pin Actions (VULN-004). VULN-003 needs action only if the content model
   changes.

## Preventative recommendations ("make it stick")

- **Secret-blocking pre-commit hook:** add a `.claude/settings.json`
  `PreToolUse` hook (or a git pre-commit hook) that blocks committing `.env`
  files and obvious secret patterns. Low effort, prevents the most common real
  leak.
- **SCA in CI — BACKLOG (was added, then reverted):** an `npm audit` workflow +
  Dependabot were wired in on 2026-06-30 but removed after they exposed an
  unrelated `npm ci`/lockfile failure on the Linux runner. Re-add once the
  lockfile is regenerated on Linux (or CI uses `npm install`), so the audit
  check starts from green. Until then, run `npm audit` locally before releases.
- **Diff-scoped review going forward:** run `/security-review` on PRs/branches
  before merging — it's the right granularity now that the baseline is clean.
- **Document the trust boundary:** note in `docs/content-authoring.md` that
  `content/` is trusted, build-time input; if that ever changes, re-open
  VULN-003 and add MDX sanitization.
- **Re-run this audit** whenever the stack gains a server surface (auth, an API
  route, a form backend, a comments system) — that's the moment the N/A phases
  above stop being N/A.
