/**
 * Client-side loader for the build-time crescent grids in `public/viz-data/`
 * (written by `scripts/gen-crescent-data.mjs`). Decodes the base64-packed zone
 * bytes into a typed grid the globe and its 2D fallback both render.
 */

export interface EveningIndexEntry {
  date: string;
  /** 1 = evening of conjunction, 2 = the next evening. */
  ordinal: number;
  newMoonUTC: string;
  /** Human label, e.g. "14 Jul 2026 · 1st evening". */
  label: string;
}

export interface CrescentGrid {
  date: string;
  newMoonUTC: string;
  latMin: number;
  lonMin: number;
  step: number;
  nLat: number;
  nLon: number;
  /** Flat nLat×nLon zone bytes: 0=A 1=B 2=C 3=D 4=no-sunset. */
  zones: Uint8Array;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function loadEveningIndex(): Promise<EveningIndexEntry[]> {
  const res = await fetch("/viz-data/index.json");
  if (!res.ok) throw new Error(`viz-data index ${res.status}`);
  const json = (await res.json()) as { evenings: EveningIndexEntry[] };
  return json.evenings;
}

/** A border/coastline polyline as [lon, lat] pairs (degrees). */
export type Polyline = [number, number][];

/** World country borders + coastlines (Natural Earth 110m), baked once. */
export async function loadLand(): Promise<Polyline[]> {
  const res = await fetch("/viz-data/land.json");
  if (!res.ok) throw new Error(`viz-data land ${res.status}`);
  const json = (await res.json()) as { lines: Polyline[] };
  return json.lines;
}

export async function loadCrescentGrid(date: string): Promise<CrescentGrid> {
  const res = await fetch(`/viz-data/crescent-${date}.json`);
  if (!res.ok) throw new Error(`viz-data ${date} ${res.status}`);
  const raw = (await res.json()) as Omit<CrescentGrid, "zones"> & {
    zones: string;
  };
  return { ...raw, zones: base64ToBytes(raw.zones) };
}

export const ZONE_LEGEND = [
  { code: "A", label: "naked eye", hex: "#34d399" },
  { code: "B", label: "perfect conditions", hex: "#22d3ee" },
  { code: "C", label: "optical aid", hex: "#f59e0b" },
  { code: "D", label: "not visible", hex: "#ef4444" },
] as const;

/** Ocean-dark fill for zone byte 4 ("no sunset" / polar cells). */
export const NO_SUNSET_HEX = "#0c121a";

/**
 * Zone byte (0–4) → display hex. Single color source for the legend, the 3D
 * point cloud, and the 2D fallback map, so the three can't drift apart.
 */
export const ZONE_HEX: readonly string[] = [
  ...ZONE_LEGEND.map((z) => z.hex),
  NO_SUNSET_HEX,
];
