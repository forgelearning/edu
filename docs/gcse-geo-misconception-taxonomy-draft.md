# GCSE Geography — misconception taxonomy (DRAFT for review)

Subject key `gcse-geo`, 640 questions across 14 banks. **Nothing has been
changed in `data/forge-data.js`.** Mark it up and I'll do the mapping, labels
and starters after.

This is the largest retag in the backlog — 2.7× A-Level `geo` — and the one
whose true state was most badly mis-recorded.

## Where gcse-geo stands

| | |
|---|---|
| Questions | 640 across 14 banks |
| Distinct tags | 565 |
| Single-use tags | 492 (**76.9%**) |
| Tags naming no concept | 633 of 640 (**99%**) |
| Ratchets | `gcse-geo: 0.78` single-use, `0.99` mechanical |

## The record was wrong, and the audit agreed with it

CLAUDE.md described `gcse-geo` as the cheap case — "0.00 mechanical but 0.77
single-use, so its tags name topics and are simply too fine to aggregate" — and
ranked the backlog on that basis.

**Not one of its 565 tags contains a concept word.** Every one is a bank code
plus a position:

| tag | question | what the tag tells a teacher |
|---|---|---|
| `MC-GEO-HAZ-27` | Why do subtropical deserts occur around 30° N and S? | nothing |
| `MC-ENQ-02` | Why use a null hypothesis alongside the main hypothesis? | nothing |
| `MC-GEO-RVF-19` | How can river cross-sectional area be estimated? | nothing |
| `MC-HAZ-KT-11` | Inside a cyclone, what is the difference between eye and eyewall? | nothing |

The 0.00 mechanical score was a measurement artefact: the check tested
`tag === "MC-" + id`, the ids read `GCSE-HAZ-27` and the tags read
`MC-GEO-HAZ-27`, so the two strings never matched. The check was fixed in
#96, which is what moved the mechanical ratchet from `0` to `0.99` — not a
regression, just the first honest measurement of this subject.

**The single-use figure flatters it too.** 73 tags look like they aggregate.
71 of those owe their second question to a `fill_blank` `-FB-` twin that
restates the source question and inherits its tag — `GCSE-HAZ-01` "At a
destructive plate boundary, what typically happens?" paired with
`GCSE-HAZ-FB-01` "Complete the explanation of a destructive plate boundary."
Only **2** group genuinely distinct questions. So the real starting point is
close to no taxonomy at all.

## Three tag generations, all positional

Worth knowing because it explains the shape of the banks, not because any
generation is better than another:

| generation | questions | form | example |
|---|---|---|---|
| A. original | 438 | `MC-<BANK>-<n>` | `MC-TEC-01`, `MC-DEV-03` |
| B. key terms | 74 | `MC-<BANK>-KT-<n>` | `MC-HAZ-KT-11` |
| C. later appends | 128 | `MC-GEO-<BANK>-<n>` | `MC-GEO-HAZ-27` |

Generation A is the only one that ever pairs up, and only via its `-FB-` twin.

## Naming

A-Level `geo` now owns the `MC-GEO-*` namespace after its retag, and
`gcse-geo` currently squats in it (`MC-GEO-HAZ-27` vs A-Level's
`MC-GEO-WATER-HYDROGRAPH`). Sharing a namespace across two specifications is
exactly what produced the defect the geo retag had to fix — a longshore-drift
question pointing at a headland-and-bay starter.

So the proposal is **`MC-GG-*`** for every tag below, leaving `MC-GEO-*` to
A-Level. Flagging it because it is a third convention in the codebase, and the
alternative — `MC-GCSEGEO-*` — is uglier but more explicit.

## Scale of the proposal

~150 categories across 640 questions, averaging just over 4 questions each,
none below 2 by construction. That is coarser than A-Level geo's 52-for-238
(4.6 each), so the granularity is consistent with what is already shipped.

The per-question mapping is **not** encoded yet, unlike the econ stage 2 draft
where all 230 were assigned and verified by script before I wrote the doc. At
640 questions I want the category design agreed first, because a category I
have mis-scoped costs far more to unpick after the mapping than before. The
mapping will be encoded and checked the same way — every question assigned,
no category below 2 — before anything is written to `forge-data.js`.

---

# Paper 1 — Physical

## `GCSE-GEO-HAZ` — Hazards and climate, 57 questions, 15 categories

