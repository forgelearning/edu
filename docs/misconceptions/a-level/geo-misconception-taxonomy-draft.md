# A-Level Geography — misconception taxonomy (DRAFT for review)

Edexcel 9GE0. 238 questions across 9 banks. Currently 237 tags, 1 aggregating;
200 of 238 questions carry a tag that merely repeats the question id.

**Nothing has been changed in `data/forge-data.js`.** Mark it up and I'll do the
mapping, labels and starters after.

## Three different situations, not one

This is the key finding, and it means `geo` is cheaper than its headline
numbers suggest.

| group | banks | questions | state |
|---|---|---|---|
| **A. Already done** | `GEO-TEC` | 16 of 22 | 16 tags with labels and hand-written starters |
| **B. Duplicate variants** | `GEO-TEC`, `GEO-COAST`, `GEO-GLOBAL` | ~25 | `-GAP-` and `-A1-PHASE7-` questions restate concepts that already have a tag — a mechanical merge, no design |
| **C. Needs a taxonomy** | the 4 big banks + `REGEN`, `P3` | ~190 | Real design work |

Group B is worth doing first and almost free. `MC-COAST-GAP-03` asks "What is a
likely effect of hydraulic action on a cliff?" while `MC-COAST-01` asks "Why
does hydraulic action erode a cliff?" — the same concept, two tags. Same for
`MC-TEC-GAP-02` against `MC-TEC-11`, and most of `MC-GLOBAL-GAP-*` against the
Superpowers bank.

Group C splits again by question quality:

- `GEO-WATER`, `GEO-CARBON`, `GEO-SUPER`, `GEO-HEALTH` (148 questions) are pure
  term recall, one concept per question — same shape as History and Sociology,
  same caveat: a tag there means "missed a definition in this area".
- `GEO-REGEN`, `GEO-P3` (29 questions) already have misconception-shaped stems
  ("Why can hard engineering create conflict between coastal communities?"), so
  they need grouping but not rewriting.

---

## Water Cycle and Water Insecurity — 7 categories, 39 questions

| id | the error |
|---|---|
| `MC-GEO-WATER-SYSTEM` | Stores confused with flows; the drainage basin not treated as an open system |
| `MC-GEO-WATER-FLOWS` | Infiltration, percolation and throughflow used interchangeably |
| `MC-GEO-WATER-HYDROGRAPH` | Lag time read as the storm's duration; urbanisation's effect on the curve not explained |
| `MC-GEO-WATER-SCARCITY` | Physical and economic water scarcity confused |
| `MC-GEO-WATER-FOOTPRINT` | Virtual water treated as water that is physically traded |
| `MC-GEO-WATER-SUPPLY` | Hard-engineering supply schemes assumed to be straightforwardly beneficial |
| `MC-GEO-WATER-MANAGE` | Water governance treated as a technical problem rather than a political one |

## Carbon Cycle and Energy Security — 8 categories, 38 questions

| id | the error |
|---|---|
| `MC-GEO-CARBON-SYSTEM` | Carbon store confused with flux; the budget treated as a stock |
| `MC-GEO-CARBON-BIO` | Photosynthesis, respiration and decomposition not linked as a single cycle |
| `MC-GEO-CARBON-GHG` | Greenhouse effect confused with the ENHANCED greenhouse effect |
| `MC-GEO-CARBON-STORES` | Peatland and blue carbon overlooked as major stores |
| `MC-GEO-ENERGY-MIX` | Energy security equated with self-sufficiency |
| `MC-GEO-ENERGY-SUPPLY` | Intermittency treated as making renewables unusable |
| `MC-GEO-ENERGY-GEOPOL` | Resource nationalism confused with a resource curse |
| `MC-GEO-CARBON-MITIGATE` | Offsetting assumed to be equivalent to reducing emissions |

## Superpowers — 9 categories, 38 questions

| id | the error |
|---|---|
| `MC-GEO-SUPER-POWERTYPE` | Superpower and emerging power used interchangeably |
| `MC-GEO-SUPER-DIMENSIONS` | Hard and soft power confused; smart power omitted |
| `MC-GEO-SUPER-GOVERNANCE` | The UN assumed to have enforcement power over members |
| `MC-GEO-SUPER-ECON` | Global production networks treated as simple export relationships |
| `MC-GEO-SUPER-DIPLOMACY` | Aid and debt diplomacy assumed to be straightforwardly generous |
| `MC-GEO-SUPER-RESOURCE` | Resource curse assumed to be about running out of a resource |
| `MC-GEO-SUPER-MIGRATION` | Diaspora treated as the same thing as a migration flow |
| `MC-GEO-SUPER-POLARITY` | Unipolar and multipolar worlds confused; transition assumed to be violent |
| `MC-GEO-SUPER-TENSION` | Intervention judged solely by whether it succeeded |

