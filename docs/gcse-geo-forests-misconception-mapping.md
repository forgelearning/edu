# GCSE Geography — Forests Under Threat misconception mapping

Second curated bank of the `gcse-geo` retag, after
`docs/gcse-geo-hazards-misconception-mapping.md`. Same problem, same method:
`gcseGeoSemanticStem()` derives a tag from the first five content words of each
stem, so 40 of the bank's 44 tags were carried by a single question and nothing
aggregated.

## Result

| | before | after |
|---|---|---|
| Distinct tags | 44 | 11 |
| Single-use tags | 40 | 0 |
| Questions per tag | 1.1 | 4.4 |

All 48 questions mapped (44 multiple-choice plus 4 fill-blank twins), keyed by
question id. Every tag has a label and a hand-written starter with a reveal.

Subject-wide `gcse-geo` moves from 405 single-use tags (63.3%) to 368 (57.5%);
the ratchet drops 0.64 to 0.58.

## Grouping decisions worth knowing

The bank covers two biomes, so the recurring judgement is when to split them
and when to merge.

- **Adaptations are split by biome, because the contrast is the point.**
  Rainforest adaptations answer heavy rain, poor soil and competition for
  light; taiga adaptations answer cold and a short growing season. A student
  who muddles them has made a specific error, and one shared "adaptations" tag
  would hide it.
- **Nutrient cycling is merged across both biomes**, because the underlying
  idea is one thing: where the nutrients are stored and what limits the rate.
  The taiga is the mirror image of the rainforest — cold slows decomposition
  instead of poor soil being outrun by it — so the contrast teaches the
  concept rather than splitting it. `06` (taiga NPP) sits here rather than with
  taiga adaptations because its answer is about decomposition and nutrient
  availability.
- **Threats are split by biome**, because the mechanism differs: rainforest
  clearance is mostly direct and commercially driven, whereas taiga damage is
  mostly indirect — acid rain from distant industry, pests surviving warmer
  winters, roads opening access. That asymmetry is itself the misconception.
- **`08` (drought as an indirect threat) is grouped with rainforest causes,
  not nutrient cycling**, even though its answer mentions decomposers. The
  question tests the direct/indirect distinction; the decomposers are the
  mechanism, not the concept being assessed.
- **`27` (GIS) sits with rates rather than with fieldwork skills.** It is
  asked here as how forest loss is measured over time, which is what makes the
  taiga-vs-Amazon comparison in `10` knowable at all.
- **`18` (biodiversity) is grouped with interdependence**, since `24` already
  establishes that a complex web means species depend on each other, and
  biodiversity loss is that idea applied to deforestation.

## Full mapping

| tag | label | questions | ids (GCSE-FOR-…) |
|---|---|---|---|
| `MC-GG-FOR-AGREEMENTS` | Agreements bind only those who sign and enforce them | 7 | 11, FB-03, 17, 20, 30, 41, 42 |
| `MC-GG-FOR-INTERDEPENDENCE` | Remove one species and the whole web is affected | 5 | 01, 04, FB-02, 18, 24 |
| `MC-GG-FOR-LOGGING` | Selective logging still needs roads and still damages | 2 | 13, 21 |
| `MC-GG-FOR-NUTRIENT` | Rainforest nutrients sit in the biomass, not the soil | 5 | 03, 06, 19, 25, 33 |
| `MC-GG-FOR-RATES` | The taiga is being lost faster than people assume | 3 | 07, 10, 27 |
| `MC-GG-FOR-RF-ADAPTATION` | Rainforest adaptations answer light, rain and poor soil | 5 | 02, FB-01, 14, 15, 23 |
| `MC-GG-FOR-RF-CAUSES` | Commercial demand clears more forest than local need | 5 | 08, 16, 26, 37, 38 |
| `MC-GG-FOR-STAKEHOLDERS` | Protection creates losers as well as winners | 2 | 29, 43 |
| `MC-GG-FOR-SUSTAINABLE` | Sustainable use manages the forest, it does not fence it off | 5 | 12, FB-04, 22, 39, 40 |
| `MC-GG-FOR-TAIGA-ADAPTATION` | Taiga adaptations answer cold and a short growing season | 3 | 05, 31, 32 |
| `MC-GG-FOR-TAIGA-THREAT` | Taiga threats are mostly indirect, not direct felling | 6 | 09, 28, 34, 35, 36, 44 |

## Remaining banks

`GCSE-GEO-ENERGY` has since been curated too — see
`docs/gcse-geo-energy-misconception-mapping.md`, which carries the current
list. Nine banks still use auto-generated slugs, largest single-use count
first:

| bank | questions | tags | single-use |
|---|---|---|---|
| `GCSE-GEO-BIOSPHERE` | 45 | 41 | 37 |
| `GCSE-GEO-UKLAND` | 52 | 44 | 36 |
| `GCSE-GEO-UKHUMAN` | 48 | 42 | 36 |
| `GCSE-GEO-INDIA` | 50 | 42 | 35 |
| `GCSE-GEO-SKILLS` | 35 | 35 | 35 |
| `GCSE-GEO-DECISIONS` | 41 | 36 | 31 |
| `GCSE-GEO-RIVERFIELD` | 35 | 32 | 29 |
| `GCSE-GEO-URBFIELD` | 35 | 32 | 29 |
| `GCSE-GEO-URB` | 39 | 33 | 27 |

`GCSE-GEO-DEV` and `GCSE-GEO-ENQUIRY` were curated before this work began.

To curate a bank: remove it from `GCSE_GEO_REMAINING_BANKS`, add an id-keyed
map beside `GCSE_GEO_HAZ_TAGS` and `GCSE_GEO_FOR_TAGS`, add labels and
starters, then lower the `gcse-geo` entry in `TAG_TAXONOMY_SUBJECTS` to the
measured share.