| tag | the error |
|---|---|
| `MC-GG-HAZ-BOUNDARY-TYPE` | Boundary types matched to the wrong hazard; conservative boundaries assumed safe because no volcano forms |
| `MC-GG-HAZ-PLATE-MECHANISM` | Lithosphere and asthenosphere conflated; hotspots assumed to be plate boundaries |
| `MC-GG-HAZ-VOLCANO-TYPE` | Explosiveness attributed to volcano size rather than magma viscosity |
| `MC-GG-HAZ-MAGNITUDE-VS-IMPACT` | Death toll assumed to follow magnitude; Tohoku vs Haiti explained without wealth or preparedness |
| `MC-GG-HAZ-EFFECTS-PRIMARY-SECONDARY` | Secondary effects classified by severity rather than by causal chain; immediate/long-term responses confused with primary/secondary effects |
| `MC-GG-HAZ-RISK-DEFINITION` | Hazard risk equated with hazard magnitude, omitting exposure and vulnerability |
| `MC-GG-HAZ-MANAGEMENT` | Monitoring read as predicting an exact date; preparation and prediction conflated |
| `MC-GG-HAZ-CYCLONE-FORMATION` | Formation explained by warm water alone; the 5° Coriolis limit and the ITCZ omitted |
| `MC-GG-HAZ-CYCLONE-STRUCTURE` | Eye described as the most destructive part; storm surge attributed to rainfall |
| `MC-GG-HAZ-CYCLONE-IMPACT` | Impact read off wind speed; Katrina's flooding and Haiyan's surge not separated from category |
| `MC-GG-HAZ-CYCLONE-DECAY` | Weakening over land attributed to friction alone, not loss of the energy source |
| `MC-GG-HAZ-ATMOS-CIRCULATION` | Cells named but not linked to surface pressure; deserts at 30° explained by heat rather than descending air |
| `MC-GG-HAZ-CLIMATE-EVIDENCE` | A single proxy treated as sufficient; what ice cores and tree rings each actually record |
| `MC-GG-HAZ-CLIMATE-CAUSES` | Greenhouse effect and enhanced greenhouse effect conflated; Milankovitch treated as one process |
| `MC-GG-HAZ-CLIMATE-PROJECTION` | A projection range read as uncertainty about whether warming is happening, rather than about emissions pathway |

## `GCSE-GEO-UKLAND` — UK landscapes, 52 questions, 12 categories

| tag | the error |
|---|---|
| `MC-GG-UKLAND-EROSION-PROCESS` | Abrasion and attrition swapped; hydraulic action described as chemical |
| `MC-GG-UKLAND-WEATHERING-MASSMOVE` | Weathering classified as erosion; freeze-thaw explained without the expansion of freezing water |
| `MC-GG-UKLAND-ROCK-STRUCTURE` | Rock type confused with rock structure; concordant and discordant coasts mixed; permeability treated as a rock class |
| `MC-GG-UKLAND-EROSION-SEQUENCE` | Stack sequence recited out of order, or given without the joint-exploitation mechanism |
| `MC-GG-UKLAND-TRANSPORT-DEPOSITION` | Longshore drift explained with backwash returning at an angle; spits and bars not distinguished |
| `MC-GG-UKLAND-COASTAL-MANAGEMENT` | Hard engineering assumed always more effective; groynes' downdrift cost omitted |
| `MC-GG-UKLAND-LONG-PROFILE` | Erosion assumed to dominate at the source and deposition at the mouth, with discharge falling downstream |
| `MC-GG-UKLAND-MEANDER` | Erosion and deposition assigned to the wrong bend; levees explained without overbank deposition |
| `MC-GG-UKLAND-HYDROGRAPH` | Lag time read as storm duration; basin shape and antecedent conditions ignored |
| `MC-GG-UKLAND-FLOOD-RISK` | Flooding attributed to rainfall alone; urbanisation, zoning and restoration not linked to infiltration |
| `MC-GG-UKLAND-GLACIAL` | Erosional and depositional glacial landforms conflated |
| `MC-GG-UKLAND-RATES` | Erosion and retreat rates computed without dividing by the time period |

## `GCSE-GEO-BIOSPHERE` — Biosphere, 45 questions, 12 categories