## Health, Human Rights and Intervention — 9 categories, 40 questions

| id | the error |
|---|---|
| `MC-GEO-HEALTH-MEASURE` | Morbidity and mortality confused; life expectancy read as a prediction |
| `MC-GEO-HEALTH-TRANSITION` | Epidemiological transition assumed to be one-directional and complete |
| `MC-GEO-HEALTH-INEQUALITY` | Health inequality attributed to healthcare access alone |
| `MC-GEO-RIGHTS` | Universal rights assumed to override sovereignty automatically |
| `MC-GEO-INTERVENTION-LAW` | Humanitarian intervention confused with R2P as a legal doctrine |
| `MC-GEO-DISPLACEMENT` | Refugee and internally displaced person used interchangeably |
| `MC-GEO-AID` | Humanitarian and development aid conflated |
| `MC-GEO-HEALTH-GOV` | The WHO assumed to have authority over national health systems |
| `MC-GEO-INTERVENTION-EVAL` | Intervention judged without stating the criterion or the scale |

## Regenerating Places — 4 categories, 17 questions

| id | the error |
|---|---|
| `MC-GEO-REGEN-IDENTITY` | Place identity treated as fixed rather than contested and rebranded |
| `MC-GEO-REGEN-MEASURE` | Economic and social success indicators used interchangeably |
| `MC-GEO-REGEN-WINNERS` | Regeneration assumed to benefit existing residents |
| `MC-GEO-REGEN-STAKEHOLDER` | Stakeholder participation assumed to resolve conflict |

## Paper 3 synoptic — 3 categories, 12 questions

| id | the error |
|---|---|
| `MC-GEO-P3-SYNOPTIC` | A synoptic answer treated as covering more topics rather than connecting them |
| `MC-GEO-P3-INTERDEPENDENCE` | Interdependence read as one-way dependency |
| `MC-GEO-P3-RESILIENCE` | Resilience confused with resistance to change |

## Coastal Landscapes — merge, then 3 new categories

`MC-COAST-01..06` already have starters. The remaining 13 questions:

| id | absorbs |
|---|---|
| existing `MC-COAST-01` | `MC-COAST-GAP-03` (hydraulic action, restated) |
| existing `MC-COAST-02` | `MC-COAST-GAP-04` (sediment movement, restated) |
| existing `MC-COAST-04` | `MC-COAST-GAP-05` (concordant coastline, restated) |
| `MC-GEO-COAST-LANDFORM` *(new)* | sediment cell, headland and bay, spit, wave refraction |
| `MC-GEO-COAST-MANAGE` *(new)* | beach reprofiling, hard-engineering conflict, groyne trade-off, SMP |
| `MC-GEO-COAST-RISK` *(new)* | sea-level rise and flood risk |

## Tectonic Hazards and Globalisation — merge only

`GEO-TEC` is done. Its 6 uncovered questions are restatements: `MC-TEC-GAP-02`
into `MC-TEC-11`, `-GAP-03` into `MC-TEC-03`, `-GAP-01`/`-GAP-04` into
`MC-TEC-15`, and the two `PHASE7` items into `MC-TEC-13` and `MC-TEC-15`.

`GEO-GLOBAL`'s 13 questions duplicate Superpowers concepts almost entirely and
fold into `MC-GEO-SUPER-ECON`, `-DIPLOMACY` and `-TENSION`, plus one new
`MC-GEO-GLOBAL-UNEVEN` for the uneven-development items.

---

## Totals

**44 new categories**, plus the 16 existing `MC-TEC-*` and 6 `MC-COAST-*`.
Roughly 216 of 238 questions retagged; single-use share would fall from 0.99 to
about 0.02, and mechanical tags from 0.84 to 0.

## What I'd like you to look at

1. **`GEO-HEALTH` has the most categories (9) for one bank.** The intervention
   group in particular — `RIGHTS`, `INTERVENTION-LAW`, `INTERVENTION-EVAL` —
   could be two rather than three. I've kept them apart because "was it legal"
   and "did it work" are genuinely different questions, but this is the block
   I'd cut first.
2. **`GEO-P3` at 3 categories over 12 questions** is thin. It could fold into
   the topic banks entirely, at the cost of losing the synoptic-skill diagnosis
   that Paper 3 is actually assessed on.
3. **CLAUDE.md marks A-Level Geography "Developing" until every active route
   point is mapped.** Retagging does not change that, but it is worth knowing
   the subject is deliberately incomplete before investing in starters for it.
