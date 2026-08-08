# A-Level Geography — misconception mapping

Edexcel 9GE0. 238 questions across 9 banks, mapped onto **52 shared
`MC-GEO-*` categories**. Every category carries at least two questions, so
every row a teacher sees on the heatmap aggregates.

Implemented in `geoMisconceptionTags` in `data/forge-data.js`; labels in
`data/misconception-labels.js`; starters in `data/starter-activities.js`.
This supersedes `docs/geo-misconception-taxonomy-draft.md`, which proposed 44
categories over ~216 questions — the differences are recorded below.

| | before | after |
|---|---|---|
| distinct tags | 237 | 52 |
| tags aggregating (≥2 questions) | 1 | 52 |
| single-use share | 0.992 | 0.004 |
| mechanical (`tag === "MC-" + id`) share | 0.840 | 0.000 |

Ratchets: `TAG_TAXONOMY_SUBJECTS.geo = 0.01`, `TAG_TAXONOMY_MECHANICAL.geo = 0`.
All three failure modes were confirmed to fire before those values were set —
see "Ratchets bite" below.

## Two findings that changed the draft's plan

**1. `GEO-TEC` and `GEO-COAST` were not "already done".** The draft recorded
them as complete: 16 `MC-TEC-*` and 6 `MC-COAST-*` tags, each with a label and
a hand-written starter. Both halves of that are true and it is still the wrong
conclusion.

Those tags belong to `gcse-geo`, which still uses them, and the A-Level bank
was sharing them *incorrectly*. A-Level `COAST-02` asks what causes longshore
drift; `MC-COAST-02` is labelled "Differential erosion — headland and bay" and
its starter reteaches headland formation. A-Level `COAST-04` asks about
concordant coastlines and pointed at the longshore-drift starter. A teacher
following the intervention would have reteached the wrong topic.

They also could not aggregate: `MC-TEC-01` on question `TEC-01` is a
per-question identifier that happens to read like a concept, and it scored as
mechanical for exactly that reason.

So the `MC-TEC-*` / `MC-COAST-*` labels and starters are left **untouched** for
`gcse-geo`, and A-Level geography moves onto its own `MC-GEO-*` set. Nothing
was deleted; the two subjects are simply no longer entangled.

**2. `GEO-P3` had no viable standalone taxonomy.** The draft proposed 3
categories over 12 questions, which reads as four questions each. In fact only
three stems are synoptic at all (`P3-GC-05` interdependence, `-06` synoptic
approach, `-12` resilience) — the other nine are restatements of Superpowers,
Carbon and Globalisation concepts. As drafted, all three P3 categories would
have sat on one question each and failed the very ratchet being set.

Resolved by folding the nine duplicates into the topic taxonomies and merging
the remaining three into a single `MC-GEO-P3-SYNOPTIC`. The Paper 3 diagnosis
survives; the false precision does not.

## Answers to the draft's three open questions

1. **`GEO-HEALTH`: 8 categories, not 9 or 7.** The draft offered to collapse
   `RIGHTS` / `INTERVENTION-LAW` / `INTERVENTION-EVAL` into two and named
   `INTERVENTION-EVAL` as the first cut. The question mass says the opposite.
   `INTERVENTION-LAW` covers **2** questions (17 humanitarian intervention, 18
   R2P), and "R2P is binding law" is the same student error as "universal
   rights override sovereignty" — so it collapses into `MC-GEO-RIGHTS`.
   `INTERVENTION-EVAL` covers **9**, the largest category in the subject, and
   is what both genuinely diagnostic `HEALTH-GAP-*` questions test. It stays.
2. **`GEO-P3`: 1 category, not 3.** See above.
3. **Starters written now.** The subject's "Developing" tier reflects
   unmapped route points, which retagging does not change; the decision to
   invest in 52 starters now was taken explicitly rather than deferred.

## The categories

Counts are questions per category. Cross-bank assignments are marked.

### Tectonic hazards — `GEO-TEC`, 22 questions, 7 categories

| tag | n | the error |
|---|---|---|
| `MC-GEO-TEC-MARGIN` | 5 | Which plate subducts, and the belief that quakes occur only at destructive margins |
| `MC-GEO-TEC-ERUPTION` | 2 | Eruption style read from volcano size rather than magma silica |
| `MC-GEO-TEC-VOLCANIC-IMPACT` | 2 | Volcanic hazards treated as purely costly |
| `MC-GEO-TEC-VULNERABILITY` | 5 | Disaster scale attributed to magnitude rather than vulnerability |
| `MC-GEO-TEC-SEISMIC` | 2 | Focus/epicentre confused; tsunami treated as a wind wave |
| `MC-GEO-TEC-RETURN-PERIOD` | 2 | Return period read as a timetable rather than an annual probability |
| `MC-GEO-TEC-MITIGATION` | 4 | Mitigation assumed to reduce the event rather than exposure and vulnerability |