| tag | the error |
|---|---|
| `MC-GG-BIO-BIOME-DISTRIBUTION` | Biome position attributed to latitude alone, ignoring the circulation that makes 30° arid |
| `MC-GG-BIO-LOCAL-FACTORS` | Altitude, drainage and geology not recognised as overriding climate locally |
| `MC-GG-BIO-ADAPTATION` | Adaptations listed as features without the stress they resolve |
| `MC-GG-BIO-ECOSYSTEM-STRUCTURE` | Abiotic and biotic components mixed; decomposers omitted from the cycle |
| `MC-GG-BIO-SERVICES` | Regulating and provisioning services conflated; services treated as economic value only |
| `MC-GG-BIO-CARBON` | Sequestration equated with not emitting |
| `MC-GG-BIO-SOIL` | Rainforest fertility assumed to be in the soil rather than the biomass; leaching not linked to clearance |
| `MC-GG-BIO-HUMAN-IMPACT` | Impacts listed without the pathway; eutrophication explained as direct poisoning |
| `MC-GG-BIO-INDIGENOUS` | Indigenous resource use treated as subsistence-only or as damage |
| `MC-GG-BIO-MALTHUS-BOSERUP` | Malthus and Boserup summarised as pessimist/optimist without the mechanism each proposes |
| `MC-GG-BIO-POP-PROJECTION` | A projection range read as disagreement about current population |
| `MC-GG-BIO-CLIMATE-GRAPH` | Climate graphs read for temperature only; annual range computed wrongly |

## `GCSE-GEO-FORESTS` — Forests under threat, 48 questions, 13 categories

| tag | the error |
|---|---|
| `MC-GG-FOR-RF-ADAPTATION` | Buttress roots and drip-tips named without the problem they solve |
| `MC-GG-FOR-RF-NUTRIENT` | Rapid cycling assumed to mean fertile soil |
| `MC-GG-FOR-FOOD-WEB` | Keystone species treated as simply the most numerous or largest |
| `MC-GG-FOR-TAIGA-ADAPTATION` | Conifer form explained by cold alone, not snow shedding and short growing season |
| `MC-GG-FOR-TAIGA-SOIL` | Podzol acidity attributed to the climate rather than needle litter |
| `MC-GG-FOR-NPP` | NPP treated as total biomass rather than rate of production |
| `MC-GG-FOR-DEFOREST-RATES` | Tropical rates assumed to exceed taiga rates in every measure |
| `MC-GG-FOR-DEFOREST-CAUSES` | Subsistence farming blamed for clearance that is commercial in scale |
| `MC-GG-FOR-INDIRECT-THREATS` | Only direct clearance counted as a threat; drought, acid rain and pests omitted |
| `MC-GG-FOR-LOGGING-METHOD` | Selective logging assumed harmless |
| `MC-GG-FOR-PROTECTION-INTL` | REDD and CITES assumed to work by prohibition alone; leakage not considered |
| `MC-GG-FOR-SUSTAINABLE-MGMT` | Sustainable forestry read as no extraction at all |
| `MC-GG-FOR-CONFLICT` | Conservation assumed to be uncontested; Indigenous and local interests omitted |

---

# Paper 2 — Human

## `GCSE-GEO-DEV` — Development dynamics, 64 questions, 15 categories

| tag | the error |
|---|---|
| `MC-GG-DEV-INDICATORS` | GDP per capita read as quality of life; single indicators trusted alone |
| `MC-GG-DEV-INEQUALITY-MEASURE` | Gini and quintile shares read as absolute wealth measures |
| `MC-GG-DEV-CATEGORIES` | Country categories treated as fixed; the Brandt Line read as still current |
| `MC-GG-DEV-HISTORICAL-CAUSES` | Inequality explained by present-day factors only; colonialism and neo-colonialism omitted |
| `MC-GG-DEV-PHYSICAL-BARRIERS` | Landlocked and mountainous disadvantage asserted without the trade-cost mechanism |
| `MC-GG-DEV-GOVERNANCE` | Corruption treated as the only governance factor |
| `MC-GG-DEV-ROSTOW` | Rostow's stages treated as inevitable and universally achieved |
| `MC-GG-DEV-DEPENDENCY` | Dependency theory summarised as "rich countries are greedy" without core-periphery structure |
| `MC-GG-DEV-TOPDOWN-BOTTOMUP` | Top-down and bottom-up classified by project size rather than by who decides |
| `MC-GG-DEV-TRADE-AID` | Aid assumed always beneficial; tied aid and debt relief not distinguished |
| `MC-GG-DEV-TNC-MULTIPLIER` | TNC investment judged only on jobs created; the multiplier asserted without a chain |
| `MC-GG-DEV-GLOBALISATION-UNEVEN` | Globalisation assumed to benefit all participants equally |
| `MC-GG-DEV-DTM` | DTM stages matched to the wrong birth/death rate combination |
| `MC-GG-DEV-POP-PYRAMID` | Pyramid shape misread; dependency ratio computed without the working-age denominator |
| `MC-GG-DEV-INFORMAL-POVERTY` | Informal work read as unemployment; the poverty line assumed to be one global figure |

