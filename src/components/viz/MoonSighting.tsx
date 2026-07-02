"use client";

import { useMemo, useState } from "react";

/**
 * Interactive illustration of the Odeh (2004) lunar-crescent visibility
 * criterion — the same astronomical test behind the AlSalah Hijri calendar.
 *
 * Odeh's visibility parameter `q` (`V` in the paper, Eq. 2) is computed from the
 * topocentric arc of vision (ARCV, the altitude difference between the Moon and
 * the Sun) and the crescent width `W` in arcminutes:
 *
 *   q = ARCV − (7.1651 − 6.3226·W + 0.7319·W² − 0.1018·W³)
 *
 * and classified into four zones (A–D). This is a teaching visual, not the
 * production engine: it lets you scrub ARCV and W and watch which zone the new
 * crescent falls into. Reference: Odeh, M. (2004), "New Criterion for Lunar
 * Crescent Visibility", Experimental Astronomy 18, 39–64.
 */

type Zone = {
  code: "A" | "B" | "C" | "D";
  label: string;
  color: string;
  min: number; // inclusive lower bound on q
};

// Ordered high → low; first match wins.
const ZONES: Zone[] = [
  {
    code: "A",
    label: "Visible to the naked eye",
    color: "var(--accent-bright)",
    min: 5.65,
  },
  {
    code: "B",
    label: "Visible under perfect conditions",
    color: "var(--cyan)",
    min: 2.0,
  },
  {
    code: "C",
    label: "Visible only with optical aid",
    color: "var(--amber)",
    min: -0.96,
  },
  { code: "D", label: "Not visible", color: "var(--red)", min: -Infinity },
];

function classify(q: number): Zone {
  return ZONES.find((z) => q >= z.min) ?? ZONES[ZONES.length - 1];
}

function odehQ(arcv: number, w: number): number {
  // Odeh (2004) Eq. 2 threshold polynomial (was Yallop's 11.8371 by mistake).
  const threshold = 7.1651 - 6.3226 * w + 0.7319 * w * w - 0.1018 * w * w * w;
  return arcv - threshold;
}

export function MoonSighting() {
  const [arcv, setArcv] = useState(10); // degrees
  const [w, setW] = useState(0.6); // arcminutes

  const q = useMemo(() => odehQ(arcv, w), [arcv, w]);
  const zone = classify(q);

  // Geometry for the little sky diagram (viewBox 0 0 300 160).
  const horizonY = 120;
  // Map ARCV 0–20° onto vertical pixels above the horizon.
  const moonY = horizonY - (arcv / 20) * 100;
  const moonX = 210;
  const sunX = 150;
  const sunY = horizonY + 26; // just below the horizon
  // Crescent thinness: bigger W → fatter crescent. Offset the shadow disc.
  const moonR = 16;
  const shadowOffset = moonR * (1 - Math.min(w / 1.2, 1)) + moonR * 0.35;

  // Position of the q marker on the −8…+12 scale.
  const qMin = -8;
  const qMax = 12;
  const qPct = Math.max(0, Math.min(1, (q - qMin) / (qMax - qMin))) * 100;

  return (
    <div className="my-8 overflow-hidden rounded-[var(--radius-base)] border border-border bg-panel">
      <div className="flex items-center gap-2 border-b border-border bg-bg-subtle px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-red/80" />
          <span className="size-3 rounded-full bg-amber/80" />
          <span className="size-3 rounded-full bg-accent/80" />
        </span>
        <span className="ml-2 font-mono text-xs text-muted">
          crescent-visibility · odeh (2004)
        </span>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
        {/* Sky diagram. */}
        <div>
          <svg
            viewBox="0 0 300 160"
            className="w-full rounded border border-border bg-[#070b09]"
            role="img"
            aria-label={`Crescent at arc of vision ${arcv} degrees, width ${w} arcminutes — zone ${zone.code}, ${zone.label}`}
          >
            {/* horizon */}
            <line
              x1="0"
              y1={horizonY}
              x2="300"
              y2={horizonY}
              stroke="var(--border-strong)"
              strokeWidth="1"
            />
            <text
              x="8"
              y={horizonY + 16}
              fill="var(--faint)"
              fontSize="9"
              fontFamily="monospace"
            >
              horizon
            </text>

            {/* sun (below horizon) */}
            <circle
              cx={sunX}
              cy={sunY}
              r="12"
              fill="var(--amber)"
              opacity="0.35"
            />
            <text
              x={sunX - 10}
              y={sunY + 26}
              fill="var(--faint)"
              fontSize="9"
              fontFamily="monospace"
            >
              sun
            </text>

            {/* arc-of-vision guide */}
            <line
              x1={moonX}
              y1={horizonY}
              x2={moonX}
              y2={moonY}
              stroke="var(--accent-dim)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* crescent moon: lit disc with an offset shadow disc punched out */}
            <defs>
              <mask id="crescent-mask">
                <rect x="0" y="0" width="300" height="160" fill="black" />
                <circle cx={moonX} cy={moonY} r={moonR} fill="white" />
                <circle
                  cx={moonX - shadowOffset}
                  cy={moonY - 2}
                  r={moonR}
                  fill="black"
                />
              </mask>
            </defs>
            <circle
              cx={moonX}
              cy={moonY}
              r={moonR}
              fill={zone.color}
              mask="url(#crescent-mask)"
            />
          </svg>
        </div>

        {/* Controls + readout. */}
        <div className="flex flex-col justify-center gap-4 font-mono text-sm">
          <label className="block">
            <span className="text-muted">
              arc of vision (ARCV):{" "}
              <span className="text-accent-bright">{arcv.toFixed(1)}°</span>
            </span>
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={arcv}
              onChange={(e) => setArcv(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--accent)]"
              aria-label="Arc of vision in degrees"
            />
          </label>

          <label className="block">
            <span className="text-muted">
              crescent width (W):{" "}
              <span className="text-accent-bright">{w.toFixed(2)}′</span>
            </span>
            <input
              type="range"
              min={0.1}
              max={1.2}
              step={0.05}
              value={w}
              onChange={(e) => setW(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--accent)]"
              aria-label="Crescent width in arcminutes"
            />
          </label>

          <div className="rounded border border-border bg-bg-subtle p-3">
            <p className="text-muted">
              q = <span className="text-foreground">{q.toFixed(2)}</span>
            </p>
            {/* q scale with the four zones and a live marker */}
            <div className="relative mt-2 h-2 rounded-full bg-gradient-to-r from-[var(--red)] via-[var(--amber)] to-[var(--accent-bright)]">
              <span
                className="absolute -top-1 h-4 w-1 -translate-x-1/2 rounded bg-foreground"
                style={{ left: `${qPct}%` }}
                aria-hidden
              />
            </div>
            <p className="mt-3">
              <span
                className="inline-block rounded px-2 py-0.5 text-xs font-semibold text-bg"
                style={{ backgroundColor: zone.color }}
              >
                zone {zone.code}
              </span>{" "}
              <span className="text-foreground">{zone.label}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
