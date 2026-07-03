# Prayer times & crescent visibility (the AlSalah math)

This is the astronomy behind the AlSalah project visualization
(`src/components/viz/AlSalahPanel.tsx` + `CrescentGlobe.tsx`). All of it lives in
one place — `src/lib/astronomy.ts` — a thin wrapper over
[`astronomy-engine`](https://github.com/cosinekitty/astronomy) (MIT,
~arcminute accuracy).

It **reproduces AlSalah's prayer/crescent _definitions_** (the angles, the madhab
Asr rule, the event set, the Odeh tiers) but computes the Sun/Moon positions with
`astronomy-engine` — it deliberately does **not** port AlSalah's proprietary
(© Sileria, Inc.) solar/lunar engine, which stays private. So the numbers here
match the real app's behaviour to within ~a minute, without publishing the
confidential implementation. It is a **teaching model**, not the production
Kotlin engine.

## Anchoring a civil day

Everything is computed for a "civil day" at a place. `zonedDayStartUTC(y, m, d,
tz)` returns the UTC instant of local midnight using `Intl` (which already
carries timezone rules), so we don't bundle a timezone database. Events are then
searched within the following 24 hours.

## Prayer times — `prayerTimes(dayStart, {lat, lon}, method, madhab)`

Two independent controls:

- **`method`** — the Fajr/Isha twilight depression angles. `AlSalah` fixes both
  at 18° and shows the extended schedule below; `MWL` / `ISNA` / `Egypt` /
  `Karachi` are the organisation conventions and show the standard five prayers
  plus sunrise.
- **`madhab`** — the Asr shadow ratio only (`hanafi` = 2, `standard` = 1),
  independent of the method.

The extended (AlSalah) event set, each the moment the Sun reaches a defining
altitude:

| Event      | Definition                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| `tahajjud` | Start of the last third of the night (yesterday Maghrib → Fajr)                                          |
| `fajr`     | Sun 18° below the horizon (`SearchAltitude`, ascending)                                                  |
| `shurooq`  | Sunrise — upper limb at 0.83° (`SearchRiseSet`)                                                          |
| `dhoha`    | Sun 3.6° above the horizon ("height of a spear")                                                         |
| `zawaal`   | Solar noon − 5 min (`SearchHourAngle` at hour angle 0)                                                   |
| `zuhr`     | Solar noon + 5 min                                                                                       |
| `asr`      | Shadow = N × height + noon shadow; `cot(h) = N + tan\|lat−δ☉\|`, N = 2 Ḥanafī / 1 other; + 30 s ceil pad |
| `maghrib`  | Sunset — upper limb at 0.83°, + 1 min iftar pad                                                          |
| `ahmar`    | Red twilight — Sun 15.5° below the horizon                                                               |
| `isha`     | Sun 18° below the horizon (`SearchAltitude`, descending)                                                 |

At high latitudes a twilight event may not occur — the helper returns `null`,
rendered as "—". (Real apps apply "higher-latitude" rules; the teaching model
deliberately doesn't.)

## Crescent visibility — Odeh (2004)

`crescentAtSunset(dayStart, {lat, lon})` implements the peer-reviewed **Odeh
(2004)** criterion for whether the new lunar crescent is visible at dusk:

1. **Best time** to look: `Tb = sunset + (4/9)·lag`, where `lag = moonset −
sunset`. The moonset is _that evening's_ (searched from 12 h before sunset), so
   on pre-conjunction evenings the lag comes out **negative** — the Moon sets
   before the Sun, the crescent is below the horizon at dusk, and the verdict
   is "not visible" (`V = −∞`), matching the real engine. (Searching only
   _forward_ from sunset was an actual bug here once: it silently picked up the
   next day's moonset and scored the old waning moon at ~3 a.m. as "zone A".)
2. **ARCV** (arc of vision) = topocentric altitude of the Moon minus that of the
   Sun at `Tb`.
3. **ARCL** (arc of light) = topocentric Moon–Sun angular separation (geocentric
   elongation differs by up to ~1° of lunar parallax — enough to move V near a
   zone boundary).
4. **W** (crescent width, arcminutes) = `15.5′ · (1 − cos ARCL)` — Bruin's
   formula with the Moon's mean apparent semi-diameter (15.5′), the fixed value
   AlSalah's `OdehCriterion` uses.
5. **V** (visibility parameter), Odeh Eq. 2:

   ```
   V = ARCV − (7.1651 − 6.3226·W + 0.7319·W² − 0.1018·W³)
   ```

   > The constant is **7.1651** (Odeh). An earlier version of this project used
   > `11.8371`, which is Yallop's `q` — a real bug that shifted every verdict.

6. **Zones** (first match wins, matching AlSalah's tiers): `V ≥ 5.65` → **A**
   (naked eye) · `2.10 ≤ V < 5.65` → **B** (optical aid, possibly naked eye) ·
   `−0.96 ≤ V < 2.10` → **C** (needs a telescope) · `V < −0.96` → **D** (not
   visible). AlSalah's month-boundary cutoff is **B (V ≥ 2.10)**.

Reference: Odeh, M. (2004), "New Criterion for Lunar Crescent Visibility",
_Experimental Astronomy_ 18, 39–64 (`docs/papers/Odeh-Criterion-2004.pdf`).

## The globe's data

`scripts/gen-crescent-data.mjs` runs the **same** `crescentAtSunset` over a
global 2° grid for two evenings after each upcoming new moon — the evening of
conjunction (the young-crescent band) and the next — and writes packed zone
grids to `public/viz-data/`. It also bakes `land.json` (country borders +
coastlines) once. The globe just displays them — see `docs/visualizations.md`
for the wiring.