## `GCSE-GEO-INDIA` — India case study, 50 questions, 11 categories

| tag | the error |
|---|---|
| `MC-GG-IND-ECON-STRUCTURE` | Sector shift described as manufacturing decline rather than tertiary growth |
| `MC-GG-IND-GLOBAL-POSITION` | Site and situation confused; India's position judged on total GDP alone |
| `MC-GG-IND-TNC-FDI` | TNC investment treated as one-way; India's own outward FDI overlooked |
| `MC-GG-IND-REGIONAL-INEQUALITY` | National averages assumed to describe every state; growth assumed to benefit everyone |
| `MC-GG-IND-URBANISATION` | Urban growth treated as purely a problem, or purely an opportunity |
| `MC-GG-IND-DEMOGRAPHY` | A youthful population assumed to be automatically a dividend |
| `MC-GG-IND-SOCIAL-BENEFITS` | Development measured economically only; education and gender effects omitted |
| `MC-GG-IND-POLLUTION` | Pollution treated as a side issue rather than a cost that offsets growth |
| `MC-GG-IND-GEOPOLITICS` | Growing influence assumed to be cost-free |
| `MC-GG-IND-AID-STATUS` | Receiving aid taken to prove a country is poor overall |
| `MC-GG-IND-ENV-COST` | Environmental consequences of rapid growth listed without a mechanism |

## `GCSE-GEO-URB` — Urban futures / Mumbai, 39 questions, 9 categories

| tag | the error |
|---|---|
| `MC-GG-URB-GLOBAL-TREND` | Urbanisation assumed fastest in already-developed regions |
| `MC-GG-URB-MEGACITY` | Megacity defined by area or importance rather than population threshold; primacy not understood |
| `MC-GG-URB-GROWTH-DRIVERS` | City growth attributed to migration alone, with natural increase omitted |
| `MC-GG-URB-INFORMAL-ECONOMY` | Informal employment read as idleness or crime rather than unregulated work |
| `MC-GG-URB-CHALLENGES` | Congestion and sanitation treated as single-domain problems |
| `MC-GG-URB-REDEVELOPMENT` | Redevelopment judged on housing quality alone, ignoring displaced livelihoods |
| `MC-GG-URB-LANDUSE` | Land values explained by building height rather than accessibility |
| `MC-GG-URB-COUNTERURB` | Counter-urbanisation and suburbanisation conflated |
| `MC-GG-URB-SUSTAINABILITY` | Sustainable improvement equated with the largest, most expensive scheme |

## `GCSE-GEO-UKHUMAN` — UK human landscapes, 48 questions, 12 categories

| tag | the error |
|---|---|
| `MC-GG-UKH-MIGRATION-TERMS` | Migration, immigration and net migration used interchangeably |
| `MC-GG-UKH-MIGRATION-IMPACT` | Migration's effect on age structure omitted; segregation and multiculturalism conflated |
| `MC-GG-UKH-DEINDUSTRIALISATION` | Sector decline described without the shift to tertiary and quaternary work |
| `MC-GG-UKH-REGENERATION` | Regeneration judged on new buildings, not on who benefits; enterprise zone treated as any business area |
| `MC-GG-UKH-TNC-FDI` | TNC and FDI treated as the same thing; privatisation confused with subsidy |
| `MC-GG-UKH-RURAL-CHANGE` | Rural house-price rises treated as purely positive; counter-urbanisation's local costs omitted |
| `MC-GG-UKH-RURAL-ECONOMY` | Tourism counted as replacing lost primary employment on equal terms |
| `MC-GG-UKH-RURAL-URBAN-CONTINUUM` | Rural and urban treated as a binary rather than a continuum |
| `MC-GG-UKH-POP-STRUCTURE` | Pyramid shape read without linking it to migration or ageing |
| `MC-GG-UKH-URBAN-CHANGE` | High-street decline attributed to e-commerce alone; studentification unrecognised |
| `MC-GG-UKH-INEQUALITY` | Deprivation assumed to be urban only; IMD read as an income measure |
| `MC-GG-UKH-SHRINKING-WORLD` | The shrinking world described as literal distance change rather than time-space convergence |

---

# Paper 3 — Fieldwork, skills and decision-making

