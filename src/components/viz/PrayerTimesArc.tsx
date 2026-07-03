"use client";

import { useMemo } from "react";
import {
  prayerTimes,
  sampleSunPath,
  EXTENDED_PRAYERS,
  STANDARD_PRAYERS,
  type GeoLocation,
  type Madhab,
  type PrayerMethod,
  type PrayerName,
} from "@/lib/astronomy";

/**
 * The Sun's path across one civil day with the prayer schedule marked where the
 * Sun reaches each defining altitude. The AlSalah method shows its full extended
 * schedule; the organisation methods show the standard five prayers + sunrise.
 * Computed live from `src/lib/astronomy.ts` — see docs/prayer-astronomy.md.
 */

const W = 320;
const H = 180;
const PAD_L = 12;
const PLOT_W = W - PAD_L - 12;
const ALT_MIN = -25;
const ALT_MAX = 75;

const LABEL: Record<PrayerName, string> = {
  tahajjud: "Tahajjud",
  fajr: "Fajr",
  shurooq: "Shurooq",
  dhoha: "Dhoha",
  zawaal: "Zawaal",
  dhuhr: "Dhuhr",
  zuhr: "Zuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  ahmar: "Ahmar",
  isha: "Isha",
};

const DEF: Record<PrayerName, string> = {
  tahajjud: "Last third of the night",
  fajr: "Sun at the method's dawn depression",
  shurooq: "Sunrise (upper limb, 0.83°)",
  dhoha: "Sun 3.6° above the horizon",
  zawaal: "Solar noon − 5 min",
  dhuhr: "Solar noon (transit)",
  zuhr: "Solar noon + 5 min",
  asr: "Shadow = N × height + noon shadow",
  maghrib: "Sunset (upper limb, 0.83°) + 1 min",
  ahmar: "Red twilight, sun 15.5° below",
  isha: "Sun at the method's dusk depression",
};

// The obligatory prayers (either noon key) are emphasized; the rest are extras.
const OBLIGATORY = new Set<PrayerName>([
  "fajr",
  "dhuhr",
  "zuhr",
  "asr",
  "maghrib",
  "isha",
]);

// Glyphs marked on the arc (kept to the well-known events to avoid clutter).
const ARC_GLYPH: Partial<Record<PrayerName, string>> = {
  fajr: "F",
  shurooq: "↑",
  dhuhr: "Z",
  zuhr: "Z",
  asr: "A",
  maghrib: "↓",
  isha: "I",
};

function yFor(alt: number): number {
  const clamped = Math.max(ALT_MIN, Math.min(ALT_MAX, alt));
  return H - 8 - ((clamped - ALT_MIN) / (ALT_MAX - ALT_MIN)) * (H - 24);
}

export function PrayerTimesArc({
  location,
  dayStart,
  tz,
  method,
  madhab,
  madhabName,
  cityName,
  dateLabel,
}: {
  location: GeoLocation;
  dayStart: Date;
  tz: string;
  method: PrayerMethod;
  madhab: Madhab;
  madhabName: string;
  cityName: string;
  dateLabel: string;
}) {
  const order = method.extended ? EXTENDED_PRAYERS : STANDARD_PRAYERS;

  const { times, path, horizonY } = useMemo(() => {
    const times = prayerTimes(dayStart, location, method, madhab);
    const samples = sampleSunPath(dayStart, location);
    const path = samples
      .map(
        (s) =>
          `${(PAD_L + s.t * PLOT_W).toFixed(1)},${yFor(s.altitude).toFixed(1)}`,
      )
      .join(" ");
    return { times, path, horizonY: yFor(0) };
  }, [dayStart, location, method, madhab]);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
      }),
    [tz],
  );
  const clock = (d: Date | null) => (d ? fmt.format(d) : "—");
  const fracOf = (d: Date) => (d.getTime() - dayStart.getTime()) / 86_400_000;

  const ariaLabel =
    `Sun path for ${cityName} on ${dateLabel}: ` +
    order.map((p) => `${LABEL[p]} ${clock(times[p])}`).join(", ");

  const arcMarkers = order.filter((p) => p in ARC_GLYPH);

  return (
    <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
      <div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded border border-border bg-[#070b09]"
          role="img"
          aria-label={ariaLabel}
        >
          {/* night below the horizon */}
          <rect
            x="0"
            y={horizonY}
            width={W}
            height={H - horizonY}
            fill="var(--bg)"
            opacity="0.5"
          />
          {/* horizon */}
          <line
            x1="0"
            y1={horizonY}
            x2={W}
            y2={horizonY}
            stroke="var(--border-strong)"
            strokeWidth="1"
          />
          <text
            x="4"
            y={horizonY - 4}
            fill="var(--faint)"
            fontSize="8"
            fontFamily="monospace"
          >
            horizon
          </text>

          {/* sun path */}
          <polyline
            points={path}
            fill="none"
            stroke="var(--amber)"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* prayer markers */}
          {arcMarkers.map((p) => {
            const d = times[p];
            if (!d) return null;
            const x = PAD_L + Math.max(0, Math.min(1, fracOf(d))) * PLOT_W;
            return (
              <g key={p}>
                <line
                  x1={x}
                  y1="8"
                  x2={x}
                  y2={H - 8}
                  stroke="var(--accent-dim)"
                  strokeDasharray="2 3"
                  strokeWidth="0.75"
                  opacity="0.5"
                />
                <circle
                  cx={x}
                  cy={horizonY}
                  r="2.5"
                  fill="var(--accent-bright)"
                />
                <text
                  x={x}
                  y={horizonY - 6}
                  fill="var(--accent-bright)"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {ARC_GLYPH[p]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Schedule in the location's local time. */}
      <div className="flex flex-col justify-center font-mono text-sm">
        <ul className="divide-y divide-border">
          {order.map((p) => {
            const core = OBLIGATORY.has(p);
            return (
              <li
                key={p}
                className="flex items-baseline justify-between py-1"
                title={DEF[p]}
              >
                <span className={core ? "text-foreground" : "text-muted"}>
                  {LABEL[p]}
                </span>
                <span
                  className={`tabular-nums ${core ? "text-accent-bright" : "text-muted"}`}
                >
                  {clock(times[p])}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-faint">
          {method.name} · {madhabName} Asr · local time ({tz})
        </p>
      </div>
    </div>
  );
}
