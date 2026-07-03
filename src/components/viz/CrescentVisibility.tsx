"use client";

import { useMemo } from "react";
import { crescentAtSunset, type GeoLocation } from "@/lib/astronomy";

/**
 * Odeh (2004) lunar-crescent visibility for one evening and place, computed from
 * real ephemeris via `src/lib/astronomy.ts` — the same helper the build-time
 * globe generator uses. Unlike the old slider toy, you don't scrub the inputs:
 * you pick a date and a city (in `AlSalahPanel`) and watch where that evening's
 * new crescent actually falls among Odeh's four zones.
 */

const ZONE_COLOR: Record<string, string> = {
  A: "var(--accent-bright)",
  B: "var(--cyan)",
  C: "var(--amber)",
  D: "var(--red)",
};

export function CrescentVisibility({
  location,
  dayStart,
  cityName,
  dateLabel,
}: {
  location: GeoLocation;
  /** UTC instant of local midnight for the civil day (see zonedDayStartUTC). */
  dayStart: Date;
  cityName: string;
  dateLabel: string;
}) {
  const result = useMemo(
    () => crescentAtSunset(dayStart, location),
    [dayStart, location],
  );

  if (!result) {
    return (
      <div
        className="flex min-h-40 items-center justify-center p-6 text-center font-mono text-sm text-muted"
        role="img"
        aria-label={`Crescent for ${cityName} on ${dateLabel}: the Sun does not set — no dusk sighting`}
      >
        The Sun doesn&apos;t set here on this date, so there&apos;s no dusk in
        which to sight the crescent.
      </div>
    );
  }

  const { arcv, w, arcl, v, lagMin, zone } = result;
  const color = ZONE_COLOR[zone.code];

  // --- Sky diagram geometry (viewBox 0 0 300 160). ---
  const horizonY = 120;
  const moonR = 16;
  // Map ARCV 0–25° onto vertical pixels above the horizon.
  const moonY = horizonY - Math.max(0, Math.min(arcv / 25, 1)) * 100;
  const moonX = 210;
  const sunX = 150;
  const sunY = horizonY + 26; // below horizon at best time
  // Illuminated fraction from arc of light drives crescent thinness.
  const illum = (1 - Math.cos(arcl * (Math.PI / 180))) / 2;
  const shadowOffset = moonR * (2 - 1.6 * Math.min(illum * 2, 1));

  // V marker on the −8…+12 scale.
  const vPct = Math.max(0, Math.min(1, (v + 8) / 20)) * 100;

  return (
    <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
      {/* Sky diagram. */}
      <div>
        <svg
          viewBox="0 0 300 160"
          className="w-full rounded border border-border bg-[#070b09]"
          role="img"
          aria-label={`Crescent for ${cityName} on ${dateLabel}: arc of vision ${arcv.toFixed(
            1,
          )} degrees, width ${w.toFixed(2)} arcminutes — zone ${zone.code}, ${
            zone.label
          }`}
        >
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

          {/* sun, below the horizon at best time */}
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

          {/* crescent: lit disc with an offset shadow disc masked out */}
          <defs>
            <mask id="crescent-vis-mask">
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
            fill={color}
            mask="url(#crescent-vis-mask)"
          />
        </svg>
      </div>

      {/* Readout + verdict. */}
      <div className="flex flex-col justify-center gap-3 font-mono text-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <Stat
            label="ARCV"
            value={`${arcv.toFixed(1)}°`}
            hint="arc of vision"
          />
          <Stat label="W" value={`${w.toFixed(2)}′`} hint="crescent width" />
          <Stat
            label="ARCL"
            value={`${arcl.toFixed(1)}°`}
            hint="arc of light"
          />
          <Stat
            label="lag"
            value={`${lagMin >= 0 ? "+" : ""}${lagMin.toFixed(0)}m`}
            hint="moonset − sunset"
          />
        </dl>

        <div className="rounded border border-border bg-bg-subtle p-3">
          <p className="text-muted">
            V = <span className="text-foreground">{v.toFixed(2)}</span>
          </p>
          <div className="relative mt-2 h-2 rounded-full bg-gradient-to-r from-[var(--red)] via-[var(--amber)] to-[var(--accent-bright)]">
            <span
              className="absolute -top-1 h-4 w-1 -translate-x-1/2 rounded bg-foreground"
              style={{ left: `${vPct}%` }}
              aria-hidden
            />
          </div>
          <p className="mt-3">
            <span
              className="inline-block rounded px-2 py-0.5 text-xs font-semibold text-bg"
              style={{ backgroundColor: color }}
            >
              zone {zone.code}
            </span>{" "}
            <span className="text-foreground">{zone.label}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div>
      <dt className="text-muted" title={hint}>
        {label}
      </dt>
      <dd className="text-accent-bright">{value}</dd>
    </div>
  );
}