These four banks are the ones a taxonomy helps most: the errors are procedural
and genuinely diagnostic, not definitional.

## `GCSE-GEO-ENQUIRY` — Enquiry methods, 44 questions, 12 categories

| tag | the error |
|---|---|
| `MC-GG-ENQ-HYPOTHESIS` | A hypothesis written so it cannot be disproved; the null hypothesis's purpose unclear |
| `MC-GG-ENQ-SAMPLING` | Random, systematic and stratified described by effort rather than by selection rule |
| `MC-GG-ENQ-PRIMARY-SECONDARY` | Data classified by how it looks rather than by who collected it |
| `MC-GG-ENQ-EQS` | A bipolar EQS score treated as objective measurement |
| `MC-GG-ENQ-GRAPH-CHOICE` | Graph chosen by appearance rather than by data type |
| `MC-GG-ENQ-CHOROPLETH` | Choropleth class boundaries assumed not to affect the pattern shown |
| `MC-GG-ENQ-ANOMALY` | Anomalies deleted rather than investigated and reported |
| `MC-GG-ENQ-TEMPORAL-BIAS` | A single time or day generalised to the whole site |
| `MC-GG-ENQ-CORRELATION-CAUSATION` | A strong correlation reported as proof of cause |
| `MC-GG-ENQ-RELIABILITY-VALIDITY` | Reliability and validity used interchangeably; repetition assumed to fix a flawed method |
| `MC-GG-ENQ-STATS` | Spread measures confused with averages; the median's purpose unclear |
| `MC-GG-ENQ-ETHICS` | Ethics reduced to politeness; consent and leading questions omitted |

## `GCSE-GEO-RIVERFIELD` — River fieldwork, 35 questions, 8 categories

| tag | the error |
|---|---|
| `MC-GG-RVF-MEASURE-TECHNIQUE` | Equipment named without the procedure that makes the reading comparable between sites |
| `MC-GG-RVF-DERIVED-VALUES` | Discharge, cross-sectional area and hydraulic radius quoted as measured rather than calculated |
| `MC-GG-RVF-SAMPLING-BIAS` | Convenient sampling points assumed representative |
| `MC-GG-RVF-VELOCITY` | Float readings treated as channel-average velocity |
| `MC-GG-RVF-DOWNSTREAM-MODEL` | Bradshaw's model treated as a law the river must obey rather than a general trend |
| `MC-GG-RVF-FLOOD-CONTEXT` | Basin geology, shape and antecedent conditions omitted when interpreting results |
| `MC-GG-RVF-SAFETY` | Risk assessment written generically, without river-specific hazards |
| `MC-GG-RVF-EVALUATION` | Evaluation limited to "we could collect more data" |

## `GCSE-GEO-URBFIELD` — Urban fieldwork, 35 questions, 9 categories

| tag | the error |
|---|---|
| `MC-GG-URF-EQS` | Perception scores presented as objective; scale design ignored |
| `MC-GG-URF-SITE-COMPARISON` | Sites compared without controlling for time, method or scale |
| `MC-GG-URF-COUNTS` | Pedestrian counts generalised from one time slot |
| `MC-GG-URF-QUESTIONNAIRE` | Leading wording unrecognised; respondent type not recorded |
| `MC-GG-URF-SECONDARY-DATA` | Census and IMD treated as directly comparable with fieldwork measures |
| `MC-GG-URF-CONFLICTING-EVIDENCE` | A result that contradicts the hypothesis treated as an error rather than a finding |
| `MC-GG-URF-EVALUATION` | Evaluation limited to sample size; single-visit limitation unrecognised |
| `MC-GG-URF-CAUSATION` | Regeneration credited with every observed change |
| `MC-GG-URF-THEORY` | Fieldwork reported without a concept such as gentrification to frame it |

## `GCSE-GEO-DECISIONS` — Paper 3 decision-making, 41 questions, 10 categories

| tag | the error |
|---|---|
| `MC-GG-DEC-EVIDENCE-USE` | Sources described rather than used; figures not named or blended with own knowledge |
| `MC-GG-DEC-BALANCE` | Only the chosen option's advantages given; command word's demand not met |
| `MC-GG-DEC-CRITERIA` | Criteria listed but not ranked or weighted before deciding |
| `MC-GG-DEC-JUSTIFICATION` | A decision asserted on one criterion, with rejected alternatives unexplained |
| `MC-GG-DEC-TIMESCALE` | Short-run and long-run effects not separated |
| `MC-GG-DEC-SCALE` | Local, national and global impacts merged into one judgement |
| `MC-GG-DEC-STAKEHOLDER` | Stakeholder views assumed to align, or dismissed as bias |
| `MC-GG-DEC-SUSTAINABILITY` | Sustainability treated as environmental only; reversibility not considered |
| `MC-GG-DEC-SOURCE-EVAL` | Conflicting sources averaged or ignored; provenance and date unconsidered |
| `MC-GG-DEC-SYNOPTIC` | Paper 1 physical knowledge not carried into a Paper 3 human decision |

