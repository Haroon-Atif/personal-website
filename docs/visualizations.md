# Project Visualizations

Some projects deserve more than a write-up — an interactive visualization on
their detail page. This is the "click a card → open a different page → see a
visualization of the project" flow (e.g. the prayer-times, crescent-visibility,
and global-crescent globe behind the AlSalah prayer-times app).

The mechanism is deliberately in keeping with the rest of the site: **add a
component, reference it from MDX, done.** No new routes.

## How it works

1. A visualization is a **client component** under `src/components/viz/`
   (it starts with `"use client"` because it's interactive). It must resolve
   entirely in the browser — this is a static export, so there's no server at
   runtime.
2. It's registered by name in `src/components/viz/index.ts` (`vizComponents`).
3. That registry is spread into the MDX component map
   (`src/components/mdx/mdx-components.tsx`), so any project (or blog) MDX body
   can drop the component in by name.
4. A project's card already links to `/projects/<slug>` (see
   `ProjectCard.tsx`); the visualization renders there, inside the write-up.

```
content/projects/<slug>.mdx   ──references──▶  <AlSalahPanel />
                                                    │
src/components/viz/AlSalahPanel.tsx  ◀──registered──┤
src/components/viz/index.ts (vizComponents)         │
src/components/mdx/mdx-components.tsx ◀──spread──────┘
```

Bigger visualizations lean on three shared pieces (all under `src/components/viz/`):

- **`VizFrame`** — the terminal-window chrome (titlebar + traffic lights). Wrap
  any panel in it so every viz looks consistent.
- **`src/lib/astronomy.ts`** — the shared math helper (see below). Keep domain
  computation here, not in components, so panels and any build-time generator
  agree by construction.
- **Build-time data** in `public/viz-data/` — for anything too heavy to compute
  in the browser, precompute a packed JSON at build time and just render it.

## Add a new visualization

1. Create the component:

   ```tsx
   // src/components/viz/PacketFlow.tsx
   "use client";

   export function PacketFlow() {
     // interactive SVG / canvas / state — no external animation library,
     // and honor prefers-reduced-motion for anything decorative.
     return <div>…</div>;
   }
   ```

2. Register it:

   ```ts
   // src/components/viz/index.ts
   import { AlSalahPanel } from "./AlSalahPanel";
   import { PacketFlow } from "./PacketFlow";

   export const vizComponents = {
     AlSalahPanel,
     PacketFlow,
   } satisfies MDXComponents;
   ```

3. Reference it from the project's MDX body:

   ```mdx
   ## How it works

   <PacketFlow />
   ```

That's it — the component appears on `/projects/<slug>`.

## Worked example: `AlSalahPanel` + `CrescentGlobe`

The AlSalah project page carries the flagship visualization. It has three parts,
all fed by the shared helper `src/lib/astronomy.ts` (a thin wrapper over
[`astronomy-engine`](https://github.com/cosinekitty/astronomy)):

- **`AlSalahPanel`** — one shared date + location + method + madhab picker
  driving two live, client-side panels:
  - **`PrayerTimesArc`** — the Sun's path across the day with AlSalah's full
    schedule (Tahajjud, Fajr, Shurooq, Dhoha, Zawaal/Zuhr, Asr, Maghrib, Ahmar,
    Isha) marked where the Sun reaches each defining altitude.
  - **`CrescentVisibility`** — that evening's new-crescent verdict under the
    **Odeh (2004)** criterion, drawn as a crescent above the horizon with an
    `ARCV / W / V` readout and the zone (A–D). The visibility parameter is

    ```
    V = ARCV − (7.1651 − 6.3226·W + 0.7319·W² − 0.1018·W³)
    ```

    Note the constant is **7.1651** (Odeh Eq. 2), not `11.8371` — that value is
    Yallop's `q`, which the earlier toy shipped by mistake.
- **`CrescentGlobe`** — a 3D globe (react-three-fiber, lazy-loaded with
  `next/dynamic` + `ssr: false`) of **global** crescent visibility for the
  evenings after upcoming new moons, with country borders + coastlines
  (`public/viz-data/land.json`, Natural Earth 110m) for geographic reference. It
  _only displays_ precomputed data — no runtime astronomy — and falls back to a
  static 2D canvas map (with the same borders as an SVG overlay) under
  `prefers-reduced-motion` or when WebGL is unavailable.

See `docs/prayer-astronomy.md` for the math itself. These are teaching visuals,
not the production Kotlin engine.

## The shared astronomy helper

`src/lib/astronomy.ts` is the single source of truth for the domain math:

- `prayerTimes(dayStart, {lat,lon}, method, madhab)` → the daily prayer schedule.
- `crescentAtSunset(dayStart, {lat,lon})` → `{ arcv, w, arcl, v, lagMin, zone }`.
- `sampleSunPath`, `zonedDayStartUTC`, `METHODS`, `MADHABS`, `ZONES`, `classifyZone`.

Because it imports only `astronomy-engine` and standard JS (no DOM), **Node 24
runs it directly** (native TypeScript type-stripping), so the build-time
generator imports the _same_ functions the panels use — the globe can never be
baked with drifted math.

## Build-time data generation

`scripts/gen-crescent-data.mjs` (npm `data`) evaluates `crescentAtSunset` over a
2° lat/long grid for the next few new-moon evenings and writes packed,
base64-encoded zone grids to `public/viz-data/crescent-<date>.json` plus an
`index.json`. The output is **committed**, so `next build` stays pure (no compute
at build). Regenerate with `npm run data` when you want fresh/further evenings.

The grid is physical, not political (each cell's civil evening is approximated
from longitude). An accuracy upgrade is to emit the same JSON from the validated
Kotlin engine in CI instead — the globe consumes either identically.

## Conventions

- **Keep it dependency-light.** The site ships no animation library on purpose;
  prefer SVG/canvas + a little React state, matching `HoverCard`/`Typewriter`.
- **Accessibility:** give the visual an `aria-label` that reflects its live
  state (the AlSalah panels' `aria-label`s are what `viz.spec.ts` asserts
  against), and label every control.
- **Static-safe:** no data fetching at runtime; everything computes in-browser
  or is baked in at build time.
- Visualizations are covered by E2E tests — see `docs/testing.md`.
