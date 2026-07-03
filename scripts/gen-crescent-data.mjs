/**
 * Build-time crescent-visibility grid generator for the 3D globe.
 *
 * Runs under plain Node (24+ strips TypeScript types natively), importing the
 * SAME `crescentAtSunset` from `src/lib/astronomy.ts` that the live panels use —
 * so the globe is baked with identical math, never a drifted copy. For the next
 * N new moons it evaluates Odeh's criterion over an equirectangular lat/lon grid
 * on the evening after conjunction and writes a packed zone grid per evening to
 * `public/viz-data/`. The committed JSON keeps `next build` pure (no compute).
 *
 * The grid is physical, not political: each cell's "civil evening" is
 * approximated from longitude (local midnight ≈ UTC midnight − lon/15h), which
 * is all a global visibility map needs. An accuracy upgrade noted in
 * docs/visualizations.md is to emit this same JSON from the validated Kotlin
 * engine in CI instead — the globe consumes either identically.
 *
 * Usage: `npm run data` (runs `node scripts/gen-crescent-data.mjs`).
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { SearchMoonPhase } from "astronomy-engine";
import { mesh } from "topojson-client";
import { crescentAtSunset } from "../src/lib/astronomy.ts";

const require = createRequire(import.meta.url);

// --- Tunables -------------------------------------------------------------
const N_NEW_MOONS = 8; // new moons; 2 evenings each = 16 grids
const LAT_MIN = -60;
const LAT_MAX = 60;
const LON_MIN = -180;
const LON_MAX = 180;
const STEP = 2; // degrees; ~a few hundred KB per evening
// Zone code → packed byte. 4 = no sunset (polar) / undefined.
const ZONE_BYTE = { A: 0, B: 1, C: 2, D: 3 };

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "viz-data");

/** UTC instant of local midnight for `lon` on the UTC calendar date `d`. */
function localMidnightUTC(d, lon) {
  const utcMidnight = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  );
  return new Date(utcMidnight - lon * 240_000); // lon/15 h → ms
}

/**
 * Emits `land.json`: the world's country borders + coastlines (Natural Earth
 * 110m) as an array of [lon, lat] polylines, for the globe and 2D map to draw as
 * geographic reference. Static (doesn't change per new moon), so it's baked once
 * alongside the zone grids. Coordinates rounded to ~1 km to keep the file small.
 */
async function bakeBorders() {
  const path = require.resolve("world-atlas/countries-110m.json");
  const topo = JSON.parse(await readFile(path, "utf8"));
  const borders = mesh(topo, topo.objects.countries); // GeoJSON MultiLineString
  const round = (v) => Math.round(v * 100) / 100;
  const lines = borders.coordinates.map((line) =>
    line.map(([lon, lat]) => [round(lon), round(lat)]),
  );
  await writeFile(join(OUT_DIR, "land.json"), JSON.stringify({ lines }));
  return lines.length;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * Bakes one evening's zone grid. `eveningDate` is the UTC calendar date whose
 * sunsets we evaluate; per grid cell we take the sunset following that cell's
 * local midnight (approximated from longitude), which is exactly when a young
 * crescent is sought. `ordinal` is 1 for the evening of conjunction, 2 for the
 * next — the classic two-evening ICOP presentation (evening 1 shows the young
 * band, evening 2 the wider visibility once the moon has aged a day).
 */
function bakeEvening(newMoonDate, eveningDate, ordinal) {
  const nLat = Math.round((LAT_MAX - LAT_MIN) / STEP) + 1;
  const nLon = Math.round((LON_MAX - LON_MIN) / STEP);
  const zones = new Uint8Array(nLat * nLon);

  let i = 0;
  for (let la = 0; la < nLat; la++) {
    const lat = LAT_MIN + la * STEP;
    for (let lo = 0; lo < nLon; lo++) {
      const lon = LON_MIN + lo * STEP;
      const dayStart = localMidnightUTC(eveningDate, lon);
      const r = crescentAtSunset(dayStart, { lat, lon });
      zones[i++] = r ? ZONE_BYTE[r.zone.code] : 4;
    }
  }

  return {
    date: isoDate(eveningDate),
    ordinal,
    newMoonUTC: newMoonDate.toISOString(),
    latMin: LAT_MIN,
    lonMin: LON_MIN,
    step: STEP,
    nLat,
    nLon,
    // Base64-packed bytes keep the JSON compact and fast to parse.
    zones: Buffer.from(zones).toString("base64"),
  };
}

function labelFor(date, ordinal) {
  const nice = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${nice} · ${ordinal === 1 ? "1st" : "2nd"} evening`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const start = new Date();

  const nBorders = await bakeBorders();
  console.log(`  baked land.json (${nBorders} border lines)`);

  const evenings = [];

  let cursor = start;
  for (let k = 0; k < N_NEW_MOONS; k++) {
    const newMoon = SearchMoonPhase(0, cursor, 40);
    if (!newMoon) break;
    // Two evenings per new moon: the day of conjunction and the next.
    for (let ordinal = 1; ordinal <= 2; ordinal++) {
      const eveningDate = new Date(
        newMoon.date.getTime() + (ordinal - 1) * 24 * 3600 * 1000,
      );
      const t0 = Date.now();
      const grid = bakeEvening(newMoon.date, eveningDate, ordinal);
      await writeFile(
        join(OUT_DIR, `crescent-${grid.date}.json`),
        JSON.stringify(grid),
      );
      evenings.push({
        date: grid.date,
        ordinal,
        newMoonUTC: grid.newMoonUTC,
        label: labelFor(grid.date, ordinal),
      });
      console.log(
        `  baked crescent-${grid.date}.json (${grid.nLat}×${grid.nLon}) in ${(
          (Date.now() - t0) /
          1000
        ).toFixed(1)}s`,
      );
    }
    // Advance ~2 days past this new moon to find the next.
    cursor = new Date(newMoon.date.getTime() + 2 * 24 * 3600 * 1000);
  }

  await writeFile(
    join(OUT_DIR, "index.json"),
    JSON.stringify({ generatedAt: start.toISOString(), evenings }, null, 2),
  );
  console.log(`✓ wrote ${evenings.length} evening grids + index.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