## `GCSE-GEO-SKILLS` — Geographical skills, 35 questions, 10 categories

| tag | the error |
|---|---|
| `MC-GG-SKILL-GRID-REF` | Northings read before eastings; four- and six-figure precision confused |
| `MC-GG-SKILL-SCALE` | Map distance converted with the wrong scale factor; enlargement's effect on scale missed |
| `MC-GG-SKILL-CONTOUR` | Contour spacing read as height; the V-rule for valleys inverted |
| `MC-GG-SKILL-MAP-CONVENTIONS` | Bearings taken from the wrong reference; unfamiliar symbols guessed rather than keyed |
| `MC-GG-SKILL-GRAPH-CHOICE` | Graph type chosen by familiarity rather than by data type |
| `MC-GG-SKILL-PERCENT` | Percentage change and percentage points conflated; index values read as absolute |
| `MC-GG-SKILL-AVERAGES` | Mean, mode and range confused |
| `MC-GG-SKILL-SCATTER` | Correlation direction read from point density rather than trend |
| `MC-GG-SKILL-RATES` | Density and gradient computed without dividing by the denominator |
| `MC-GG-SKILL-INTERPRET-IMAGE` | Photographs and sketches described rather than interpreted geographically |

---

## Cross-bank tags

Three concepts appear in more than one bank and should share a tag rather than
be duplicated. Tags are subject-scoped, so this is safe:

| tag | banks |
|---|---|
| `MC-GG-SKILL-FLOWMAP` | `DEV`, `INDIA` — proportional flow-line maps |
| `MC-GG-ENQ-TEMPORAL-BIAS` | `ENQUIRY`, `URBFIELD`, `RIVERFIELD` — one-off readings generalised |
| `MC-GG-SKILL-GIS` | `HAZ`, `FORESTS`, `URBFIELD` — what GIS adds to an enquiry |

## Cost

| | |
|---|---|
| Categories | ~150 |
| Labels | ~150, in `data/misconception-labels.js` |
| Starters | ~150, in `data/starter-activities.js` — the real cost |
| Ratchets | `gcse-geo` 0.78 → ~0.00 single-use, 0.99 → 0 mechanical |

This is roughly three times the A-Level geo job. `_mcCuratedStarter` /
`_mcStarterFallback` keep an unwritten starter usable but not good, and per
`dev/audit-banks.js` the `NO STARTER` check fires for every aggregatable tag
once the ratchet is tightened — so **the ratchets must not be tightened until
the starters exist**, or the audit will fail on tags this work created.

Suggested sequencing, so it ships in reviewable pieces rather than one 640-row
commit:

1. **Paper 3** (`ENQUIRY`, `RIVERFIELD`, `URBFIELD`, `DECISIONS`, `SKILLS`) —
   190 questions, 49 categories. Best value: the errors are procedural and
   genuinely diagnostic, and the categories transfer across all three papers.
2. **Paper 1 physical** (`HAZ`, `UKLAND`, `BIOSPHERE`, `FORESTS`) — 202
   questions, 52 categories.
3. **Paper 2 human** (`DEV`, `INDIA`, `URB`, `UKHUMAN`) — 201 questions, 47
   categories.

## Four things I need from you

1. **The `MC-GG-*` prefix**, versus keeping `MC-GEO-*` and risking the
   cross-specification collision that A-Level geo just had to unpick.
2. **Granularity.** ~150 categories at ~4 questions each matches A-Level geo.
   Halving it would double the aggregation but blur, for example,
   cyclone formation with cyclone structure.
3. **Whether the `-FB-` fill-blank twins should keep inheriting their source's
   tag.** They will now sit on a real category rather than an index, so they
   stop being a way to fake aggregation — but they still restate their source
   rather than testing a second angle.
4. **The definitional question, again.** The generation-B `-KT-` key-term
   questions (74 of them) are pure recall. Same trade-off History and econ
   raised: a tag there means "missed a definition in this area".
