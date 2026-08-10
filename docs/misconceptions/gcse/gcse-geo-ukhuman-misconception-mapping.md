# GCSE Geography — UK human landscapes misconception mapping

Sixth curated bank of the `gcse-geo` retag. `gcseGeoSemanticStem()` had made
readable tags from the first five content words, but the tags described nearly
every question separately rather than grouping the error a student makes.

## Result

| | before | after |
|---|---|---|
| Distinct tags | 42 | 13 |
| Single-use tags | 36 | 0 |
| Questions per tag | 1.1 | 3.7 |

All 48 questions are mapped, including the six fill-blank twins. Each tag has
a label in `data/misconception-labels.js` and a corrective starter with an
answer in `data/starter-activities.js`.

Subject-wide `gcse-geo` moves from 256 single-use questions (40.0%) to 220
(34.4%). The single-use ratchet moves from 0.40 to 0.35. The mechanical
ratchet remains 0: the semantic slugs had already passed that check, which is
why this bank still needed a human taxonomy review.

## The organising idea: error mechanism, not place

London, Cornwall and the wider UK appear throughout this bank, but the useful
intervention is the rule students have confused:

- regeneration is broader than construction;
- structural change can replace stable industrial work with vulnerable jobs;
- migration changes culture, age structure and place, while immigration,
  emigration and net migration are different measures;
- investment, connectivity and public policy are different mechanisms;
- population structure, urban change and service access need the right variable,
  not a single boundary, average or attractive landscape.

## Grouping decisions worth knowing

- **Cultural migration is separate from migration terms and population
  patterns.** Questions 03, 15 and 30 ask students to distinguish diversity
  from segregation or homogeneity. Questions 07, 08 and 16 test the direction
  and calculation of movement. Questions 14, 19, 21, 22 and 29 test density,
  age structure and rural–urban movement.
- **FDI and TNCs share one investment error, while connectivity is broader.**
  Questions 09, 24 and 28 concern what foreign investment is and how its
  benefits and leakage should be judged. Questions 10, 33 and 40 concern the
  flows created by access, ownership and commuting.
- **Rural economy is deliberately a trade-off group.** Questions 18, 26 and
  39 all invite the overclaim that one intervention or new activity removes
  vulnerability; the starter makes students name both the benefit and the
  remaining cost.
- **Question 21 joins population patterns, not a separate pyramid tag.** Its
  broad-base pyramid tests the same variable-selection error as density,
  migration and the rural–urban continuum questions.
- **Prefix `MC-GG-UKH-` was checked across `forge-data.js`,
  `misconception-labels.js` and `starter-activities.js` before use.** It keeps
  the GCSE UK human taxonomy distinct from the older A-Level `MC-URB-*`
  intervention rows.

## Full mapping

| tag | label | questions | ids (GCSE-UKHUMAN-…) |
|---|---|---:|---|
| `MC-GG-UKH-REGENERATION` | Regeneration is coordinated renewal, not just construction | 5 | 01, 05, 17, FB-01, FB-05 |
| `MC-GG-UKH-STRUCTURAL-CHANGE` | Industrial decline can create insecure replacement work | 5 | 02, 06, 31, FB-02, FB-06 |
| `MC-GG-UKH-CULTURAL-MIGRATION` | Diversity is not assimilation or automatic segregation | 4 | 03, 15, 30, FB-03 |
| `MC-GG-UKH-RURAL-HOUSING` | Rural demand can price out local residents | 4 | 04, 20, 27, FB-04 |
| `MC-GG-UKH-RURAL-ECONOMY` | Diversification does not remove rural vulnerability | 3 | 18, 26, 39 |
| `MC-GG-UKH-MIGRATION-TERMS` | Migration terms describe different directions and balances | 3 | 07, 08, 16 |
| `MC-GG-UKH-INVESTMENT` | FDI, TNC identity and foreign-investment impacts are distinct | 3 | 09, 24, 28 |
| `MC-GG-UKH-CONNECTIVITY` | Connectivity creates uneven flows between places | 3 | 10, 33, 40 |
| `MC-GG-UKH-ECONOMIC-POLICY` | Enterprise zones, grants and privatisation use different mechanisms | 3 | 11, 13, 25 |
| `MC-GG-UKH-SECTOR-STRUCTURE` | The four sectors describe different kinds of work | 3 | 12, 23, 32 |
| `MC-GG-UKH-POPULATION-PATTERNS` | Population patterns need the right variable and mechanism | 5 | 14, 19, 21, 22, 29 |
| `MC-GG-UKH-URBAN-CHANGE` | Urban change redistributes land use and opportunity | 4 | 34, 35, 36, 37 |
| `MC-GG-UKH-PLACE-ACCESS` | Quality of life depends on access and multiple conditions | 3 | 38, 41, 42 |

The five remaining banks are listed in the previous bank's document,
`docs/misconceptions/gcse/gcse-geo-uk-landscape-misconception-mapping.md`.