`TEC-05` keeps the cross-subject exam-technique tag it already carried, as
`["MC-GEO-TEC-VULNERABILITY","MC-TECH-02"]`.

### Coastal landscapes — `GEO-COAST`, 19 questions, 4 categories

| tag | n | the error |
|---|---|---|
| `MC-GEO-COAST-EROSION` | 4 | Hydraulic action and abrasion swapped; attrition thought to erode the cliff |
| `MC-GEO-COAST-SEDIMENT` | 4 | Backwash drawn returning at the angle of swash; sediment cell not treated as a closed budget |
| `MC-GEO-COAST-LITHOLOGY` | 4 | Headlands described as growing outwards; concordant and discordant confused |
| `MC-GEO-COAST-MANAGE` | 7 | Management assumed to remove risk rather than move it downdrift or downstream |

### Regenerating places — `GEO-REGEN`, 17 questions, 5 categories

| tag | n | the error |
|---|---|---|
| `MC-GEO-REGEN-IDENTITY` | 4 | Rebranding treated as changing identity rather than claiming it |
| `MC-GEO-REGEN-MEASURE` | 4 | Economic and social indicators used interchangeably |
| `MC-GEO-REGEN-WINNERS` | 4 | Area-level improvement read as improvement for existing residents |
| `MC-GEO-REGEN-STAKEHOLDER` | 3 | Participation assumed to resolve conflict rather than reveal it |
| `MC-GEO-REGEN-SUSTAINABILITY` | 2 | Environmental aims treated as politically neutral |

### Water cycle and water insecurity — `GEO-WATER`, 39 questions, 7 categories

| tag | n | the error |
|---|---|---|
| `MC-GEO-WATER-SYSTEM` | 7 | Stores confused with flows; basin not treated as an open system |
| `MC-GEO-WATER-FLOWS` | 6 | Infiltration, percolation and throughflow used interchangeably |
| `MC-GEO-WATER-HYDROGRAPH` | 4 | Lag time read as the storm's duration |
| `MC-GEO-WATER-SCARCITY` | 6 | Physical and economic scarcity confused |
| `MC-GEO-WATER-FOOTPRINT` | 2 | Virtual water treated as physically traded water |
| `MC-GEO-WATER-SUPPLY` | 8 | Hard-engineering schemes assumed straightforwardly beneficial |
| `MC-GEO-WATER-MANAGE` | 6 | Governance treated as a technical rather than political problem |

### Carbon cycle and energy security — `GEO-CARBON`, 38 questions + 2 from `GEO-P3`, 8 categories

| tag | n | the error |
|---|---|---|
| `MC-GEO-CARBON-SYSTEM` | 7 | Store confused with flux; budget treated as a stock (+`P3-GC-03`) |
| `MC-GEO-CARBON-BIO` | 4 | Photosynthesis, respiration and decomposition not linked as one cycle |
| `MC-GEO-CARBON-GHG` | 4 | Greenhouse effect confused with the *enhanced* greenhouse effect |
| `MC-GEO-CARBON-STORES` | 4 | Peatland and blue carbon overlooked as major stores |
| `MC-GEO-CARBON-MITIGATE` | 6 | Offsetting equated with reducing emissions (+`P3-GC-04`) |
| `MC-GEO-ENERGY-MIX` | 5 | Energy security equated with self-sufficiency |
| `MC-GEO-ENERGY-SUPPLY` | 6 | Intermittency treated as disqualifying renewables |
| `MC-GEO-ENERGY-GEOPOL` | 4 | Resource nationalism confused with the resource curse |

### Superpowers — `GEO-SUPER`, 38 questions + 5 from `GEO-P3` + 5 from `GEO-GLOBAL`, 9 categories

| tag | n | the error |
|---|---|---|
| `MC-GEO-SUPER-POWERTYPE` | 3 | Superpower and emerging power used interchangeably (+`P3-GC-01`) |
| `MC-GEO-SUPER-DIMENSIONS` | 7 | Hard and soft power confused; smart power omitted |
| `MC-GEO-SUPER-GOVERNANCE` | 7 | UN assumed to have enforcement power (+`P3-GC-07`, `GLOBAL-GAP-07`) |
| `MC-GEO-SUPER-ECON` | 11 | Production networks treated as simple export links (+`P3-GC-02/09/10`, 5 `GEO-GLOBAL`) |
| `MC-GEO-SUPER-DIPLOMACY` | 4 | Aid and debt diplomacy assumed straightforwardly generous |
| `MC-GEO-SUPER-RESOURCE` | 3 | Resource curse assumed to be about running out |
| `MC-GEO-SUPER-MIGRATION` | 4 | Diaspora treated as the same thing as a flow (+`P3-GC-08`) |
| `MC-GEO-SUPER-POLARITY` | 4 | Unipolar and multipolar confused; transition assumed violent |
| `MC-GEO-SUPER-TENSION` | 4 | Intervention judged solely by whether it succeeded |

