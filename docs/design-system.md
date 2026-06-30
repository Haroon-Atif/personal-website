# Design System

Dark, terminal-inspired "clean code" aesthetic: charcoal-green surfaces, a
bright green accent, monospace-forward type, and subtle terminal motifs.

## Tokens

Defined as CSS variables in `src/app/globals.css` and exposed as Tailwind
utilities via `@theme inline`. Key tokens:

| Token               | Utility              | Use                       |
| ------------------- | -------------------- | ------------------------- |
| `--bg`              | `bg-bg`              | page background           |
| `--panel-solid`     | `bg-panel`           | card / window surface     |
| `--border`          | `border-border`      | hairline borders          |
| `--foreground`      | `text-foreground`    | primary text              |
| `--muted`/`--faint` | `text-muted` etc.    | secondary / tertiary text |
| `--accent`          | `text-accent`        | primary green             |
| `--accent-bright`   | `text-accent-bright` | highlights / glow         |
| `--cyan`/`--amber`  | `text-cyan` etc.     | secondary accents         |

Change the whole palette by editing the `:root` variables — utilities follow.

## Typography

- **Mono** (JetBrains Mono, `font-mono`) — default, used for headings, nav,
  labels, code, metrics. `body` defaults to mono.
- **Sans** (Inter, `font-sans`) — long-form reading: article and bio body copy.

## Motifs & helpers (in `globals.css`)

- `.cursor` — blinking block cursor.
- `.glow` / `.glow-box` — green text / box glow for hover & active states.
- Faint grid texture on `body`; on-theme scrollbar and `::selection`.
- A `prefers-reduced-motion` block neutralizes animations site-wide.

## Reusable UI (`src/components/ui/`)

- `Window` — terminal/editor chrome (traffic-light dots + filename).
- `Button` (`ButtonLink`) — `primary` | `ghost`; auto-detects external links.
- `Badge` — mono chip for tags/skills/tech.
- `SectionHeading` — `~/path $ command` prompt + heading.

## Conventions

No global CSS classes for components beyond the motif helpers above — style with
Tailwind utilities inline, matching existing components. Formatting is enforced
by Prettier (`.prettierrc.json`), not by hand.
