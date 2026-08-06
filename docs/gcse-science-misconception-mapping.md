# GCSE Combined Science — misconception tag mapping

Companion to `docs/history-misconception-mapping.md`, recording the retag of
the `gcse-science` subject onto shared misconception tags.

## Why

Combined Science's 212 questions previously carried 156 tags, 100 of them used
by a single question. Nothing aggregated, so the teacher heatmap ranked
individual questions rather than errors and no starter activity could attach.

Combined Science is a content subset of the separate sciences, which already
carry a clean 96-tag `MC-SEP-*` taxonomy with labels and starters written. So
this was a *mapping* job, not a taxonomy design: questions were moved onto the
existing science tags wherever one named the same underlying error.

## Result

| | before | after |
|---|---|---|
| distinct tags | 156 | 83 |
| tags used by a single question | 100 | 15 |
| questions on a single-use tag | 100 (47%) | 15 (7.1%) |

64 existing `MC-SEP-*` tags were reused; 8 new ones were added for errors
Combined Science tests that the separate sciences had no tag for. No question
content changed — across all 7,601 questions in the bank the diff is 195 `tag`
values and nothing else. Options, keys, stems, scaffolds and reforge twins are
byte-identical to the previous commit.

`dev/audit-banks.js` now holds `gcse-science` at a maximum single-use share of
0.08, so this cannot regress.

## New tags

Eight errors had no existing `MC-SEP-*` home. Each has a label in
`data/misconception-labels.js` and a starter with a reveal in
`data/starter-activities.js`.

| tag | label |
|---|---|
| `MC-SEP-BIO-TRIAL` | Controls and placebos isolate the drug's effect |
| `MC-SEP-BIO-CIRCULATION` | Double circulation — blood passes the heart twice |
| `MC-SEP-BIO-GASEXCHANGE` | Surface area and diffusion distance, not effort |
| `MC-SEP-CHEM-MASS` | Mass is conserved; gases escaping are still mass |
| `MC-SEP-CHEM-GROUPS` | Group trends follow the outer-shell electrons |
| `MC-SEP-CHEM-ENERGETICS` | Exothermic releases energy; endothermic takes it in |
| `MC-SEP-PHYS-OPTICS` | Light rays bend at the boundary, not inside the glass |
| `MC-SEP-PHYS-SPRING` | Extension is proportional only up to the limit |

## Judgement calls worth knowing

- `CHEM-ENERGY-02` ("600 J in 20 s — what is the power?") is a physics power
  calculation that happened to sit in a chemistry bank. It is mapped to
  `MC-SEP-PHYS-POWER`, not to a chemistry tag.
- `BIO-FOODTEST-01` (starch test) maps to `MC-SEP-CHEM-FOOD`; food tests live
  under chemistry in the separate-science taxonomy.
- `BIO-TRANSPORT-01` (active transport) maps to `MC-SEP-BIO-DIFFUSION`, whose
  error — movement *down* a gradient — is exactly what active transport is
  confused with.
- `CHEM-RATE-01` is surface area, so it maps to `MC-SEP-CHEM-SURFACE` rather
  than to `MC-SEP-CHEM-RATE` with the other two rate questions.
- Ten tags are shared with the separate sciences but used by only one
  Combined Science question each. They aggregate globally and already have
  labels and starters; they are not per-question tags.

## Deliberately left on a per-question tag

These 11 name a topic rather than a shared error, so grouping them would
invent an aggregate that does not exist. Each still carries a label, and the
six that reach two questions via generated clones also carry a starter.

| tag | label | questions |
|---|---|---|
| `BIO-AUXIN-01` | Auxin drives unequal growth, not movement | 1 |
| `BIO-DIFF-01` | Differentiation gives structure suited to a function | 2 |
| `BIO-GM-01` | A vector carries the gene into the host cell | 2 |
| `BIO-HUMAN-01` | Fertiliser runoff removes oxygen from water | 1 |
| `BIO-MED-02` | Monoclonal antibodies bind one specific target | 2 |
| `BIO-MICRO-01` | Magnification multiplies, it does not add | 2 |
| `BIO-PLANT-02` | Root hair cells add surface area for uptake | 1 |
| `CHEM-MIX-01` | Crystallisation recovers a dissolved solid | 2 |
| `PHYS-PRESSURE-01` | Pressure is force spread over area | 1 |
| `PHYS-QUANT-01` | Vectors carry direction; scalars do not | 2 |
| `PHYS-STOP-01` | Stopping distance is thinking plus braking | 1 |
## Full mapping