### Health, human rights and intervention — `GEO-HEALTH`, 40 questions, 8 categories

| tag | n | the error |
|---|---|---|
| `MC-GEO-HEALTH-MEASURE` | 6 | Morbidity and mortality confused; life expectancy read as a prediction |
| `MC-GEO-HEALTH-TRANSITION` | 4 | Epidemiological transition assumed one-directional and complete |
| `MC-GEO-HEALTH-INEQUALITY` | 4 | Health inequality attributed to healthcare access alone |
| `MC-GEO-RIGHTS` | 7 | Universal rights assumed to override sovereignty; R2P read as binding law |
| `MC-GEO-DISPLACEMENT` | 2 | Refugee and IDP used interchangeably |
| `MC-GEO-AID` | 3 | Humanitarian and development aid conflated |
| `MC-GEO-HEALTH-GOV` | 5 | WHO assumed to have authority over national health systems |
| `MC-GEO-INTERVENTION-EVAL` | 9 | Intervention judged without stating criterion, scale or timeframe |

### Globalisation — `GEO-GLOBAL`, 13 questions, 3 own categories

| tag | n | the error |
|---|---|---|
| `MC-GEO-GLOBAL-DRIVERS` | 2 | Globalisation treated as a finished state rather than a reversible process |
| `MC-GEO-GLOBAL-UNEVEN` | 4 | National aggregates read as evidence about groups and regions (+`GEO-SUPER-35`) |
| `MC-GEO-GLOBAL-CULTURE` | 3 | Cultural globalisation read as one-way homogenisation (+`P3-GC-11`, `GEO-SUPER-37`) |

The remaining 5 `GEO-GLOBAL` questions and `GLOBAL-GAP-07` fold into
`MC-GEO-SUPER-ECON` and `MC-GEO-SUPER-GOVERNANCE`.

### Paper 3 synoptic — 3 questions, 1 category

| tag | n | the error |
|---|---|---|
| `MC-GEO-P3-SYNOPTIC` | 3 | Synoptic read as covering more topics; interdependence read as one-way dependency; resilience confused with resistance |

## Implementation notes

**The apply loop runs late in the file, deliberately.** Six questions
(`A1-PHASE7-GEOTEC-01/02`, `-GEOCOAST-01/02`, `-GEOGLOBAL-01/02`) are appended
to `GEO-TEC`, `GEO-COAST` and `GEO-GLOBAL` about a thousand lines *below*
where `geoMisconceptionTags` is declared. A loop placed beside the table
silently skipped all six and left them on per-question tags. It now runs as
`applyGeoMisconceptionTags()` after the last append. If geo questions are
added later still, check the loop is downstream of them.

**Known limitation in the audit's counting.** `TAG_TAXONOMY_SUBJECTS` keys its
counts on the tag *value*, so a question carrying an array of tags counts as
its own composite key rather than incrementing each member. `TEC-05` is geo's
only such question and is the entire reason its single-use share reads 0.004
rather than 0. This affects every subject using array tags (14 questions carry
`MC-TECH-02` this way, plus `EDU-05` in `soc`), so it was left alone rather
than rescored for geo only.

## Ratchets bite

Each failure mode was confirmed to fire before the values were committed:

| change | result |
|---|---|
| `TAG_TAXONOMY_SUBJECTS.geo` 0.01 → 0 | fails: `1/238 questions on a tag used only once` |
| one question's tag reverted to `MC-<id>` | fails: `MECHANICAL TAGS: "geo" has 1/238 source questions` |
| `MC-GEO-RIGHTS` starter removed | fails: `NO STARTER: "geo" has 1 aggregatable tag(s)` |

## Not done, and deliberately

- **19 options carry literal padding filler** — `TEC-01` option B ends
  "cannot move. in this context in context in context in context", and there
  are 18 more across `GEO-TEC`, `GEO-COAST`, `GEO-REGEN` and `GEO-WATER`.
  This is how the subject reached 0% "correct answer is longest": distractors
  were padded, which is the anti-pattern `CLAUDE.md` warns against. Geo needs
  no rewrite pass for the length rule itself — a scripted check found **0**
  correct-is-longest violations across all 474 stems and twins — but the
  filler should be replaced with genuine distractor content.
- **The four definition-recall banks still test definitions.** `GEO-WATER`,
  `GEO-CARBON`, `GEO-SUPER` and `GEO-HEALTH` are generated
  "What is meant by X?" stems, so a tag firing means "missed a definition in
  this area", not "holds this misconception" — the same caveat recorded for
  History and Sociology. The `-GAP-` questions in each bank are the genuinely
  diagnostic items and every category that has one includes it. The eventual
  fix is the same as History's: rewrite one question per tag to the authoring
  standard so each category has at least one diagnostic item behind it.
