# GCSE Geography — People and the Biosphere misconception mapping

Fourth curated bank of the `gcse-geo` retag, after Hazardous Earth, Forests
Under Threat and Consuming Energy Resources. Same cause:
`gcseGeoSemanticStem()` derives a tag from the first five content words of each
stem, so 37 of the bank's 41 tags sat on a single question.

## Result

| | before | after |
|---|---|---|
| Distinct tags | 41 | 13 |
| Single-use tags | 37 | 0 |
| Questions per tag | 1.1 | 3.5 |

All 45 questions mapped (41 multiple-choice plus 4 fill-blank twins), keyed by
question id. Every tag has a label and a hand-written starter with a reveal.

Subject-wide `gcse-geo` moves from 329 single-use tags (51.4%) to 292 (45.6%),
past the halfway point; the ratchet drops 0.52 to 0.46.

## The organising idea: scale

Biosphere questions separate cleanly by the scale at which the cause operates,
and that is what makes the tags diagnostic:

- **Global** — climate sets where biomes are (`DISTRIBUTION`).
- **Local** — rock, relief, drainage and permafrost override the climate zone
  within it (`LOCAL-FACTORS`).
- **Human** — pressure acting on top of both (`DEMAND`, `EXPLOITATION`).

A student who explains a local vegetation change with a global cause has made a
specific, teachable error. One "biomes" tag would hide it.

## Grouping decisions worth knowing

- **Reading a climate graph is split from knowing the pattern.** `20` and `41`
  are graph-skill questions — extracting a range, reading a distribution —
  which is a different failure from not knowing why deserts sit at 30°.
- **`21` (fewer sunshine hours) sits with distribution, not adaptation.** Its
  answer is that light limits photosynthesis, which is climate controlling
  productivity, the same mechanism as the rest of that group.
- **`31` (permafrost) is a local factor, not an adaptation.** The question asks
  what permafrost does to the vegetation — restricts drainage and root depth —
  rather than how a plant copes.
- **`17` (eutrophication) sits with commercial exploitation.** It is the
  downstream consequence of intensive human use, and its starter shares the
  "the damage travels" chain with the dam and groundwater questions.
- **`26` (widening projection gap) stays with population theory** rather than
  in a graph-skills tag, because the point is that the spread represents
  uncertainty about future behaviour — the same argument the Malthus/Boserup
  contrast turns on.
- **`18` and `19` form a valuation pair.** Both are about deciding what an
  ecosystem is worth and acting before the evidence is conclusive, which is a
  different idea from naming the service categories in `SERVICES`.
- **Prefix is `MC-GG-BIO-`**, checked against the `MC-SEP-BIO-*` separate
  science tags — no collision.

## Full mapping

| tag | label | questions | ids (GCSE-BIO-…) |
|---|---|---|---|
| `MC-GG-BIO-ADAPTATION` | Each adaptation answers that biome's limiting factor | 2 | 28, 30 |
| `MC-GG-BIO-CARBON` | Sequestration removes carbon; not emitting only avoids it | 3 | 08, FB-03, 16 |
| `MC-GG-BIO-CLIMATE-GRAPH` | Read the range and the pattern, not one figure | 2 | 20, 41 |
| `MC-GG-BIO-DEMAND` | Consumption per person drives pressure, not head count | 3 | 12, 36, 37 |
| `MC-GG-BIO-DISTRIBUTION` | Climate, not latitude alone, sets where biomes are | 6 | 01, 02, FB-01, 21, 29, 40 |
| `MC-GG-BIO-EXPLOITATION` | Commercial use scales up and pollutes downstream | 4 | 07, 17, 25, 35 |
| `MC-GG-BIO-INDIGENOUS` | Indigenous use is subsistence, not commercial extraction | 2 | 06, 24 |
| `MC-GG-BIO-LOCAL-FACTORS` | Rock, relief and drainage override the climate zone | 5 | 03, 15, 22, 31, 32 |
| `MC-GG-BIO-POPULATION-THEORY` | Malthus predicts collapse; Boserup predicts invention | 7 | 10, 11, FB-04, 26, 27, 38, 39 |
| `MC-GG-BIO-SERVICES` | Provisioning is a product; regulating is a process | 4 | 05, FB-02, 23, 33 |
| `MC-GG-BIO-SOIL` | Clearing vegetation strips the soil, it does not enrich it | 2 | 04, 09 |
| `MC-GG-BIO-STRUCTURE` | Abiotic is non-living, and decomposers are not consumers | 3 | 13, 14, 34 |
| `MC-GG-BIO-VALUATION` | Act on possible serious harm before proof arrives | 2 | 18, 19 |

## Remaining banks

`GCSE-GEO-UKLAND` has since been curated too — see
`docs/gcse-geo-uk-landscape-misconception-mapping.md`, which carries the
current list. Seven banks still use auto-generated slugs, largest single-use
count first:

| bank | questions | tags | single-use |
|---|---|---|---|
| `GCSE-GEO-UKHUMAN` | 48 | 42 | 36 |
| `GCSE-GEO-INDIA` | 50 | 42 | 35 |
| `GCSE-GEO-SKILLS` | 35 | 35 | 35 |
| `GCSE-GEO-DECISIONS` | 41 | 36 | 31 |
| `GCSE-GEO-RIVERFIELD` | 35 | 32 | 29 |
| `GCSE-GEO-URBFIELD` | 35 | 32 | 29 |
| `GCSE-GEO-URB` | 39 | 33 | 27 |

`GCSE-GEO-DEV` and `GCSE-GEO-ENQUIRY` were curated before this work began.

To curate a bank: remove it from `GCSE_GEO_REMAINING_BANKS`, add an id-keyed
map beside the existing `GCSE_GEO_*_TAGS` maps, add labels and starters, then
lower the `gcse-geo` entry in `TAG_TAXONOMY_SUBJECTS` to the measured share.
