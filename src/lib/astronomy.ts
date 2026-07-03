/**
 * Shared astronomy helper — the single place where AlSalah's teaching math
 * lives. Both the client visualizations (`PrayerTimesArc`, `CrescentVisibility`,
 * `CrescentGlobe`) and the build-time data generator
 * (`scripts/gen-crescent-data.mjs`) import from here, so prayer-time and
 * crescent-visibility numbers can never drift between "what the globe was baked
 * with" and "what a panel computes live".
 *
 * Thin wrapper over `astronomy-engine` (Don Cross, MIT, ~arcminute accuracy).
 * It is NOT the production Kotlin engine behind the real app — it is accurate
 * enough for a visitor to see how prayer times and the Odeh (2004) crescent
 * criterion actually behave. See docs/prayer-astronomy.md.
 */

import {
  Body,
  Observer,
  SearchRiseSet,
  SearchAltitude,
  SearchHourAngle,
  Equator,
  Horizon,
  Elongation,
} from "astronomy-engine";

// astronomy-engine takes numeric direction flags: +1 = rising/ascending event,
// -1 = setting/descending event.
const RISE = +1;
const SET = -1;

const DEG = Math.PI / 180;
const MIN = 60_000; // ms per minute
// Moon's mean apparent semi-diameter (arcminutes), used in Bruin's crescent
// width formula — the fixed value AlSalah's OdehCriterion uses.
const MOON_SD_ARCMIN = 15.5;
// astronomy-engine's SearchRiseSet already models the geometric horizon dip
// (solar/lunar semidiameter + mean refraction, ~0.83°) at ground level.

export interface GeoLocation {
  lat: number;
  lon: number;
}

// ---------------------------------------------------------------------------
// Prayer times
// ---------------------------------------------------------------------------

/**
 * A twilight convention: the Sun-depression angles (degrees below the horizon)
 * for Fajr and Isha. AlSalah fixes both at 18° and adds an extended schedule;
 * the others are the common organisation conventions (five prayers + sunrise).
 * Asr is NOT part of the method — it is chosen separately by madhab.
 */
export interface PrayerMethod {
  name: string;
  fajrAngle: number;
  ishaAngle: number;
  /** AlSalah's extended schedule (adds Tahajjud, Dhoha, Zawaal, Ahmar, …). */
  extended: boolean;
}

export const METHODS = {
  AlSalah: { name: "AlSalah", fajrAngle: 18, ishaAngle: 18, extended: true },
  MWL: {
    name: "Muslim World League",
    fajrAngle: 18,
    ishaAngle: 17,
    extended: false,
  },
  ISNA: {
    name: "ISNA (North America)",
    fajrAngle: 15,
    ishaAngle: 15,
    extended: false,
  },
  Egypt: {
    name: "Egyptian Authority",
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    extended: false,
  },
  Karachi: {
    name: "University of Karachi",
    fajrAngle: 18,
    ishaAngle: 18,
    extended: false,
  },
} satisfies Record<string, PrayerMethod>;

export type MethodKey = keyof typeof METHODS;

/**
 * Madhab selects only the Asr shadow ratio (Hanafi = 2, everyone else = 1),
 * independent of the twilight method. ASCII names keep the mono UI font happy.
 */
export type Madhab = "hanafi" | "standard";

export const MADHABS = {
  hanafi: { name: "Hanafi", asrFactor: 2 },
  standard: { name: "Standard (Shafi'i / Maliki / Hanbali)", asrFactor: 1 },
} satisfies Record<Madhab, { name: string; asrFactor: number }>;

/** Red-twilight (shafaq ahmar) depression, used in AlSalah's extended set. */
const AHMAR_ANGLE = 15.5;
/** Sun altitude above the horizon for Dhoha ("height of a spear"). */
const DHOHA_ANGLE = 3.6;
/** Minutes subtracted from / added to solar noon for Zawaal / Zuhr. */
const ZAWAAL_DELTA_MIN = 5;

export type PrayerName =
  | "tahajjud"
  | "fajr"
  | "shurooq"
  | "dhoha"
  | "zawaal"
  | "dhuhr"
  | "zuhr"
  | "asr"
  | "maghrib"
  | "ahmar"
  | "isha";

export type PrayerTimes = Record<PrayerName, Date | null>;

/** Display order for AlSalah's extended schedule. */
export const EXTENDED_PRAYERS: PrayerName[] = [
  "tahajjud",
  "fajr",
  "shurooq",
  "dhoha",
  "zawaal",
  "zuhr",
  "asr",
  "maghrib",
  "ahmar",
  "isha",
];