| target tag | label | questions | mapped from |
|---|---|---|---|
| `MC-SEP-BIO-BREEDING` | Selective breeding is human choice, not natural selection | 2 | `BIO-BREED-01` |
| `MC-SEP-BIO-CARBON` | Deforestation reduces carbon dioxide uptake | 1 | `BIO-CARBON-02` |
| `MC-SEP-BIO-CELL` | Cell membrane controls entry and exit, not the wall | 2 | `BIO-CELL-01` |
| `MC-SEP-BIO-CIRCULATION` | Double circulation — blood passes the heart twice | 2 | `BIO-CIRC-01`, `BIO-HEART-01` |
| `MC-SEP-BIO-CYCLES` | Decomposers return mineral ions to soil | 2 | `BIO-CYCLE-01`, `BIO-DECOMP-02` |
| `MC-SEP-BIO-DEFENCE` | White blood cells — phagocytosis, antibodies, antitoxins | 2 | `BIO-IMMUNE-02` |
| `MC-SEP-BIO-DIFFUSION` | Diffusion is net movement down a gradient | 2 | `BIO-TRANSPORT-01` |
| `MC-SEP-BIO-DISEASE` | Antibiotics do not work on viruses | 4 | `BIO-DISEASE-01`, `BIO-SPREAD-01` |
| `MC-SEP-BIO-DNA` | Gene, DNA and chromosome — which contains which | 2 | `BIO-DNA-01` |
| `MC-SEP-BIO-ECOLOGY` | Quadrats sample distribution and abundance | 2 | `BIO-FIELD-01`, `BIO-POP-01` |
| `MC-SEP-BIO-ENZYME` | Enzymes are catalysts — lowering activation energy | 3 | `BIO-ENZYME-01`, `MC-GCSE-PHASE6-BIO1-01` |
| `MC-SEP-BIO-EVOLUTION` | Natural selection acts on existing variation | 8 | `BIO-EVOL-01`, `BIO-EVOL-02`, `BIO-EVIDENCE-01`, `BIO-EXTINCT-01` |
| `MC-SEP-BIO-FEEDBACK` | Negative feedback reverses a change | 2 | `BIO-HOMEOSTASIS-01`, `BIO-TEMP-01` |
| `MC-SEP-BIO-FOODCHAIN` | Energy loss between levels limits chain length | 3 | `BIO-ECOSYSTEM-01`, `BIO-WEB-01`, `MC-GCSE-PHASE6-BIO2-02` |
| `MC-SEP-BIO-GASEXCHANGE` | Surface area and diffusion distance, not effort | 2 | `BIO-GAS-01`, `BIO-RESP-01` |
| `MC-SEP-BIO-GENETICS` | Allele is a version of a gene, not a gene itself | 5 | `BIO-GEN-01`, `BIO-GEN-02`, `MC-GCSE-PHASE6-BIO1-02` |
| `MC-SEP-BIO-HOMEOSTASIS` | Kidneys filter and selectively reabsorb | 1 | `BIO-KIDNEY-01` |
| `MC-SEP-BIO-IMMUNITY` | Vaccines create memory cells, not instant immunity | 2 | `BIO-IMMUNE-01` |
| `MC-SEP-BIO-MITOSIS` | Mitosis gives identical cells; meiosis gives gametes | 2 | `BIO-MITOSIS-01` |
| `MC-SEP-BIO-NERVOUS` | Reflex arc order — sensory, relay, motor | 2 | `BIO-NERVE-01`, `BIO-REFLEX-01` |
| `MC-SEP-BIO-PHOTO` | Photosynthesis word equation and its reactants | 2 | `BIO-PLANT-01`, `BIO-LIMIT-01` |
| `MC-SEP-BIO-PLANTS` | Xylem carries water; phloem carries sugars | 1 | `BIO-XYLEM-01` |
| `MC-SEP-BIO-RIBO` | Ribosomes make protein — site of protein synthesis | 2 | `BIO-CELL-02` |
| `MC-SEP-BIO-TRANSPIRATION` | Transpiration is water loss through stomata | 3 | `BIO-TRANS-02`, `BIO-STOMA-01`, `MC-GCSE-PHASE6-BIO2-01` |
| `MC-SEP-BIO-TRIAL` | Controls and placebos isolate the drug's effect | 4 | `BIO-MED-01`, `BIO-TRIAL-02` |
| `MC-SEP-CHEM-ACID` | pH 7 is neutral; the scale is not linear | 2 | `CHEM-ACID-01` |
| `MC-SEP-CHEM-ACIDMETAL` | Acid plus metal gives salt and hydrogen | 4 | `CHEM-REACTION-01`, `CHEM-SALT-01` |
| `MC-SEP-CHEM-ATMOS` | Complete combustion gives carbon dioxide and water | 3 | `CHEM-EARTH-01`, `CHEM-ATMOS-02`, `CHEM-COMBUST-02` |
| `MC-SEP-CHEM-ATOM` | Electronic structure — filling shells in order | 2 | `CHEM-ATOM-01` |
| `MC-SEP-CHEM-BOND` | Giant covalent vs simple molecular structure | 3 | `CHEM-IONIC-01`, `MC-GCSE-PHASE6-CHEM1-01` |
| `MC-SEP-CHEM-CARBON` | Carbon-neutral claims and lifecycle emissions | 3 | `CHEM-RESOURCES-01`, `CHEM-RECYCLE-02`, `CHEM-BIOFUEL-01` |
| `MC-SEP-CHEM-CHROM` | Chromatography separates soluble substances | 2 | `CHEM-CHROM-02` |
| `MC-SEP-CHEM-CRACK` | Cracking makes shorter, more useful hydrocarbons | 1 | `CHEM-FUEL-02` |
| `MC-SEP-CHEM-ELECTRO` | Cathode attracts cations and reduces them | 5 | `CHEM-ELECTRO-01`, `CHEM-ELECTRO-02`, `MC-GCSE-PHASE6-CHEM1-02` |
| `MC-SEP-CHEM-ENERGETICS` | Exothermic releases energy; endothermic takes it in | 4 | `CHEM-ENERGY-01`, `CHEM-ENERGY-03`, `CHEM-PRACTICAL-02`, `MC-GCSE-PHASE6-CHEM2-02` |
| `MC-SEP-CHEM-EQUIL` | Dynamic equilibrium — rates equal, reactions continue | 6 | `CHEM-EQ-01`, `CHEM-EQ-02`, `CHEM-EQ-03` |
| `MC-SEP-CHEM-EQUIL2` | Only temperature changes the equilibrium constant | 2 | `CHEM-EQ-04` |
| `MC-SEP-CHEM-EXTRACT` | Reactivity decides extraction method | 4 | `CHEM-METALS-01`, `CHEM-METALS-02` |
| `MC-SEP-CHEM-FOOD` | Food tests and their positive results | 2 | `BIO-FOODTEST-01` |
| `MC-SEP-CHEM-FORMULA` | Ionic formulae must balance the charges | 2 | `CHEM-FORMULA-01` |
| `MC-SEP-CHEM-FRACTION` | Fractional distillation uses boiling point differences | 1 | `CHEM-FUEL-01` |
| `MC-SEP-CHEM-GROUPS` | Group trends follow the outer-shell electrons | 6 | `CHEM-GROUP-01`, `CHEM-HALOGEN-01`, `CHEM-NOBLE-01`, `CHEM-G1-02`, `CHEM-G7-02`, `CHEM-G0-02` |
| `MC-SEP-CHEM-ISOTOPE` | Mass number is protons plus neutrons | 2 | `CHEM-ATOM-02` |
| `MC-SEP-CHEM-MASS` | Mass is conserved; gases escaping are still mass | 4 | `CHEM-EQUATION-01`, `CHEM-MASS-02` |
| `MC-SEP-CHEM-POLYMER` | Addition vs condensation polymerisation | 1 | `CHEM-POLYMER-01` |
| `MC-SEP-CHEM-RATE` | Temperature raises collision frequency AND energy | 3 | `CHEM-RATE-02`, `CHEM-RATE-03`, `MC-GCSE-PHASE6-CHEM2-01` |
| `MC-SEP-CHEM-REDOX` | OIL RIG — oxidation is loss of electrons | 4 | `CHEM-REDOX-01`, `CHEM-RUST-01` |
| `MC-SEP-CHEM-STATES` | Melting is a physical change, not a new substance | 4 | `CHEM-MATTER-01`, `CHEM-SOLUTION-01` |
| `MC-SEP-CHEM-SURFACE` | Smaller pieces mean more surface area, not more energy | 1 | `CHEM-RATE-01` |
| `MC-SEP-CHEM-TITRATION` | Titration measures volume for neutralisation | 2 | `CHEM-TITRATION-01` |
| `MC-SEP-CHEM-WATER` | Potable water is safe, not pure | 2 | `CHEM-WATER-01`, `CHEM-WATER-02` |
| `MC-SEP-PHYS-CIRCUIT` | Current is the same everywhere in series | 1 | `PHYS-SERIES-02` |
| `MC-SEP-PHYS-DENSITY` | Density is mass divided by volume | 3 | `PHYS-DENSITY-01`, `PHYS-DENSITY-02`, `PHYS-FLOAT-01` |
| `MC-SEP-PHYS-ELECTRIC` | Electrical power P = IV | 2 | `PHYS-POWER-02`, `PHYS-GRID-01` |
| `MC-SEP-PHYS-EM` | Only electromagnetic waves cross a vacuum | 2 | `PHYS-EM-01`, `PHYS-EM-02` |
| `MC-SEP-PHYS-ENERGY` | Energy stores and the transfers between them | 7 | `PHYS-ENERGY-01`, `PHYS-ENERGY-02`, `PHYS-WORK-01`, `PHYS-KINETIC-02`, `PHYS-EFF-01` |
| `MC-SEP-PHYS-GAS` | Compression raises pressure through collision frequency | 2 | `PHYS-PARTICLE-01`, `PHYS-GAS-02` |
| `MC-SEP-PHYS-HALFLIFE` | Half-life halves what remains, not what is gone | 3 | `PHYS-RAD-01`, `PHYS-HALF-02`, `MC-GCSE-PHASE6-PHYS1-02` |
| `MC-SEP-PHYS-HOUSE` | Parallel wiring lets appliances work independently | 2 | `PHYS-CIRCUIT-01`, `PHYS-SAFETY-01` |
| `MC-SEP-PHYS-LIQUID` | Liquid pressure depends on depth and density | 1 | `PHYS-LIQUID-01` |
| `MC-SEP-PHYS-MOTION` | Average speed is total distance over total time | 7 | `PHYS-MOTION-01`, `PHYS-MOTION-02`, `PHYS-GRAPH-01`, `PHYS-GRAPH-02`, `MC-GCSE-PHASE6-PHYS1-01` |
| `MC-SEP-PHYS-MOTOR` | Motor effect — current in a field feels a force | 3 | `PHYS-MAG-01`, `PHYS-MOTOR-02`, `MC-GCSE-PHASE6-PHYS2-02` |
| `MC-SEP-PHYS-NEWTON` | Zero resultant force means constant velocity, not rest | 5 | `PHYS-FORCE-01`, `PHYS-FORCE-02`, `PHYS-TERMINAL-01` |
| `MC-SEP-PHYS-OHM` | Ohmic conductors need constant temperature | 2 | `PHYS-ELEC-02`, `MC-GCSE-PHASE6-PHYS2-01` |
| `MC-SEP-PHYS-OPTICS` | Light rays bend at the boundary, not inside the glass | 2 | `PHYS-LIGHT-01`, `PHYS-REFLECT-01` |
| `MC-SEP-PHYS-POWER` | Power is the rate of energy transfer | 2 | `CHEM-ENERGY-02`, `PHYS-POWER-01` |
| `MC-SEP-PHYS-RADIATION` | Alpha, beta, gamma — penetration vs ionisation | 2 | `PHYS-SAFETY-02`, `PHYS-NUCLEAR-01` |
| `MC-SEP-PHYS-RESIST` | Heating a metal wire raises its resistance | 2 | `PHYS-RESIST-02`, `PHYS-THERM-01` |
| `MC-SEP-PHYS-SPRING` | Extension is proportional only up to the limit | 2 | `PHYS-SPRINGS-01`, `PHYS-SPRING-02` |
| `MC-SEP-PHYS-TRANSFORM` | Transformers need a changing magnetic field | 2 | `PHYS-INDUCTION-01`, `PHYS-TRANSFORM-01` |
| `MC-SEP-PHYS-UNITS` | Joule for energy, watt for power | 1 | `PHYS-ELEC-01` |
| `MC-SEP-PHYS-WAVE` | Frequency, wavelength and period distinguished | 4 | `PHYS-WAVES-01`, `PHYS-WAVES-02`, `PHYS-WAVE-03` |
## Note on the twelve Phase 6 items

`appendGenerated()` derives `tag = "MC-" + id`, giving each generated question a
tag unique to itself. The twelve `GCSE-PHASE6-*` Combined Science items are
therefore retagged just after the `appendGenerated` calls in
`data/forge-data.js`, via `phase6GcseScienceTags`, rather than at a literal.
Any future `appendGenerated` content in these banks needs the same treatment.
