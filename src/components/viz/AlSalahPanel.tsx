"use client";

import { useMemo, useState } from "react";
import {
  METHODS,
  MADHABS,
  zonedDayStartUTC,
  type MethodKey,
  type Madhab,
  type GeoLocation,
} from "@/lib/astronomy";
import { VizFrame } from "./VizFrame";
import { PrayerTimesArc } from "./PrayerTimesArc";
import { CrescentVisibility } from "./CrescentVisibility";

/**
 * Flagship AlSalah explainer: one shared date + location + method control that
 * drives two live panels — the day's prayer times and that evening's Odeh
 * crescent-visibility verdict — both computed client-side from real ephemeris
 * (`src/lib/astronomy.ts`). This is the interactive counterpart to the real
 * app's calendar engine. See docs/prayer-astronomy.md.
 */

interface City {
  name: string;
  lat: number;
  lon: number;
  tz: string;
}

const CITIES: City[] = [
  { name: "Makkah", lat: 21.4225, lon: 39.8262, tz: "Asia/Riyadh" },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784, tz: "Europe/Istanbul" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, tz: "Africa/Cairo" },
  { name: "London", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  { name: "New York", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { name: "Jakarta", lat: -6.2088, lon: 106.8456, tz: "Asia/Jakarta" },
  { name: "Cape Town", lat: -33.9249, lon: 18.4241, tz: "Africa/Johannesburg" },
];

// A young-crescent evening (new moon 2026-07-14) makes a good default so the
// crescent panel opens on something worth looking at. Constant, not `new Date`,
// to keep the static export's first paint deterministic (no hydration drift).
const DEFAULT_DATE = "2026-07-16";

export function AlSalahPanel() {
  const [cityIdx, setCityIdx] = useState(0);
  const [dateStr, setDateStr] = useState(DEFAULT_DATE);
  const [methodKey, setMethodKey] = useState<MethodKey>("AlSalah");
  const [madhab, setMadhab] = useState<Madhab>("hanafi");

  const city = CITIES[cityIdx];
  const method = METHODS[methodKey];
  const location: GeoLocation = useMemo(
    () => ({ lat: city.lat, lon: city.lon }),
    [city.lat, city.lon],
  );

  const dayStart = useMemo(() => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return zonedDayStartUTC(y, m, d, city.tz);
  }, [dateStr, city.tz]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(`${dateStr}T00:00:00Z`)),
    [dateStr],
  );

  return (
    <div className="my-8 space-y-4">
      {/* Shared controls. */}
      <div className="flex flex-wrap items-end gap-4 rounded-[var(--radius-base)] border border-border bg-panel p-4 font-mono text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">location</span>
          <select
            value={cityIdx}
            onChange={(e) => setCityIdx(Number(e.target.value))}
            className="rounded border border-border bg-bg-subtle px-2 py-1.5 text-foreground"
            aria-label="Location"
          >
            {CITIES.map((c, i) => (
              <option key={c.name} value={i}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">date</span>
          <input
            type="date"
            value={dateStr}
            // Clearing the input yields "" — keep the last valid date instead
            // of feeding an Invalid Date into the ephemeris.
            onChange={(e) => e.target.value && setDateStr(e.target.value)}
            className="rounded border border-border bg-bg-subtle px-2 py-1.5 text-foreground [color-scheme:dark]"
            aria-label="Date"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">method</span>
          <select
            value={methodKey}
            onChange={(e) => setMethodKey(e.target.value as MethodKey)}
            className="rounded border border-border bg-bg-subtle px-2 py-1.5 text-foreground"
            aria-label="Method"
          >
            {(Object.keys(METHODS) as MethodKey[]).map((k) => (
              <option key={k} value={k}>
                {METHODS[k].name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">madhab</span>
          <select
            value={madhab}
            onChange={(e) => setMadhab(e.target.value as Madhab)}
            className="rounded border border-border bg-bg-subtle px-2 py-1.5 text-foreground"
            aria-label="Madhab"
          >
            {(Object.keys(MADHABS) as Madhab[]).map((k) => (
              <option key={k} value={k}>
                {MADHABS[k].name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <VizFrame label={`prayer-times · ${city.name.toLowerCase()}`}>
        <PrayerTimesArc
          location={location}
          dayStart={dayStart}
          tz={city.tz}
          method={method}
          madhab={madhab}
          madhabName={MADHABS[madhab].name}
          cityName={city.name}
          dateLabel={dateLabel}
        />
      </VizFrame>

      <VizFrame label="crescent-visibility · odeh (2004)">
        <CrescentVisibility
          location={location}
          dayStart={dayStart}
          cityName={city.name}
          dateLabel={dateLabel}
        />
      </VizFrame>
    </div>
  );
}