/** Display order for the standard organisation methods. */
export const STANDARD_PRAYERS: PrayerName[] = [
  "fajr",
  "shurooq",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

/**
 * The UTC instant of local midnight (00:00) in `tz` on calendar day `y-m-d`.
 * Lets us anchor a "civil day" for a city without bundling a timezone database:
 * `Intl` already carries the zone rules in every browser and in Node.
 */
export function zonedDayStartUTC(
  y: number,
  m: number,
  d: number,
  tz: string,
): Date {
  const guess = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const offsetMs = tzOffsetMs(guess, tz);
  return new Date(guess.getTime() - offsetMs);
}

/** Offset (ms) that `tz` is ahead of UTC at the given instant. */
function tzOffsetMs(instant: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  // Interpret the wall-clock reading as if it were UTC, then diff.
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") === 24 ? 0 : get("hour"),
    get("minute"),
    get("second"),
  );
  return asUTC - instant.getTime();
}

/**
 * The prayer schedule for the civil day starting at `dayStart` (UTC instant of
 * local 00:00 — see `zonedDayStartUTC`). Fajr/Isha use the `method`'s depression
 * angles; Asr uses the `madhab` shadow ratio (Hanafi = 2, otherwise 1); Maghrib
 * carries AlSalah's +1 min iftar pad. The extended fields (tahajjud, dhoha,
 * zawaal, zuhr, ahmar) are always computed but only displayed for the AlSalah
 * method. Events that don't occur (high-latitude twilight that never ends) come
 * back `null` → "—".
 */
export function prayerTimes(
  dayStart: Date,
  { lat, lon }: GeoLocation,
  method: PrayerMethod = METHODS.AlSalah,
  madhab: Madhab = "hanafi",
): PrayerTimes {
  const obs = new Observer(lat, lon, 0);
  const asrFactor = MADHABS[madhab].asrFactor;

  const transit = SearchHourAngle(Body.Sun, obs, 0, dayStart, +1);
  const noon = transit ? transit.time.date : null;

  const sunrise = SearchRiseSet(Body.Sun, obs, RISE, dayStart, 1)?.date ?? null;
  const sunset = SearchRiseSet(Body.Sun, obs, SET, dayStart, 1)?.date ?? null;

  const fajr =
    SearchAltitude(Body.Sun, obs, RISE, dayStart, 1, -method.fajrAngle)?.date ??
    null;
  const dhoha =
    SearchAltitude(Body.Sun, obs, RISE, dayStart, 1, DHOHA_ANGLE)?.date ?? null;

  // Evening twilight: search the Sun descending from the transit.
  const evStart = noon ?? dayStart;
  const ahmar =
    SearchAltitude(Body.Sun, obs, SET, evStart, 1, -AHMAR_ANGLE)?.date ?? null;
  const isha =
    SearchAltitude(Body.Sun, obs, SET, evStart, 1, -method.ishaAngle)?.date ??
    null;

  let asr: Date | null = null;
  if (noon) {
    // Asr: object's shadow reaches asrFactor × height plus its noon shadow —
    // cot(h_asr) = asrFactor + tan|lat − dec|.
    const sunDec = Equator(Body.Sun, noon, obs, true, true).dec;
    const cot = asrFactor + Math.tan(Math.abs(lat - sunDec) * DEG);
    const hAsr = Math.atan(1 / cot) / DEG;
    asr = SearchAltitude(Body.Sun, obs, SET, noon, 1, hAsr)?.date ?? null;
  }

  // Tahajjud: start of the last third of the night (yesterday's sunset → Fajr).
  let tahajjud: Date | null = null;
  if (fajr) {
    const prevDay = new Date(dayStart.getTime() - 86_400_000);
    const ySunset = SearchRiseSet(Body.Sun, obs, SET, prevDay, 1)?.date ?? null;
    if (ySunset) {
      tahajjud = new Date(
        fajr.getTime() - (fajr.getTime() - ySunset.getTime()) / 3,
      );
    }
  }

  return {
    tahajjud,
    fajr,
    shurooq: sunrise,
    dhoha,
    zawaal: noon ? new Date(noon.getTime() - ZAWAAL_DELTA_MIN * MIN) : null,
    dhuhr: noon,
    zuhr: noon ? new Date(noon.getTime() + ZAWAAL_DELTA_MIN * MIN) : null,
    asr,
    maghrib: sunset ? new Date(sunset.getTime() + MIN) : null,
    ahmar,
    isha,
  };
}

/**
 * Sun altitude/azimuth sampled across the civil day, for drawing the day arc.
 * `n` samples span [dayStart, dayStart + 24h].
 */
export interface SunSample {
  /** 0..1 fraction of the day. */
  t: number;
  /** Apparent altitude in degrees (negative below horizon). */
  altitude: number;
  /** Azimuth in degrees, 0 = north, clockwise. */
  azimuth: number;
}

