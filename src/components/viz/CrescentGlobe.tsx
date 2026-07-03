"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { VizFrame } from "./VizFrame";
import {
  loadCrescentGrid,
  loadEveningIndex,
  loadLand,
  ZONE_LEGEND,
  ZONE_HEX,
  type CrescentGrid,
  type EveningIndexEntry,
  type Polyline,
} from "./crescent-data";

/**
 * Flagship 3D globe of global crescent visibility. It only *displays* the
 * precomputed zone grids from `public/viz-data/` — no runtime astronomy — so the
 * render carries no compute burden. The heavy `three`/r3f scene is lazy-loaded
 * (`ssr: false`) and only on this page. When the visitor prefers reduced motion
 * or WebGL is unavailable, it falls back to a static 2D equirectangular map of
 * the same data. See docs/visualizations.md.
 */

// Lazy: keeps `three` out of every other page's bundle and out of static export.
const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => <SceneMessage>loading globe…</SceneMessage>,
});

type Mode = "loading" | "3d" | "2d" | "error";

export function CrescentGlobe() {
  const [evenings, setEvenings] = useState<EveningIndexEntry[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const [grid, setGrid] = useState<CrescentGrid | null>(null);
  const [land, setLand] = useState<Polyline[]>([]);
  const [error, setError] = useState(false);

  // 3D vs static: subscribe to the reduced-motion query (SSR-safe, and updates
  // if the user toggles the OS setting). WebGL support is folded in.
  const interactive = useSyncExternalStore(
    subscribeMotion,
    getInteractive,
    () => false,
  );

  // Load the index, default to the first evening.
  useEffect(() => {
    let alive = true;
    loadEveningIndex()
      .then((list) => {
        if (!alive) return;
        setEvenings(list);
        setDate(list[0]?.date ?? null);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  // Load the country borders once (static; shared by the 3D and 2D views).
  useEffect(() => {
    let alive = true;
    loadLand()
      .then((lines) => alive && setLand(lines))
      .catch(() => {}); // geography is a nicety — don't fail the globe over it
    return () => {
      alive = false;
    };
  }, []);

  // Load the selected evening's grid.
  useEffect(() => {
    if (!date) return;
    let alive = true;
    loadCrescentGrid(date)
      .then((g) => alive && setGrid(g))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [date]);

  // Treat the grid as stale until it matches the selected evening, so switching
  // evenings shows "loading" without a synchronous setState in an effect.
  const activeGrid = grid && grid.date === date ? grid : null;

  const mode: Mode = error
    ? "error"
    : !activeGrid
      ? "loading"
      : interactive
        ? "3d"
        : "2d";

  return (
    <VizFrame label="crescent-globe · global visibility" className="my-8">
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-mono text-sm">
          <label className="flex items-center gap-2">
            <span className="text-xs text-muted">new-moon evening</span>
            <select
              value={date ?? ""}
              onChange={(e) => setDate(e.target.value)}
              disabled={evenings.length === 0}
              className="rounded border border-border bg-bg-subtle px-2 py-1.5 text-foreground"
              aria-label="New-moon evening"
            >
              {evenings.map((e) => (
                <option key={e.date} value={e.date}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
          <Legend />
        </div>

        <figure
          className="relative aspect-square w-full overflow-hidden rounded border border-border bg-[#05080d] sm:aspect-[16/10]"
          aria-label={`Global crescent visibility${date ? ` for the evening of ${date}` : ""}`}
        >
          {mode === "loading" && <SceneMessage>computing zones…</SceneMessage>}
          {mode === "error" && (
            <SceneMessage>global visibility data unavailable</SceneMessage>
          )}
          {mode === "3d" && activeGrid && (
            <GlobeScene grid={activeGrid} land={land} />
          )}
          {mode === "2d" && activeGrid && (
            <StaticCrescentMap grid={activeGrid} land={land} />
          )}
        </figure>

        <figcaption className="mt-3 font-mono text-xs text-faint">
          {mode === "2d"
            ? "static map (reduced motion / no WebGL) — "
            : "drag to rotate — "}
          precomputed at build time from the Odeh (2004) criterion.
        </figcaption>
      </div>
    </VizFrame>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {ZONE_LEGEND.map((z) => (
        <li key={z.code} className="flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: z.hex }}
            aria-hidden
          />
          <span className="text-muted">
            {z.code} · {z.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SceneMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-muted">
      {children}
    </div>
  );
}

/** Shared zone hexes decoded once to RGB triples for the canvas ImageData. */
const ZONE_RGB = ZONE_HEX.map(
  (hex) =>
    [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ] as const,
);

/** 2D equirectangular fallback drawn to a plain canvas (no WebGL). */
function StaticCrescentMap({
  grid,
  land,
}: {
  grid: CrescentGrid;
  land: Polyline[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(grid.nLon, grid.nLat);
    for (let la = 0; la < grid.nLat; la++) {
      // Image row 0 is the top; grid row 0 is the southernmost latitude.
      const row = grid.nLat - 1 - la;
      for (let lo = 0; lo < grid.nLon; lo++) {
        const z = grid.zones[la * grid.nLon + lo];
        const [r, g, b] = ZONE_RGB[z] ?? ZONE_RGB[4];
        const p = (row * grid.nLon + lo) * 4;
        img.data[p] = r;
        img.data[p + 1] = g;
        img.data[p + 2] = b;
        img.data[p + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [grid]);

  // Borders overlaid as crisp SVG (viewBox spans the grid's lon/lat extent).
  const latSpan = (grid.nLat - 1) * grid.step;
  const lonSpan = grid.nLon * grid.step;
  const points = (line: Polyline) =>
    line
      .map(
        ([lon, lat]) => `${lon - grid.lonMin},${grid.latMin + latSpan - lat}`,
      )
      .join(" ");

  return (
    <div className="absolute inset-0">
      <canvas
        ref={ref}
        width={grid.nLon}
        height={grid.nLat}
        role="img"
        className="h-full w-full [image-rendering:pixelated]"
        aria-label={`Static global crescent visibility map for the evening of ${grid.date}`}
      />
      <svg
        viewBox={`0 0 ${lonSpan} ${latSpan}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        {land.map((line, i) => (
          <polyline
            key={i}
            points={points(line)}
            fill="none"
            stroke="#6b8a86"
            strokeWidth="0.3"
            opacity="0.6"
          />
        ))}
      </svg>
    </div>
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Client snapshot: interactive when motion is allowed and WebGL exists. */
function getInteractive(): boolean {
  return !window.matchMedia(REDUCED_MOTION).matches && hasWebGL();
}

let webglMemo: boolean | undefined;
function hasWebGL(): boolean {
  if (webglMemo === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglMemo = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webglMemo = false;
    }
  }
  return webglMemo;
}
