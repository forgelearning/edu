# GCSE Geography — Hazardous Earth misconception mapping

First curated bank of the `gcse-geo` retag. Companion to
`docs/gcse-geo-misconception-taxonomy-draft.md`, which tracks the subject as a
whole, and to `docs/gcse-science-misconception-mapping.md` for the pattern.

## Why this bank needed curating

`gcseGeoSemanticStem()` in `data/forge-data.js` builds a tag from the first
five content words of a question's stem. The result is readable — it passes the
mechanical-tag check because it contains concept words — but it gives almost
every question a tag of its own:

```
MC-GG-HAZ-CORRECT-DEFINITION-ASTHENOSPHERE-CONCEPT
MC-GG-HAZ-STUDENT-MIXES-LITHOSPHERE-ASTHENOSPHERE-KEY-CONCEPT
```

Those are the same misconception under two tags. Nothing aggregates, the
heatmap ranks questions rather than errors, and no starter can attach.

This is worth stating plainly: **a subject can score 0 on the mechanical
ratchet and still have no working taxonomy.** `gcse-geo` did. The two ratchets
measure different failures and both have to be read.

## Result

| | before | after |
|---|---|---|
| Distinct tags | 49 | 16 |
| Single-use tags | 41 | 0 |
| Questions per tag | 1.2 | 3.6 |

All 57 questions in the bank (49 multiple-choice plus 8 fill-blank twins) are
mapped. Every tag has a label in `data/misconception-labels.js` and a
hand-written starter with a reveal in `data/starter-activities.js`.

Subject-wide this takes `gcse-geo` from 446 single-use tags (69.7%) to 405
(63.3%). The ratchet moves from 0.78 to 0.64. The mechanical ratchet is also
closed from 0.996 to 0, since the slug pass had already cleared positional tags
and the loose floor was hiding that.

## Grouping decisions worth knowing

- **Boundary type is the organising idea for tectonics**, not hazard type.
  "Conservative boundaries are less dangerous" (`23`) sits with the boundary
  questions because the error is about what each boundary produces — quakes but
  no volcanoes — rather than about earthquakes as such.
- **Magnitude and death toll are deliberately separated.** `03` (Tohoku 9.0,
  ~18,000 deaths) and `49` (energy per step) share `MAGNITUDE`; Haiti's far
  higher toll at 7.0 is the point of the starter. Exposure questions live in
  `VULNERABILITY` instead.
- **Storm surge questions are grouped by cause, not by case study.** Katrina
  (`07`) and Haiyan (`08`) both sit in `CYCLONE-STRUCTURE` because in both the
  water, not the wind, did the killing.
- **`18` (hurricane vs typhoon) is in `CYCLONE-FORMATION`**, since the naming
  follows the ocean basin the storm forms in.
- **`26` (warmer oceans fuel stronger storms) is in `CYCLONE-FORMATION`, not
  `PROJECTION`.** It tests the mechanism; `PROJECTION` is about why forecasts
  are given as a range.
- **`38` (volcanic aerosols cool the climate) is in `NATURAL-CAUSE`** with
  Milankovitch, not with the volcano questions — the concept being tested is
  natural climate forcing, not eruption style.

## Full mapping

| tag | label | questions | ids (GCSE-HAZ-…) |
|---|---|---|---|
| `MC-GG-HAZ-BOUNDARY` | The boundary type decides which hazard you get | 7 | 01, 02, FB-01, FB-02, 11, 23, 48 |
| `MC-GG-HAZ-CIRCULATION` | Air rises at the Equator and sinks at 30° | 4 | 16, 17, 27, 35 |
| `MC-GG-HAZ-CYCLONE-FORMATION` | Cyclones need warm ocean and the Coriolis effect | 5 | 18, 24, 26, 31, 32 |
| `MC-GG-HAZ-CYCLONE-STRUCTURE` | The storm surge kills more often than the wind | 7 | 07, 08, FB-07, FB-08, 19, 41, 42 |
| `MC-GG-HAZ-EFFECTS` | Primary effects are the shaking itself; secondary follow from it | 2 | 13, 34 |
| `MC-GG-HAZ-EVIDENCE` | Proxy records are indirect and are combined, not read alone | 3 | 21, 28, 37 |
| `MC-GG-HAZ-GREENHOUSE` | The greenhouse effect is natural; the enhanced one is not | 2 | 20, 29 |
| `MC-GG-HAZ-HOTSPOT` | Hotspots sit away from plate boundaries | 2 | 12, 47 |
| `MC-GG-HAZ-MAGNITUDE` | Magnitude is logarithmic and does not set the death toll | 3 | 03, FB-03, 49 |
| `MC-GG-HAZ-NATURAL-CAUSE` | Natural forcing exists but cannot explain recent warming | 2 | 22, 38 |
| `MC-GG-HAZ-OCEAN` | Warming seas expand, and currents move heat polewards | 2 | 36, 39 |
| `MC-GG-HAZ-PROJECTION` | Projections give a range because emissions are a choice | 2 | 30, 40 |
| `MC-GG-HAZ-RESPONSE` | Monitoring forecasts a hazard; it cannot predict the date | 5 | 06, FB-06, 14, 25, 43 |
| `MC-GG-HAZ-STRUCTURE` | Plates slide on the asthenosphere, not on molten core | 3 | 09, 10, 46 |
| `MC-GG-HAZ-VOLCANO` | Magma viscosity decides how explosive an eruption is | 5 | 04, 05, FB-04, FB-05, 33 |
| `MC-GG-HAZ-VULNERABILITY` | Risk is hazard times vulnerability, not hazard size alone | 3 | 15, 44, 45 |

## Remaining banks

Eleven banks still use auto-generated slugs and need the same treatment,
largest single-use count first:

| bank | questions | tags | single-use |
|---|---|---|---|
| `GCSE-GEO-FORESTS` | 48 | 44 | 40 |
| `GCSE-GEO-ENERGY` | 47 | 43 | 39 |
| `GCSE-GEO-BIOSPHERE` | 45 | 41 | 37 |
| `GCSE-GEO-UKLAND` | 52 | 44 | 36 |
| `GCSE-GEO-UKHUMAN` | 48 | 42 | 36 |
| `GCSE-GEO-INDIA` | 50 | 42 | 35 |
| `GCSE-GEO-SKILLS` | 35 | 35 | 35 |
| `GCSE-GEO-DECISIONS` | 41 | 36 | 31 |
| `GCSE-GEO-RIVERFIELD` | 35 | 32 | 29 |
| `GCSE-GEO-URBFIELD` | 35 | 32 | 29 |
| `GCSE-GEO-URB` | 39 | 33 | 27 |

`GCSE-GEO-DEV` and `GCSE-GEO-ENQUIRY` were already curated and are untouched.

To curate a bank: remove it from `GCSE_GEO_REMAINING_BANKS`, add an id-keyed
map beside `GCSE_GEO_HAZ_TAGS`, add labels and starters, then lower the
`gcse-geo` entry in `TAG_TAXONOMY_SUBJECTS` to the measured share.