export function sampleSunPath(
  dayStart: Date,
  { lat, lon }: GeoLocation,
  n = 96,
): SunSample[] {
  const obs = new Observer(lat, lon, 0);
  const out: SunSample[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const when = new Date(dayStart.getTime() + t * 86_400_000);
    const eq = Equator(Body.Sun, when, obs, true, true);
    const hor = Horizon(when, obs, eq.ra, eq.dec, "normal");
    out.push({ t, altitude: hor.altitude, azimuth: hor.azimuth });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Crescent visibility — Odeh (2004) criterion
// ---------------------------------------------------------------------------

export type ZoneCode = "A" | "B" | "C" | "D";

export interface CrescentZone {
  code: ZoneCode;
  label: string;
  /** Inclusive lower bound on V. */
  min: number;
}

/**
 * Odeh's four visibility zones, ordered high → low; first match wins. Tier
 * bounds and labels match AlSalah's `OdehCriterion` (month-boundary cutoff is
 * zone B at V ≥ 2.10).
 */
export const ZONES: CrescentZone[] = [
  { code: "A", label: "Visible to the naked eye", min: 5.65 },
  {
    code: "B",
    label: "Visible with optical aid, possibly naked eye",
    min: 2.1,
  },
  { code: "C", label: "Needs a telescope", min: -0.96 },
  { code: "D", label: "Not visible", min: -Infinity },
];

export function classifyZone(v: number): CrescentZone {
  return ZONES.find((z) => v >= z.min) ?? ZONES[ZONES.length - 1];
}

/**
 * Odeh (2004) Eq. 2 visibility parameter from arc of vision (deg) and crescent
 * width (arcminutes). Positive threshold constant is 7.1651 (Odeh), NOT 11.8371
 * (that is Yallop's q — the bug this project's earlier toy shipped with).
 */
export function odehV(arcv: number, w: number): number {
  const threshold = 7.1651 - 6.3226 * w + 0.7319 * w * w - 0.1018 * w * w * w;
  return arcv - threshold;
}

export interface CrescentResult {
  /** Arc of vision: topocentric Moon−Sun altitude at best time (degrees). */
  arcv: number;
  /** Crescent width (arcminutes). */
  w: number;
  /** Arc of light: Moon–Sun elongation (degrees). */
  arcl: number;
  /** Odeh visibility parameter V. */
  v: number;
  /** Minutes the Moon sets after the Sun (moonset lag). Negative → moon-first. */
  lagMin: number;
  zone: CrescentZone;
}

/**
 * Evaluate the Odeh crescent-visibility criterion at a location for the evening
 * of the civil day starting at `dayStart`. Uses Odeh's "best time"
 * `Tb = sunset + (4/9)·lag` (lag = moonset − sunset). Returns `null` when the
 * Sun does not set that day. When the Moon sets before the Sun (`lag ≤ 0`) the
 * crescent is below the horizon at dusk — reported as a strongly negative V.
 */
export function crescentAtSunset(
  dayStart: Date,
  { lat, lon }: GeoLocation,
): CrescentResult | null {
  const obs = new Observer(lat, lon, 0);
  const sunset = SearchRiseSet(Body.Sun, obs, SET, dayStart, 1);
  if (!sunset) return null;

  const moonset = SearchRiseSet(Body.Moon, obs, SET, sunset, 1);
  const lagMs = moonset ? moonset.date.getTime() - sunset.date.getTime() : 0;
  const lagMin = lagMs / 60_000;

  // Best time to look: 4/9 of the way from sunset to moonset.
  const best = new Date(sunset.date.getTime() + (4 / 9) * Math.max(lagMs, 0));

  const sunEq = Equator(Body.Sun, best, obs, true, true);
  const sunHor = Horizon(best, obs, sunEq.ra, sunEq.dec);
  const moonEq = Equator(Body.Moon, best, obs, true, true);
  const moonHor = Horizon(best, obs, moonEq.ra, moonEq.dec);

  const arcv = moonHor.altitude - sunHor.altitude;
  const arcl = Elongation(Body.Moon, best).elongation;

  // Crescent width (arcminutes), Bruin's formula with the Moon's mean apparent
  // semi-diameter (15.5′) — matches AlSalah's OdehCriterion to ~0.01′.
  const w = MOON_SD_ARCMIN * (1 - Math.cos(arcl * DEG));

  // When the Moon sets before the Sun there is no lag and the crescent is
  // already gone at dusk: invisible, exactly as the engine reports.
  const v = lagMin > 0 ? odehV(arcv, w) : -Infinity;

  return { arcv, w, arcl, v, lagMin, zone: classifyZone(v) };
}
