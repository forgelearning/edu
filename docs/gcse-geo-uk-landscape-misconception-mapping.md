# GCSE Geography — UK's Evolving Physical Landscape misconception mapping

Fifth curated bank of the `gcse-geo` retag. Same cause as the others:
`gcseGeoSemanticStem()` derives a tag from the first five content words of each
stem, so 36 of the bank's 44 tags sat on a single question.

## Result

| | before | after |
|---|---|---|
| Distinct tags | 44 | 14 |
| Single-use tags | 36 | 0 |
| Questions per tag | 1.2 | 3.7 |

All 52 questions mapped (44 multiple-choice plus 8 fill-blank twins), keyed by
question id. Every tag has a label and a hand-written starter with a reveal.

Subject-wide `gcse-geo` moves from 292 single-use tags (45.6%) to 256 (40.0%);
the ratchet drops 0.46 to 0.40.

## The organising idea: process, not landscape

This bank spans coasts, rivers and glaciation, so the obvious split would be by
landscape. That would be the wrong cut. The errors students actually make are
about **processes**, and several of those processes cross landscapes:

- Weathering and mass movement (`SUBAERIAL`) behave identically whether the
  slope is a sea cliff or a valley side, and the error — confusing breaking
  rock *in place* with carrying it away — is the same in both.
- Rock type (`GEOLOGY`) controls coastal retreat, upland relief and river
  runoff alike.

Splitting those by landscape would have produced three thin tags for one
misconception.

## Grouping decisions worth knowing

- **`48` (sub-aerial process on a sea cliff) is grouped with weathering, not
  with coastal erosion.** That is exactly the distinction the question tests:
  sub-aerial means acting from above, so it belongs with freeze-thaw and mass
  movement even though the setting is a cliff.
- **`33` (cliff retreat rate) sits with the erosion processes** rather than in
  a numeracy tag. It measures the outcome of those processes, and the starter
  runs the calculation alongside naming them.
- **Abrasion and attrition share a tag deliberately.** They are the pair most
  often swapped — one damages the cliff, the other wears the sediment — so the
  starter contrasts them directly rather than treating them separately.
- **`27` (beach narrower after a storm) is grouped with longshore drift**, as
  part of sediment movement along and off the beach, not with coastal
  management.
- **`51` (natural levees) sits with meanders**, since both are floodplain
  deposition driven by where the river loses energy.
- **Prefix is `MC-GG-UKL-`.** Checked against the A-Level `GEO-COAST` tags:
  `CLAUDE.md` records that A-Level geo previously shared `gcse-geo`'s coastal
  tags and ended up pointing a longshore-drift question at a
  headland-formation starter. A distinct prefix keeps that from recurring.

## Full mapping

| tag | label | questions | ids (GCSE-UKLAND-…) |
|---|---|---|---|
| `MC-GG-UKL-COAST-MANAGE` | Groynes protect one beach by starving the next | 6 | 05, FB-05, 13, 14, 35, 37 |
| `MC-GG-UKL-COAST-STRUCTURE` | Rock alignment to the coast decides headlands or coves | 5 | 02, FB-02, 12, 44, 46 |
| `MC-GG-UKL-EROSION-PROCESS` | Abrasion uses the load; attrition wears the load itself | 5 | 01, FB-01, 09, 10, 33 |
| `MC-GG-UKL-FLOOD-RISK` | Surfaces and land use change the flood, not just the rain | 4 | 08, 28, FB-08, 52 |
| `MC-GG-UKL-FLOODPLAIN-USE` | Zoning keeps the vulnerable uses off the risky land | 3 | 29, 16, 36 |
| `MC-GG-UKL-GEOLOGY` | Rock type is about hardness and permeability, not age | 4 | 18, 32, 40, 41 |
| `MC-GG-UKL-GLACIAL` | Erosion carves hollows; deposition leaves mounds | 2 | 31, 39 |
| `MC-GG-UKL-HYDROGRAPH` | Lag time runs from peak rainfall to peak discharge | 4 | 17, 34, 49, 50 |
| `MC-GG-UKL-LONG-PROFILE` | Discharge grows downstream even as gradient falls | 3 | 06, 30, FB-06 |
| `MC-GG-UKL-LONGSHORE` | Waves come in at an angle; backwash returns straight down | 4 | 04, 27, FB-04, 47 |
| `MC-GG-UKL-MEANDER` | Outside bend erodes, inside bend deposits | 3 | 07, FB-07, 51 |
| `MC-GG-UKL-RIVER-TRANSPORT` | Traction rolls, saltation bounces, suspension carries | 2 | 15, 38 |
| `MC-GG-UKL-STACK-SEQUENCE` | Crack, cave, arch, stack, stump — the cave is not skipped | 3 | 03, FB-03, 45 |
| `MC-GG-UKL-SUBAERIAL` | Weathering breaks rock in place; erosion carries it away | 4 | 11, 42, 43, 48 |

## Remaining banks

Six banks still use auto-generated slugs, largest single-use count first:

| bank | questions | tags | single-use |
|---|---|---|---|
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
