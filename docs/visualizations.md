# Project Visualizations

Some projects deserve more than a write-up — an interactive visualization on
their detail page. This is the "click a card → open a different page → see a
visualization of the project" flow (e.g. the moon-sighting calculation behind
the AlSalah prayer-times app).

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
content/projects/<slug>.mdx   ──references──▶  <MoonSighting />
                                                    │
src/components/viz/MoonSighting.tsx  ◀──registered──┤
src/components/viz/index.ts (vizComponents)         │
src/components/mdx/mdx-components.tsx ◀──spread──────┘
```

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
   import { MoonSighting } from "./MoonSighting";
   import { PacketFlow } from "./PacketFlow";

   export const vizComponents = { MoonSighting, PacketFlow } satisfies MDXComponents;
   ```

3. Reference it from the project's MDX body:

   ```mdx
   ## How it works

   <PacketFlow />
   ```

That's it — the component appears on `/projects/<slug>`.

## Worked example: `MoonSighting`

`src/components/viz/MoonSighting.tsx` illustrates the **Odeh (2004)** lunar
crescent-visibility criterion — the same astronomy that decides Hijri month
boundaries in AlSalah. Two sliders (arc of vision `ARCV` and crescent width `W`)
feed the visibility parameter

```
q = ARCV − (11.8371 − 6.3226·W + 0.7319·W² − 0.1018·W³)
```

which is classified into Odeh's four visibility zones (A–D) and drawn as a
crescent above the horizon plus a live position on the `q` scale. It's a
teaching visual, not the production engine.

## Conventions

- **Keep it dependency-light.** The site ships no animation library on purpose;
  prefer SVG/canvas + a little React state, matching `HoverCard`/`Typewriter`.
- **Accessibility:** give the visual an `aria-label` that reflects its live
  state (the tests assert against `MoonSighting`'s), and label every control.
- **Static-safe:** no data fetching at runtime; everything computes in-browser
  or is baked in at build time.
- Visualizations are covered by E2E tests — see `docs/testing.md`.
