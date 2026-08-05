// ============================================================
// data/misconception-labels.js — Canonical misconception-tag labels
// Loaded after data/forge-data.js (needs BANKS) and before any page that
// renders a misconception tag: teacher.html, school-overview.html,
// anvil.html, profile.html.
//
// Until this file existed, each of those four pages carried its own
// hand-copied MC_LABELS object. They had drifted: teacher.html had 656
// entries, school-overview.html 429, anvil.html 514, profile.html 426 — and
// 162 tags that existed in more than one file had genuinely DIFFERENT text
// in each (not just punctuation — e.g. MC-RS-01 described the ontological
// argument in one file and the cosmological argument in another). A teacher
// could see a different description of the same misconception depending
// which page they were on. This file replaces all four with one source.
//
// MC_LABELS below covers every misconception tag that is actually shared
// across two or more questions in the current bank — the tags a heatmap
// meaningfully aggregates. It does not attempt to hand-label the ~6,950
// tags used by exactly one question each: those are effectively per-question
// identifiers (tag === "MC-" + question id for the large majority of them),
// not misconception categories, and writing 6,950 one-off descriptions by
// hand in a single pass would not be a responsible way to produce them.
// resolveMCLabel() below covers those instead, by deriving a short label
// from the question's own scaffold at the point it's needed.
//
// Current state, measured over the 6,896 tags in the bank: 584 come from
// MC_LABELS, 6,312 are derived, none fall back to a bare code. (The tag count
// fell from 7,239 when GCSE Economics was retagged from 420 per-question tags
// onto 76 shared MC-GE-* categories, all of them hand-labelled below.) Of the
// derived labels 375 are still truncated (always at a word boundary), and
// 1,675 tags share a label with two or more others. The remaining sharers
// are tags whose scaffold opens with the same generic line and whose stem
// gives nothing better — worth revisiting by hand-labelling the banks they
// cluster in (IB Paper 2 skills, French/Spanish tense work) rather than by
// tuning the derivation further.
//
// A small number of reconciled tags here are not used by any question in
// the CURRENT bank (their content was superseded when a bank was rewritten,
// but historical rows in the `responses` table can still reference the old
// tag). They are kept so old data doesn't regress to a bare code.
// ============================================================

const MC_LABELS = {
  "BIO-TRANSPORT-01": "Active transport confused with diffusion direction",
  "MC-AD-01": "AD formula wrong",
  "MC-AD-02": "Interest rate transmission mechanism",
  "MC-AD-03": "Confidence and AD direction",
  "MC-AD-04": "AD shift causes lower inflation",
  "MC-AD-05": "Exchange rate to net exports chain",
  "MC-AD-06": "Movement along vs shift of AD",
  "MC-AD-07": "Wage rise always increases AD",
  "MC-AD-08": "MPC vs average propensity to consume confused",
  "MC-APP-BIO": "Genotype vs phenotype confused",
  "MC-APP-COG": "Schema definition — cognitive approach",
  "MC-APP-COMPARE": "Free will emphasis — humanistic vs other approaches",
  "MC-APP-HUM": "Conditions of worth — Rogers' humanistic theory",
  "MC-APP-OPERANT": "Positive vs negative reinforcement confused",
  "MC-APP-ORIGINS": "Introspection — Wundt's method",
  "MC-APP-PSYDYN": "Freud's tripartite personality — id, ego, superego",
  "MC-APP-SLT": "Bandura's four mediational processes",
  "MC-AS-01": "SRAS vs LRAS distinction",
  "MC-AS-02": "SRAS shift factors confused",
  "MC-AS-04": "LRAS shift factors confused",
  "MC-AS-05": "Movement along vs shift of SRAS",
  "MC-AS-06": "Unit labour costs and SRAS",
  "MC-AS-07": "Keynesian AS curve — horizontal section misread",
  "MC-ATT-01": "Bowlby monotropic theory",
  "MC-ATT-02": "Strange Situation procedure",
  "MC-ATT-03": "Secure attachment = no distress (wrong)",
  "MC-ATT-04": "Strange Situation validity",
  "MC-ATT-05": "Internal working model",
  "MC-ATT-06": "Maternal deprivation hypothesis",
  "MC-ATT-07": "Bowlby's 44 thieves study — affectionless psychopathy",
  "MC-ATT-08": "Harlow and contact comfort",
  "MC-BIO-01": "Aerobic respiration stages",
  "MC-BIO-02": "Prokaryote vs eukaryote",
  "MC-BIO-03": "DNA replication enzymes",
  "MC-BIO-04": "Facilitated vs active transport",
  "MC-BIO-05": "Magnification formula (divide not multiply)",
  "MC-BIO-06": "Fluid mosaic model",
  "MC-BIO-07": "S phase vs mitosis stages",
  "MC-BIO-08": "Denaturation vs inhibition",
  "MC-BIO-09": "Osmosis defined by concentration, not water potential",
  "MC-BIO-10": "Active transport vs facilitated diffusion confused",
  "MC-BIO-11": "Lock-and-key used where induced fit needed",
  "MC-BIO-12": "Enzyme denaturation — active site shape change",
  "MC-BIO-13": "Prokaryote features — no membrane-bound organelles",
  "MC-BIO-14": "Surface area to volume ratio and organism size",
  "MC-BIO-15": "Calvin cycle vs light-dependent reactions confused",
  "MC-BIO-16": "Dominant phenotype assumed homozygous",
  "MC-BIO-FIGHT": "Fight-or-flight — acute stress response sequence",
  "MC-BIO-LOCAL": "Localisation vs holistic theory of brain function",
  "MC-BIO-NS": "CNS vs PNS structure confused",
  "MC-BIO-PLAST": "Brain plasticity definition",
  "MC-BIO-RHYTHM": "Circadian, infradian, ultradian rhythms confused",
  "MC-BIO-SCAN": "Brain scanning techniques — fMRI vs post-mortem",
  "MC-BIO-SPLIT": "Sperry's split-brain research — hemisphere lateralisation",
  "MC-BIO-SYNAPSE": "Synaptic transmission — electrical vs chemical",
  "MC-BNK-01": "Commercial bank intermediation",
  "MC-BNK-02": "Credit creation multiplier",
  "MC-BNK-03": "Bank bailout evaluation",
  "MC-BNK-04": "Post-2008 regulation",
  "MC-BOP-01": "Current account deficit always bad",
  "MC-BOP-02": "Fiscal deficit = current account deficit",
  "MC-BOP-03": "J-curve drawn improving immediately",
  "MC-BOP-04": "Marshall-Lerner condition omitted",
  "MC-BOP-05": "Capital/financial account ignored",
  "MC-BOP-06": "Expenditure-switching vs expenditure-reducing policy confused",
  "MC-BOP-08": "Current account deficit — financed by capital account surplus",
  "MC-BOP-GCSE-01": "Budget deficit confused with balance of payments deficit",
  "MC-BUS-01": "Product vs market orientation",
  "MC-BUS-02": "Break-even calculation (contribution)",
  "MC-BUS-03": "Price skimming vs penetration",
  "MC-BUS-04": "Sole trader vs Ltd liability",
  "MC-BUS-05": "Herzberg hygiene vs motivators",
  "MC-BUS-06": "Ansoff Matrix - product vs market dev",
  "MC-BUS-07": "Net profit margin calculation",
  "MC-BUS-08": "Labour productivity calculation",
  "MC-BUS-09": "PED direction misread from revenue changes",
  "MC-BUS-10": "Profitable business fails — liquidity vs profit",
  "MC-BUS-11": "Margin of safety confused with break-even level",
  "MC-BUS-12": "Market segmentation rationale",
  "MC-BUS-13": "Boston Matrix — share and growth axes confused",
  "MC-BUS-14": "Gross vs operating margin deductions mixed up",
  "MC-BUS-15": "Sources of finance — retained profit vs loans",
  "MC-BUS-16": "Product life cycle extension strategies",
  "MC-BUS-17": "MNC impact — one-sided analysis",
  "MC-BUS-18": "Exchange rate effect on exporters — partial analysis",
  "MC-BUS-19": "Free trade vs protectionism confused",
  "MC-BUS-20": "CSR definition confused with legal obligation",
  "MC-BUS-21": "Ethics vs law conflated",
  "MC-BUS-22": "Infant industry argument — temporary vs permanent ignored",
  "MC-BUS-23": "Cultural intelligence — ethnocentrism error",
  "MC-CB-01": "Bank of England functions",
  "MC-CB-02": "Central bank independence",
  "MC-CB-03": "FPC vs MPC roles",
  "MC-CB-05": "Financial stability definition",
  "MC-CHEM-01": "Relative atomic mass = fractional protons (wrong)",
  "MC-CHEM-02": "Ionisation energy jumps",
  "MC-CHEM-03": "Lone pairs in dot-and-cross diagrams",
  "MC-CHEM-04": "Giant covalent vs simple molecular",
  "MC-CHEM-05": "Empirical vs molecular formula",
  "MC-CHEM-06": "Electronegativity trends",
  "MC-CHEM-07": "Mass spectrometer m/z ratio",
  "MC-CHEM-08": "Ionic conduction - ions not electrons",
  "MC-CHEM-09": "Water — hydrogen bonding not covalent bonds",
  "MC-CHEM-10": "Exothermic — negative ΔH sign",
  "MC-CHEM-11": "Le Chatelier temperature shift on exothermic equilibria",
  "MC-CHEM-12": "Ions formed by removing wrong electrons (4s vs 3d)",
  "MC-CHEM-13": "Concentration effect on rate explained as energy not frequency",
  "MC-CHEM-14": "Dative covalent bond — both electrons from one atom",
  "MC-CHEM-15": "Titration calculation — moles and concentration",
  "MC-CHEM-16": "Electronegativity trend across a period",
  "MC-COAST-01": "Hydraulic action mechanism",
  "MC-COAST-02": "Differential erosion — headland and bay formation",
  "MC-COAST-03": "Headland erosion sequence — cave, arch, stack, stump",
  "MC-COAST-04": "Longshore drift — swash and backwash direction",
  "MC-COAST-05": "Hard engineering — groynes starve beaches downdrift",
  "MC-COAST-06": "Storm wave erosion vs constructive wave deposition",
  "MC-COG-BAILLARGEON": "Baillargeon's violation of expectation — critique of Piaget",
  "MC-COG-COMPARE": "Piaget vs Vygotsky — engine of cognitive development",
  "MC-COG-MIRROR": "Mirror neurons — action observation and execution",
  "MC-COG-PIAGET": "Assimilation vs accommodation confused",
  "MC-COG-SELMAN": "Selman's social perspective-taking — clinical interview method",
  "MC-COG-TOM": "Sally-Anne task — theory of mind",
  "MC-COG-VYGOTSKY": "Zone of proximal development",
  "MC-CON-01": "Invitation to treat vs offer confused",
  "MC-CON-02": "Postal rule misapplied",
  "MC-CON-03": "Past consideration not recognised",
  "MC-CON-04": "Implied terms ignored",
  "MC-CON-05": "Condition vs warranty distinction wrong",
  "MC-CON-06": "Exclusion clause incorporation — notice timing",
  "MC-CON-07": "Remoteness — Hadley v Baxendale limbs confused",
  "MC-CON-08": "Specific performance availability misunderstood",
  "MC-CRIM-01": "Crime vs deviance vs immorality",
  "MC-CRIM-02": "Dark figure of crime",
  "MC-CRIM-03": "Official statistics limitations",
  "MC-CRIM-04": "Moral panic and folk devils",
  "MC-CRIM-05": "White-collar crime definition",
  "MC-CRIM-06": "Merton's strain theory",
  "MC-CRIM-07": "Right realism — rational choice vs biological factors",
  "MC-CRIM-08": "Situational crime prevention displacement",
  "MC-CRIM-09": "Labelling theory — deviance socially constructed",
  "MC-CRIM-10": "Right realism — rational choice and situational crime prevention",
  "MC-CRIM-11": "Left realism — relative deprivation and square of crime",
  "MC-CRIM-12": "Labelling theory — deviance as fixed not constructed",
  "MC-CRIM-13": "Feminist criminology — gender and victimisation",
  "MC-CS-01": "Off-by-one loop errors",
  "MC-CS-02": "Compiler vs interpreter",
  "MC-CS-03": "Binary search complexity",
  "MC-CS-04": "Big O notation O(n²)",
  "MC-CS-05": "Stack vs queue LIFO/FIFO",
  "MC-CS-06": "Subroutine vs program",
  "MC-CS-07": "TCP/IP protocol roles",
  "MC-CS-08": "Encryption definition",
  "MC-CS-09": "Queue rear pointer — circular array behaviour",
  "MC-CS-10": "Public key cryptography — asymmetric encryption",
  "MC-CS-11": "DFS vs BFS — depth vs breadth traversal",
  "MC-CS-12": "Normalisation — eliminate redundancy not improve speed",
  "MC-CS-ETHICS": "Data protection principles",
  "MC-DE-01": "Nominative used instead of accusative after direct object",
  "MC-DE-02": "Adjective endings wrong in accusative masculine",
  "MC-DE-03": "Sein vs werden confused in passive constructions",
  "MC-DE-04": "Word order in subordinate clauses — verb not sent to end",
  "MC-DE-05": "False cognate errors (e.g. bekommen ≠ become)",
  "MC-DE-06": "Modal verb position — infinitive not placed at end",
  "MC-DE-07": "Gender assignment errors on common nouns",
  "MC-DE-08": "Imperfect vs perfect tense — wrong tense in written register",
  "MC-DE-09": "Fixed-case prepositions confused with two-way group",
  "MC-DE-10": "Two-way prepositions — motion vs location case choice",
  "MC-DE-11": "Relative pronoun case taken from main clause not its own",
  "MC-DE-12": "Konjunktiv II — hypothetical conditional",
  "MC-DE-13": "Werden-passive vs sein-passive (process vs state)",
  "MC-DE-14": "Perfect tense with seit for continuing actions",
  "MC-DE-15": "um...zu vs damit — same vs different subjects",
  "MC-DE-16": "German word order — time, manner, place",
  "MC-DEC-01": "Geographical issue — genuine dilemma not simple fact",
  "MC-DEC-02": "Decision-making question — one-sided argument not balanced",
  "MC-DEC-03": "Decision-making evidence — environmental, economic, social categories",
  "MC-DEC-08": "Command words — describe vs explain vs justify",
  "MC-DEC-12": "Resource booklet — conflicting sources reflect real bias",
  "MC-DEV-01": "HDI vs GDP per capita as development measure",
  "MC-DEV-03": "Developing vs emerging vs developed country classification",
  "MC-DEV-04": "Historical vs environmental causes of global inequality",
  "MC-DEV-06": "Rostow's modernisation theory — stages of growth",
  "MC-DEV-07": "Frank's dependency theory — core and periphery",
  "MC-DEV-08": "Top-down vs bottom-up development strategy",
  "MC-DEV-14": "Demographic transition model — stage identification",
  "MC-DEV-15": "Population pyramid shape — stage of DTM",
  "MC-DEV-16": "Dependency ratio calculation",
  "MC-EDU-01": "Role allocation (Davis and Moore)",
  "MC-EDU-02": "Correspondence principle (Bowles and Gintis)",
  "MC-EDU-03": "Class and underachievement causes",
  "MC-EDU-04": "Interactionist micro-level analysis",
  "MC-EDU-06": "ERA 1988 and marketisation",
  "MC-EDU-CLASS": "Bourdieu — cultural capital and class achievement",
  "MC-EDU-GENDER": "Girls' achievement — external and internal factors",
  "MC-EDU-INSCHOOL": "Gillborn and Youdell — A-to-C economy",
  "MC-EDU-PERSPECTIVE": "New Right — marketisation of education",
  "MC-EMP-01": "Unemployed = everyone without a job",
  "MC-EMP-02": "Unemployment types without causes",
  "MC-EMP-03": "Phillips curve treated as permanent",
  "MC-EMP-04": "Claimant count = ILO measure",
  "MC-EMP-05": "Real wage diagram gap mislabelled",
  "MC-EMP-08": "Hysteresis — long-term unemployment scarring",
  "MC-ENE-01": "Renewable vs non-renewable energy classification",
  "MC-ENE-03": "Physical, economic and political factors in energy access",
  "MC-ENE-07": "Unconventional fossil fuels — tar sands and shale gas",
  "MC-ENE-09": "Energy gap and energy security",
  "MC-ENG-01": "Semantic field vs imagery — imprecise terminology",
  "MC-ENG-02": "Free indirect discourse — misidentified or misnamed",
  "MC-ENG-03": "Polysyndeton vs asyndeton — effect confused",
  "MC-ENG-04": "Deixis — definition too narrow or unknown",
  "MC-ENG-05": "Bathos — applied to any anticlimax",
  "MC-ENG-06": "Dramatic irony — confused with character error",
  "MC-ENG-07": "Register — defined as formality only",
  "MC-ENG-08": "Repetition for emphasis — no analytical claim",
  "MC-ENG-09": "AO3 as wallpaper — context not connected to meaning",
  "MC-ENG-10": "Narrating plot instead of analysing method",
  "MC-ENG-11": "Quote-drop-paraphrase — no AO2 analysis",
  "MC-ENG-12": "Command word explore — treated as analyse",
  "MC-ENG-13": "AO4 comparison — similarity asserted not demonstrated",
  "MC-ENG-14": "AO5 absent — no personal evaluative response",
  "MC-ENG-15": "Unseen analysis — technique catalogue not analysis",
  "MC-ENG-16": "Form and structure — micro-analysis only",
  "MC-ENQ-01": "Fieldwork hypothesis — must be testable and directional",
  "MC-ENQ-03": "Primary vs secondary fieldwork data",
  "MC-ENQ-04": "Systematic vs random vs stratified sampling",
  "MC-ENQ-09": "Mode vs mean vs median confused",
  "MC-ENQ-11": "Evaluation vs conclusion in fieldwork write-up",
  "MC-ENQ-12": "Fieldwork method limitation — float vs flow meter",
  "MC-EXR-01": "Currency depreciation assumed universally bad",
  "MC-FIS-01": "Fiscal vs monetary policy confused",
  "MC-FIS-02": "Automatic stabilisers vs discretionary",
  "MC-FIS-06": "Laffer curve direction",
  "MC-FIS-07": "Fiscal policy time lags",
  "MC-FIS-08": "Crowding out mechanism",
  "MC-FISC-01": "Fiscal policy direction (expansionary vs contractionary) confused",
  "MC-FMK-01": "Financial markets roles",
  "MC-FMK-02": "Forward markets mechanism",
  "MC-FMK-03": "Asymmetric information in financial markets",
  "MC-FMK-04": "Stock market macro effects",
  "MC-FOR-02": "Tropical rainforest plant adaptations",
  "MC-FOR-04": "Keystone species — disproportionate ecosystem effect",
  "MC-FOR-11": "REDD scheme — carbon offset purpose",
  "MC-FOR-12": "Sustainable forestry management",
  "MC-FOR-BIO": "Lombroso's atavistic form theory",
  "MC-FOR-COG": "Kohlberg's levels of moral reasoning and offending",
  "MC-FOR-DIFF": "Sutherland's differential association theory",
  "MC-FOR-GEO": "Canter's circle theory of offender profiling",
  "MC-FOR-PROFILE": "Top-down offender profiling — FBI typology",
  "MC-FOR-PSYCH": "Eysenck's criminal personality — extraversion and neuroticism",
  "MC-FOR-TREAT": "Token economy — operant conditioning in custody",
  "MC-FR-01": "Avoir used as auxiliary with movement verbs instead of être",
  "MC-FR-02": "Passé composé used for habitual past instead of imparfait",
  "MC-FR-03": "Indicative used instead of subjunctive after trigger expressions",
  "MC-FR-04": "Qui/que relative pronouns confused",
  "MC-FR-05": "Conditionnel used in si clause instead of imparfait",
  "MC-FR-06": "Quantity expressions retain article incorrectly",
  "MC-FR-07": "Malgré followed by conjugated verb instead of noun phrase",
  "MC-FR-08": "Attitude questions answered without textual evidence",
  "MC-FR-09": "Y pronoun — replaces à/en + place",
  "MC-FR-10": "Direct pronoun used with indirect-object verbs",
  "MC-FR-11": "Double pronoun order — indirect before direct",
  "MC-FR-12": "Ne...que — restrictive not negative",
  "MC-FR-13": "Passé composé with depuis for continuing actions",
  "MC-FR-14": "venir de recent past replaced by anglicism juste",
  "MC-FR-15": "Après + bare infinitive instead of perfect infinitive",
  "MC-FR-16": "Faire + infinitive causative",
  "MC-GCSE-P1-CMP-01": "Barriers to entry confused",
  "MC-GCSE-P1-CMP-02": "Price vs non-price competition confused",
  "MC-GCSE-P1-CMP-03": "Competition consumer benefits missed",
  "MC-GCSE-P1-CMP-04": "Monopoly trade-offs ignored",
  "MC-GCSE-P1-CMP-05": "Market share and concentration confused",
  "MC-GCSE-P1-CMP-06": "Loss leader purpose confused",
  "MC-GCSE-P1-CMP-07": "Competition regulation rationale confused",
  "MC-GCSE-P1-CMP-08": "Product differentiation effects confused",
  "MC-GCSE-P1-DS-01": "Movement along vs demand shift",
  "MC-GCSE-P1-DS-02": "Substitutes and complements confused",
  "MC-GCSE-P1-DS-03": "Supply shift cost factors confused",
  "MC-GCSE-P1-DS-04": "Equilibrium definition confused",
  "MC-GCSE-P1-DS-05": "Total revenue calculation error",
  "MC-GCSE-P1-DS-06": "PED calculation and classification error",
  "MC-GCSE-P1-DS-07": "PES determinants confused",
  "MC-GCSE-P1-DS-08": "Price controls shortage and surplus reversed",
  "MC-GCSE-P1-FND-01": "Scarcity and opportunity cost confused",
  "MC-GCSE-P1-FND-02": "Factors of production confused",
  "MC-GCSE-P1-FND-03": "Scarcity confused with poverty",
  "MC-GCSE-P1-FND-04": "Opportunity cost misidentified",
  "MC-GCSE-P1-FND-05": "Division of labour benefits and costs confused",
  "MC-GCSE-P1-FND-06": "Product and service sectors confused",
  "MC-GCSE-P1-FND-07": "Enterprise role confused",
  "MC-GCSE-P1-FND-08": "PPF inside point confused",
  "MC-GCSE-P1-FND-09": "Enterprise role identified incorrectly",
  "MC-GCSE-P1-FND-10": "Opportunity cost confused with all alternatives",
  "MC-GCSE-P1-FND-11": "Division of labour disadvantage missed",
  "MC-GCSE-P1-FND-12": "Labour productivity calculation error",
  "MC-GCSE-P1-FND-13": "PPF efficiency confused with capacity growth",
  "MC-GCSE-P1-FND-14": "Primary, secondary and tertiary sectors confused",
  "MC-GCSE-P1-FND-15": "Opportunity cost misidentified in a work choice",
  "MC-GCSE-P1-FND-16": "Labour and capital factors confused",
  "MC-GCSE-P1-LAB-01": "Derived demand for labour confused",
  "MC-GCSE-P1-LAB-02": "Labour supply determinants confused",
  "MC-GCSE-P1-LAB-03": "Labour market equilibrium confused",
  "MC-GCSE-P1-LAB-04": "Wage differentials explanation incomplete",
  "MC-GCSE-P1-LAB-05": "Minimum wage binding condition confused",
  "MC-GCSE-P1-LAB-06": "Occupational and geographical mobility confused",
  "MC-GCSE-P1-LAB-07": "Gross and net pay confused",
  "MC-GCSE-P1-LAB-08": "Labour demand shift missed",
  "MC-GCSE-P1-MKT-01": "Factor and product markets confused",
  "MC-GCSE-P1-MKT-02": "Price signalling confused",
  "MC-GCSE-P1-MKT-03": "Price incentives misunderstood",
  "MC-GCSE-P1-MKT-04": "Factor market definition confused",
  "MC-GCSE-P1-MKT-05": "Free market fairness assumed",
  "MC-GCSE-P1-MKT-06": "Price mechanism behaviour incentives confused",
  "MC-GCSE-P1-MKT-07": "Shortage and surplus reversed",
  "MC-GCSE-P1-MKT-08": "Market failure externality missed",
  "MC-GCSE-P1-MNY-01": "Functions of money confused",
  "MC-GCSE-P1-MNY-02": "Money and barter distinction confused",
  "MC-GCSE-P1-MNY-03": "Interest calculation error",
  "MC-GCSE-P1-MNY-04": "Borrowing trade-offs ignored",
  "MC-GCSE-P1-MNY-05": "Saving purpose confused",
  "MC-GCSE-P1-MNY-06": "Insurance purpose confused",
  "MC-GCSE-P1-MNY-07": "Bank intermediation role confused",
  "MC-GCSE-P1-MNY-08": "Characteristics of money confused",
  "MC-GCSE-P1-PRD-01": "Fixed and variable costs confused",
  "MC-GCSE-P1-PRD-02": "Average cost calculation error",
  "MC-GCSE-P1-PRD-03": "Profit and revenue confused",
  "MC-GCSE-P1-PRD-04": "Labour productivity calculation error",
  "MC-GCSE-P1-PRD-05": "Productivity improvement factors confused",
  "MC-GCSE-P1-PRD-06": "Economies of scale type confused",
  "MC-GCSE-P1-PRD-07": "Diseconomies of scale missed",
  "MC-GCSE-P1-PRD-08": "Wellbeing and productivity link missed",
  "MC-GCSE-P2-BOP-01": "Current account credit and debit confused",
  "MC-GCSE-P2-BOP-02": "Trade in services confused",
  "MC-GCSE-P2-BOP-03": "Current account components confused",
  "MC-GCSE-P2-BOP-04": "Current account calculation error",
  "MC-GCSE-P2-BOP-05": "Investment imports and deficit confused",
  "MC-GCSE-P2-BOP-06": "Competitiveness solution missed",
  "MC-GCSE-P2-BOP-07": "Depreciation and current account confused",
  "MC-GCSE-P2-BOP-08": "Deficit evaluation incomplete",
  "MC-GCSE-P2-EXR-01": "Appreciation and depreciation confused",
  "MC-GCSE-P2-EXR-02": "Currency demand confused",
  "MC-GCSE-P2-EXR-03": "Depreciation and import prices confused",
  "MC-GCSE-P2-EXR-04": "Appreciation and exporters confused",
  "MC-GCSE-P2-EXR-05": "Currency conversion error",
  "MC-GCSE-P2-EXR-06": "Current account and currency confused",
  "MC-GCSE-P2-EXR-07": "Appreciation benefits confused",
  "MC-GCSE-P2-EXR-08": "J-curve effect confused",
  "MC-GCSE-P2-FISC-01": "Expansionary fiscal policy confused",
  "MC-GCSE-P2-FISC-02": "Automatic stabilisers confused",
  "MC-GCSE-P2-FISC-03": "Contractionary fiscal policy confused",
  "MC-GCSE-P2-FISC-04": "Public debt and deficit confused",
  "MC-GCSE-P2-FISC-05": "Government spending employment effect missed",
  "MC-GCSE-P2-FISC-06": "Crowding out confused",
  "MC-GCSE-P2-FISC-07": "Fiscal policy time lags missed",
  "MC-GCSE-P2-FISC-08": "Education spending supply effect missed",
  "MC-GCSE-P2-GLOB-01": "Globalisation definition confused",
  "MC-GCSE-P2-GLOB-02": "Multinational and FDI confused",
  "MC-GCSE-P2-GLOB-03": "Internet and globalisation link missed",
  "MC-GCSE-P2-GLOB-04": "Globalisation benefits overstated",
  "MC-GCSE-P2-GLOB-05": "Globalisation labour costs missed",
  "MC-GCSE-P2-GLOB-06": "MNC concerns missed",
  "MC-GCSE-P2-GLOB-07": "GDP per capita development limits missed",
  "MC-GCSE-P2-GLOB-08": "Global supply-chain risk missed",
  "MC-GCSE-P2-GRO-01": "Growth rate calculation error",
  "MC-GCSE-P2-GRO-02": "Real GDP per capita confused",
  "MC-GCSE-P2-GRO-03": "Boom and recession confused",
  "MC-GCSE-P2-GRO-04": "Growth determinants confused",
  "MC-GCSE-P2-GRO-05": "Growth benefits overstated",
  "MC-GCSE-P2-GRO-06": "Sustainable growth missed",
  "MC-GCSE-P2-GRO-07": "Nominal and real GDP confused",
  "MC-GCSE-P2-GRO-08": "GDP wellbeing limitations missed",
  "MC-GCSE-P2-INCOME-01": "Income and wealth confused",
  "MC-GCSE-P2-INCOME-02": "Median income confused",
  "MC-GCSE-P2-INCOME-03": "Wage differentials explanation incomplete",
  "MC-GCSE-P2-INCOME-04": "Inequality consequences missed",
  "MC-GCSE-P2-INCOME-05": "Progressive tax purpose confused",
  "MC-GCSE-P2-INCOME-06": "Income shares misread",
  "MC-GCSE-P2-INCOME-07": "Wealth accumulation missed",
  "MC-GCSE-P2-INCOME-08": "Welfare benefit purpose confused",
  "MC-GCSE-P2-MF-01": "Negative externality confused",
  "MC-GCSE-P2-MF-02": "Positive externality confused",
  "MC-GCSE-P2-MF-03": "Indirect tax externality effect confused",
  "MC-GCSE-P2-MF-04": "Subsidy externality effect confused",
  "MC-GCSE-P2-MF-05": "Property rights limitations missed",
  "MC-GCSE-P2-MF-06": "Merit good confused",
  "MC-GCSE-P2-MF-07": "Market failure definition confused",
  "MC-GCSE-P2-MF-08": "Government failure missed",
  "MC-GCSE-P2-MON-01": "Monetary Policy Committee confused",
  "MC-GCSE-P2-MON-02": "Interest rates and borrowing confused",
  "MC-GCSE-P2-MON-03": "Interest rate transmission confused",
  "MC-GCSE-P2-MON-04": "Mortgage rate effects confused",
  "MC-GCSE-P2-MON-05": "Interest rates and house prices confused",
  "MC-GCSE-P2-MON-06": "Interest rates and exchange rates confused",
  "MC-GCSE-P2-MON-07": "Monetary policy trade-off missed",
  "MC-GCSE-P2-MON-08": "Inflation target purpose confused",
  "MC-GCSE-P2-NAT-01": "Macroeconomic objectives confused",
  "MC-GCSE-P2-NAT-02": "Merit goods and VAT confused",
  "MC-GCSE-P2-NAT-03": "Progressive and regressive tax confused",
  "MC-GCSE-P2-NAT-04": "Government spending purpose confused",
  "MC-GCSE-P2-NAT-05": "Unemployment rate calculation error",
  "MC-GCSE-P2-NAT-06": "Budget deficit confused",
  "MC-GCSE-P2-NAT-07": "Ageing population spending effect confused",
  "MC-GCSE-P2-NAT-08": "Infrastructure external benefits missed",
  "MC-GCSE-P2-PRICE-01": "Inflation and price level confused",
  "MC-GCSE-P2-PRICE-02": "CPI calculation error",
  "MC-GCSE-P2-PRICE-03": "CPI weighting confused",
  "MC-GCSE-P2-PRICE-04": "Inflation and real savings confused",
  "MC-GCSE-P2-PRICE-05": "Demand-pull inflation confused",
  "MC-GCSE-P2-PRICE-06": "Deflation and disinflation confused",
  "MC-GCSE-P2-PRICE-07": "Inflation winners and losers confused",
  "MC-GCSE-P2-PRICE-08": "Price stability rationale missed",
  "MC-GCSE-P2-SUP-01": "Supply-side policy aim confused",
  "MC-GCSE-P2-SUP-02": "Education and productivity link missed",
  "MC-GCSE-P2-SUP-03": "Tax incentives and labour supply confused",
  "MC-GCSE-P2-SUP-04": "Infrastructure productivity link missed",
  "MC-GCSE-P2-SUP-05": "Privatisation trade-offs confused",
  "MC-GCSE-P2-SUP-06": "Childcare and labour supply missed",
  "MC-GCSE-P2-SUP-07": "Minimum wage trade-off confused",
  "MC-GCSE-P2-SUP-08": "Supply-side time lags missed",
  "MC-GCSE-P2-TRADE-01": "Import and export confused",
  "MC-GCSE-P2-TRADE-02": "Specialisation rationale confused",
  "MC-GCSE-P2-TRADE-03": "Free trade benefits overstated",
  "MC-GCSE-P2-TRADE-04": "Tariff confused",
  "MC-GCSE-P2-TRADE-05": "Comparative advantage confused",
  "MC-GCSE-P2-TRADE-06": "Common currency trade effect missed",
  "MC-GCSE-P2-TRADE-07": "Outsourcing trade-off missed",
  "MC-GCSE-P2-TRADE-08": "Trade interdependence risk missed",
  "MC-GCSE-P2-UNEMP-01": "Unemployment rate calculation error",
  "MC-GCSE-P2-UNEMP-02": "Full employment confused",
  "MC-GCSE-P2-UNEMP-03": "Structural and seasonal unemployment confused",
  "MC-GCSE-P2-UNEMP-04": "Cyclical unemployment confused",
  "MC-GCSE-P2-UNEMP-05": "Unemployment public finance costs missed",
  "MC-GCSE-P2-UNEMP-06": "Local multiplier effect missed",
  "MC-GCSE-P2-UNEMP-07": "Retraining solution missed",
  "MC-GCSE-P2-UNEMP-08": "Economic inactivity confused",
  "MC-GHU-01": "Globalisation defined as Americanisation",
  "MC-GHU-02": "TNC expansion drivers",
  "MC-GHU-03": "Development gap measurement",
  "MC-GHU-04": "All migration treated as economic",
  "MC-GHU-05": "Rostow's model — Eurocentric critique",
  "MC-GHU-06": "WTO role confused with IMF/World Bank",
  "MC-GHU-07": "Brain drain — one-sided analysis",
  "MC-GHU-08": "TNC impact — uncritical positive or negative",
  "MC-GEO-BIO-01": "Climate as the control on biome distribution",
  "MC-GEO-BIO-05": "Provisioning vs regulating ecosystem services",
  "MC-GEO-BIO-08": "Deforestation's effect on the carbon cycle",
  "MC-GEO-BIO-11": "Boserup vs Malthus on population and resources",
  "MC-GRO-01": "Growth confused with GDP level",
  "MC-GRO-02": "Actual vs potential growth blurred",
  "MC-GRO-03": "Output gap direction swapped",
  "MC-GRO-04": "Trade cycle recovery drawn flat",
  "MC-GRO-05": "PPP vs market exchange rates for GDP comparison",
  "MC-GRO-06": "Easterlin paradox — income and happiness",
  "MC-GUR-01": "Regeneration vs redevelopment confused",
  "MC-GUR-02": "Gentrification always beneficial",
  "MC-GUR-03": "Urban heat island causes",
  "MC-GUR-04": "Shrinking cities — growth assumptions applied",
  "MC-GUR-05": "Sustainable urban development definition",
  "MC-GUR-06": "Squatter settlements — clearance assumed best",
  "MC-GUR-07": "Burgess model applied uncritically",
  "MC-GUR-08": "Enterprise zones — gross vs net job creation",
  "MC-HAZ-01": "Pinatubo — subduction boundary and global cooling",
  "MC-HAZ-02": "Eyjafjallajökull — impact isn't only measured in deaths",
  "MC-HAZ-03": "Katrina — storm surge and levee failure, not wind alone",
  "MC-HAZ-04": "Haiyan — storm surge as the deadliest element",
  "MC-HIST-01": "Weimar structural weakness vs contingency",
  "MC-HIST-02": "Munich Putsch long-term benefit",
  "MC-HIST-03": "Hitler never won a majority",
  "MC-HIST-04": "Reichstag Fire to Enabling Act chain",
  "MC-HIST-05": "Browning vs Goldhagen perpetrator debate",
  "MC-HIST-06": "Truman Doctrine — universal anti-communist principle",
  "MC-HIST-07": "Berlin Blockade — Soviet capitulation not Western defeat",
  "MC-HIST-08": "Cuba — secret Jupiter missiles deal ignored",
  "MC-HIST-09": "Detente — reducing not ending Cold War tensions",
  "MC-HIST-10": "NSC-68 — massive rearmament not containment only",
  "MC-HIST-11": "MAD — deterrence through mutual destruction threat",
  "MC-HIST-12": "USSR collapse — internal economic failure primary cause",
  "MC-HIST-13": "Korea — established limited war as Cold War norm",
  "MC-HSC-01": "Intellectual PIES domain reduced to IQ",
  "MC-HSC-02": "Bowlby attachment — internal working model",
  "MC-HSC-03": "Erikson stages — identity vs role confusion",
  "MC-HSC-04": "'Assess' command word used as synonym for 'describe'",
  "MC-HSC-05": "Esteem needs addressed before lower-order needs met",
  "MC-HSC-06": "Person-centred care not linked to specific values",
  "MC-HSC-07": "Physical changes in late adulthood not linked to care implications",
  "MC-HSC-08": "Generic 'service user' language used",
  "MC-HSC-09": "Empathy vs sympathy in care",
  "MC-HSC-10": "Confidentiality treated as absolute in safeguarding",
  "MC-HSC-11": "Active listening reduced to eye contact or note-taking",
  "MC-HSC-12": "Medical jargon — barrier to informed consent",
  "MC-HSC-13": "Whistleblowing duty — colleague misconduct",
  "MC-HSC-14": "Equality read as identical treatment",
  "MC-HSC-15": "Capacity-based refusal treated as neglect",
  "MC-HSC-16": "Care values named without individual application",
  "MC-ID-CULTURE": "Emic vs etic — imposed etic",
  "MC-ID-ETHICS": "Social sensitivity in research — Sieber and Stanley",
  "MC-ID-FREEWILL": "Soft determinism — middle position",
  "MC-ID-GENDER": "Alpha bias vs beta bias",
  "MC-ID-IDIO": "Idiographic vs nomothetic approach",
  "MC-ID-NATURE": "Diathesis-stress — interactionist nature-nurture",
  "MC-ID-REDUCT": "Holism vs reductionism",
  "MC-IND-01": "India's global economic ranking",
  "MC-IND-02": "India's economy — GDP vs employment by sector",
  "MC-IND-05": "India's regional inequality — urban core vs rural periphery",
  "MC-IND-06": "India's urbanisation rate",
  "MC-IND-07": "India's demographic change with development",
  "MC-IND-11": "India's water pollution — sewage treatment",
  "MC-IND-13": "India's growing geopolitical influence",
  "MC-INF-01": "Confuses disinflation with deflation",
  "MC-INF-02": "CPI basket treated as static",
  "MC-INF-03": "Demand-pull: no diagram link",
  "MC-INF-04": "Cost-push = only wages",
  "MC-INF-05": "Deflation always harmful",
  "MC-INF-06": "RPI and CPI used interchangeably",
  "MC-INF-07": "BoE target is 0%",
  "MC-INF-08": "Index number calculation error",
  "MC-INF-09": "Any double-digit = hyperinflation",
  "MC-INF-10": "Wage-price spiral trigger unknown",
  "MC-INQ-02": "Gini coefficient misread",
  "MC-INQ-04": "Causes of income inequality",
  "MC-INQ-05": "Income vs wealth confused",
  "MC-INQ-07": "Progressive taxation definition",
  "MC-LAW-01": "Actus reus definition and omissions",
  "MC-LAW-02": "Direct vs oblique intent (Woollin)",
  "MC-LAW-03": "Criminal standard of proof",
  "MC-LAW-04": "Murder mens rea (GBH intent)",
  "MC-LAW-05": "Loss of control vs provocation (2009 Act)",
  "MC-LAW-06": "Self-defence and excessive force",
  "MC-LAW-07": "Theft actus reus (appropriation)",
  "MC-LAW-08": "Neighbour principle — Donoghue v Stevenson",
  "MC-LAW-09": "Caparo three-stage duty of care test",
  "MC-LAW-10": "Bolam test — standard of reasonable professional",
  "MC-LAW-11": "Eggshell skull rule — take victim as found",
  "MC-LAW-12": "Occupiers liability — visitor vs trespasser",
  "MC-LAW-13": "Vicarious liability — employer responsibility",
  "MC-LAW-14": "Occupiers Liability 1957 — common duty of care",
  "MC-LAW-15": "Secondary victims — proximity control mechanism",
  "MC-MACRO-01": "Exchange rate maximisation as a policy objective",
  "MC-MAND-01": "Text handling — locating evidence in Human Ingenuity passage",
  "MC-MAND-02": "虽然...但是 — concessive connector in context",
  "MC-MAND-03": "Text handling — Sharing the Planet environment passage",
  "MC-MAND-04": "Vocabulary in context — 强制推行 and 将近三成",
  "MC-MAND-05": "Text handling — Identities health & wellbeing diary",
  "MC-MAND-06": "IB diary conventions — date format and register",
  "MC-MAND-07": "Text handling — Social Organisation education comparison",
  "MC-MAND-08": "IB Criterion C — formal letter vocabulary and structure",
  "MC-MATH-01": "Chain rule — forgets to multiply by inner derivative",
  "MC-MATH-02": "Integration constant C omitted on indefinite integrals",
  "MC-MATH-03": "Sign error when differentiating a negative term",
  "MC-MATH-04": "Completing the square — sign error on constant",
  "MC-MATH-05": "Confuses f(x) = 0 roots with turning points",
  "MC-MATH-06": "Logs — log(a+b) treated as log(a)+log(b)",
  "MC-MATH-07": "Binomial expansion — incorrect coefficient calculation",
  "MC-MATH-08": "Proof by contradiction — fails to state assumption explicitly",
  "MC-MATH-09": "Second derivative zero read as point of inflection",
  "MC-MATH-10": "Constant of integration omitted",
  "MC-MATH-11": "Discriminant — two distinct roots condition",
  "MC-MATH-12": "Graph transformation — f(x+3) shifts left",
  "MC-MATH-13": "Completed square sign error on turning point",
  "MC-MATH-14": "Binomial expansion — power of first term dropped",
  "MC-MATH-15": "Invented log rule: log(a+b) split into log a + log b",
  "MC-MATH-16": "Differentiate fraction — split before differentiating",
  "MC-MATH-SPEC": "Gradient formula between two points",
  "MC-MED-01": "Hall encoding/decoding — preferred reading misunderstood",
  "MC-MED-02": "Curran & Seaton — ownership and diversity link",
  "MC-MED-03": "Cultivation theory — heavy viewer distortion",
  "MC-MED-04": "Representation as construction not reflection",
  "MC-MED-05": "Livingstone & Lunt — digital regulation gap",
  "MC-MED-06": "Van Zoonen — male gaze and gender construction",
  "MC-MED-07": "Hypodermic needle model assumed to still hold",
  "MC-MED-08": "Uses and gratifications — audience agency",
  "MC-MED-09": "Vertical vs horizontal integration confused",
  "MC-MED-10": "Synergy definition and cross-platform promotion",
  "MC-MED-11": "Convergence — technological and industrial forms",
  "MC-MED-12": "PSB obligations and commercial broadcasting",
  "MC-MED-13": "Cultural discount — local specificity reduces export value",
  "MC-MED-14": "Two-step flow — opinion leaders misunderstood",
  "MC-MED-15": "UGC and gatekeeping disruption",
  "MC-MED-16": "Due impartiality — broadcast vs press distinction",
  "MC-MEM-01": "MSM flow and sequence",
  "MC-MEM-02": "Miller's 7±2 and chunking",
  "MC-MEM-03": "WMM purpose and evidence",
  "MC-MEM-04": "Central executive as store (wrong)",
  "MC-MEM-05": "Loftus post-event information",
  "MC-MEM-06": "Cognitive interview techniques",
  "MC-MEM-08": "Proactive vs retroactive interference",
  "MC-MET-01": "Covert observation ethical issues",
  "MC-MET-02": "Interpretivist preference for qualitative",
  "MC-MET-03": "Official statistics as social construction",
  "MC-MET-04": "Questionnaire strengths",
  "MC-MET-05": "Triangulation definition",
  "MC-MET-06": "Practical problems in school research",
  "MC-MET-08": "Feminist methodology in schools",
  "MC-MET-THEORY": "Positivism vs interpretivism — method choice",
  "MC-MGT-01": "Hazard management — monitor/predict/protect/plan confused",
  "MC-MON-01": "MPC role and independence",
  "MC-MON-02": "Interest rate transmission",
  "MC-MON-03": "Rate rise trade-offs ignored",
  "MC-MON-04": "QE mechanism misunderstood",
  "MC-MON-05": "Liquidity trap",
  "MC-MON-06": "Interest rates and exchange rate",
  "MC-MON-08": "Forward guidance purpose",
  "MC-MON-GCSE-01": "Interest rate rise assumed to boost spending",
  "MC-MUM-01": "Megacity growth — natural increase and migration",
  "MC-MUM-02": "Push and pull factors — rural-urban migration",
  "MC-MUM-03": "Dharavi — informal economy not just deprivation",
  "MC-MUM-04": "Rapid urbanisation — city-wide infrastructure strain",
  "MC-MUM-05": "Dharavi Redevelopment Project — top-down criticism",
  "MC-MUM-06": "Sites and services — bottom-up strategy",
  "MC-NI-01": "Circular flow injections/withdrawals",
  "MC-NI-03": "GDP vs GNI confused",
  "MC-NI-04": "Nominal vs real GDP",
  "MC-NI-06": "GDP limitations for comparisons",
  "MC-NI-08": "Output method value added",
  "MC-PATH-01": "Statistical infrequency — unusual not abnormal",
  "MC-PATH-02": "Phobias — classical conditioning mechanism",
  "MC-PATH-03": "Systematic desensitisation — gradual hierarchy",
  "MC-PATH-04": "Beck cognitive triad — self world future",
  "MC-PATH-05": "OCD — intrusive thoughts cognitive explanation",
  "MC-PATH-06": "SSRIs — serotonin reuptake not production",
  "MC-PATH-07": "Deviation from social norms — culturally relative, changes over time",
  "MC-PATH-08": "CBT — thoughts, behaviours and emotions interact",
  "MC-PATH-DEF": "Failure to function adequately — limitations",
  "MC-PATH-DEP": "Ellis's ABC model — belief not event causes emotion",
  "MC-PATH-OCD": "OCD genetic explanation — COMT and SERT genes",
  "MC-PATH-PHOB": "Two-process model — maintenance by avoidance",
  "MC-PE-01": "Cardiac output — HR and SV interaction",
  "MC-PE-02": "Bohr effect and O₂ dissociation curve shift",
  "MC-PE-03": "Sliding filament — filaments shorten (wrong)",
  "MC-PE-04": "Energy system selection at sustained intensity",
  "MC-PE-05": "VO₂ max definition and limiting factors",
  "MC-PE-06": "EPOC vs oxygen debt distinction",
  "MC-PE-07": "Type I vs Type IIx fibre characteristics",
  "MC-PE-08": "Active vs passive breathing mechanics",
  "MC-PE-09": "ATP-PC stores — depletion and recovery time",
  "MC-PE-10": "Lactic acid system — H⁺ not lactate causes fatigue",
  "MC-PE-11": "Progressive overload — plateau through insufficient stimulus",
  "MC-PE-12": "Newton's Third Law — ground reaction force",
  "MC-PE-13": "Third-class levers — mechanical disadvantage in body",
  "MC-PE-14": "Drag forces — frontal area and velocity squared",
  "MC-PE-15": "Angular momentum conservation — moment of inertia",
  "MC-PE-16": "Inverted-U theory — over-arousal and fine motor tasks",
  "MC-PHYS-01": "Constant velocity = no forces (wrong)",
  "MC-PHYS-02": "Projectile horizontal velocity decreases (wrong)",
  "MC-PHYS-03": "Work-energy theorem",
  "MC-PHYS-04": "SUVAT sign convention errors",
  "MC-PHYS-05": "Stiffer spring stores more energy (context-dependent)",
  "MC-PHYS-06": "Momentum vs KE conservation",
  "MC-PHYS-07": "Scalar vs vector distinction",
  "MC-PHYS-08": "Heavier objects fall faster (wrong)",
  "MC-PHYS-09": "Zero velocity ≠ zero acceleration at highest point",
  "MC-PHYS-10": "Parallel resistors — total less than smallest",
  "MC-PHYS-11": "Transverse wave — particle motion direction wrong",
  "MC-PHYS-12": "F = ma applied as F × m, not F ÷ m",
  "MC-PHYS-13": "Scalar vs vector — magnitude vs direction",
  "MC-PHYS-14": "e.m.f. treated as a force, not energy per charge",
  "MC-PHYS-15": "Heavier objects fall faster in a vacuum (wrong)",
  "MC-PHYS-16": "Hooke's law — weight/units errors in spring constant",
  "MC-POL-01": "UK constitution is codified (wrong)",
  "MC-POL-02": "FPTP disproportionality",
  "MC-POL-03": "Parliamentary sovereignty definition",
  "MC-POL-04": "Lords equal to Commons (wrong)",
  "MC-POL-05": "Pluralism vs elitism",
  "MC-POL-06": "Insider vs outsider pressure groups — access not methods",
  "MC-POL-07": "Pressure group vs political party",
  "MC-POL-08": "Pluralism — power dispersed not concentrated",
  "MC-POL-09": "Judicial neutrality — political not personal bias",
  "MC-POL-10": "Class still treated as dominant voting predictor",
  "MC-POL-11": "Miller case — prorogation and parliamentary sovereignty",
  "MC-POL-12": "Salisbury Convention — Lords and manifesto bills",
  "MC-POL-13": "PR — small party influence underestimated",
  "MC-POL-14": "Electoral Commission role confused",
  "MC-POL-15": "Direct vs representative democracy evaluation",
  "MC-POL-18": "Voting behaviour — class dealignment",
  "MC-POV-01": "Absolute vs relative poverty",
  "MC-POV-03": "Poverty trap mechanism",
  "MC-POV-04": "Anti-poverty policy effectiveness",
  "MC-PUSC-01": "US Constitution — codified and entrenched confused",
  "MC-PUSC-02": "Senate vs House exclusive powers",
  "MC-PUSC-03": "Supreme Court lifetime tenure justification",
  "MC-PUSC-04": "Electoral College mechanism and outcomes",
  "MC-PUSC-05": "Bipartisanship and polarisation",
  "MC-PUSC-06": "PM vs President power comparison incomplete",
  "MC-PUSC-07": "Checks and balances mechanisms",
  "MC-PUSC-08": "Federalism vs unitarism — UK and USA",
  "MC-RIV-01": "River long profile — erosion type by location",
  "MC-RIV-02": "Meander asymmetry — helicoidal flow",
  "MC-RIV-03": "Tewkesbury flooding — confluence location",
  "MC-RM-DESIGN": "Repeated measures — order effects",
  "MC-RM-EXPT": "Natural experiment — naturally occurring IV",
  "MC-RM-SCIENCE": "Peer review — purpose and function",
  "MC-RM-STATS": "Mean vs median — sensitivity to outliers",
  "MC-RM-TEST": "Statistical test choice — design and data type",
  "MC-RM-VALID": "Internal validity definition",
  "MC-RM-VAR": "Operationalising variables",
  "MC-RS-01": "Cosmological argument — unmoved mover logical step",
  "MC-RS-02": "Hume's analogical critique of Paley confused with Darwin's",
  "MC-RS-03": "Ontological argument — Kant's existence-as-predicate objection",
  "MC-RS-04": "Logical vs evidential Problem of Evil conflated",
  "MC-RS-05": "Categorical imperative — first formulation misapplied",
  "MC-RS-06": "Mill vs Bentham — quality vs quantity of pleasure",
  "MC-RS-07": "Swinburne's principles of religious experience",
  "MC-RS-08": "Natural Law — 'whatever is natural' misreading of Aquinas",
  "MC-RS-09": "Situation ethics — agape as sole intrinsic good",
  "MC-RS-10": "Euthyphro dilemma — divine command theory challenge",
  "MC-RS-11": "Aristotle's golden mean — virtue between extremes",
  "MC-RS-12": "Sanctity vs quality of life in euthanasia debate",
  "MC-RS-13": "Emotivism — moral statements as expressions not truths",
  "MC-RS-14": "Naturalistic fallacy — Moore's open question argument",
  "MC-RS-15": "Hard determinism — free will illusion",
  "MC-RS-16": "AO2 evaluation replaced by juxtaposed description",
  "MC-RVF-01": "Bradshaw model — downstream changes",
  "MC-RVF-04": "River velocity — fastest at centre/thalweg",
  "MC-RVF-05": "Discharge calculation — area × velocity",
  "MC-SCRI-01": "Crime always dysfunctional — Durkheim misread",
  "MC-SCRI-02": "Labelling — primary vs secondary deviance",
  "MC-SCRI-03": "Crime statistics treated as objective",
  "MC-SCRI-04": "Left realism vs left idealism confused",
  "MC-SCRI-05": "Moral panic — Cohen's elements incomplete",
  "MC-SCRI-06": "Female crime rate explanation missing",
  "MC-SCRI-07": "Dark figure of crime not applied",
  "MC-SCRI-08": "Ethnicity and crime — biological explanation",
  "MC-SD-01": "Demand vs quantity demanded",
  "MC-SD-02": "Supply curve shift factors",
  "MC-SD-03": "Equilibrium and price mechanism",
  "MC-SD-04": "PED and inelastic demand",
  "MC-SD-05": "Substitutes and complements",
  "MC-SD-08": "PES and housing supply",
  "MC-SI-01": "Asch conformity stats (75% vs 37%)",
  "MC-SI-02": "Compliance vs internalisation",
  "MC-SI-03": "Milgram 65% obedience",
  "MC-SI-04": "Agentic state definition",
  "MC-SI-05": "Moscovici consistency principle",
  "MC-SI-06": "NSI vs ISI distinction",
  "MC-SI-08": "Asch ecological validity",
  "MC-SP-01": "Ser vs estar — temporary states require estar",
  "MC-SP-02": "Preterite vs imperfect — completed vs habitual",
  "MC-SP-03": "Subjunctive triggers — WEIRDO verb types",
  "MC-SP-04": "Llevar + gerund for ongoing duration",
  "MC-SP-05": "Por vs para — purpose vs cause",
  "MC-SP-06": "Se impersonal vs reflexive constructions",
  "MC-SP-07": "Subjunctive sequence of tenses — pedir que + subjunctive",
  "MC-SP-08": "Cuanto más... — comparative correlative structure",
  "MC-SP-09": "Edexcel themes and exam structure overview",
  "MC-SP-10": "Essay register — avoiding informal vocabulary",
  "MC-SP-11": "Volver — themes of memory and female solidarity",
  "MC-SP-12": "Memoria histórica — Civil War and Francoism",
  "MC-SP-13": "Third conditional — pluperfect subj. + conditional perfect",
  "MC-SP-14": "Immigration vocabulary — pateras, cayucos, sin papeles",
  "MC-SP-15": "Spanish political system — Estado de las Autonomías",
  "MC-SP-16": "Subjunctive after es esencial que / asegurar que",
  "MC-SSP-01": "Supply-side aim misunderstood",
  "MC-SSP-02": "Market-based vs interventionist",
  "MC-SSP-03": "Interest rates classified as supply-side",
  "MC-SSP-05": "Trade union reform trade-offs",
  "MC-SSP-08": "Infrastructure dual AD/AS effect",
  "MC-SSTR-01": "Stratification — functionalist theory uncritical",
  "MC-SSTR-02": "Weber's life chances vs lifestyle",
  "MC-SSTR-03": "Cultural capital definition too narrow",
  "MC-SSTR-04": "Embourgeoisement thesis — Goldthorpe overlooked",
  "MC-SSTR-05": "Women invisible in stratification research",
  "MC-SSTR-06": "Absolute vs relative poverty confused",
  "MC-SSTR-07": "Welfare dependency — New Right uncritical",
  "MC-SSTR-08": "Social closure mechanisms",
  "MC-STAT-01": "Standardising a value — z-score and normal distribution",
  "MC-STAT-02": "p-value vs significance level — reject or accept H₀",
  "MC-STAT-03": "Binomial conditions — fixed n and constant p",
  "MC-STAT-04": "PMCC interpretation — correlation vs causation",
  "MC-STAT-05": "Mutually exclusive — addition rule vs multiplication",
  "MC-STAT-06": "Regression line — gradient interpretation",
  "MC-STAT-07": "Critical region — definition in hypothesis testing",
  "MC-STAT-08": "Sampling distribution of the mean — Central Limit Theorem",
  "MC-STR-DRUGS": "Benzodiazepines — GABA and chloride ions",
  "MC-STR-GAS": "Selye's General Adaptation Syndrome stages",
  "MC-STR-HPA": "HPA axis — stress response sequence",
  "MC-STR-LIFE": "Holmes and Rahe SRRS — life change units",
  "MC-TEC-01": "Subduction - oceanic plate density",
  "MC-TEC-02": "Development vs physical hazard size",
  "MC-TEC-03": "Composite volcano explosion cause",
  "MC-TEC-04": "Earthquakes at all boundary types",
  "MC-TEC-06": "Focus vs epicentre confused",
  "MC-TEC-07": "Iceland hot spot and constructive boundary",
  "MC-TECH-01": "Application missing - no context",
  "MC-TECH-02": "Evaluation absent on 8+ mark questions",
  "MC-TECH-04": "Diagram axis labelling errors",
  "MC-TECH-05": "Multiplier formula unknown",
  "MC-TRD-01": "Tariffs assumed to benefit everyone",
  "MC-UNEMP-01": "Structural vs frictional unemployment confused",
  "MC-URB-01": "Urban regeneration — London Docklands",
  "MC-URB-02": "Deindustrialisation — decline of manufacturing",
  "MC-URB-03": "International migration — reshaping London",
  "MC-URB-04": "Counter-urbanisation — rural house prices",
  "MC-URB-05": "Eden Project — reclaiming derelict land",
  "MC-URB-06": "Cornwall — decline of primary industry, rise of tourism",
  "MC-URF-02": "Stratford — regeneration fieldwork location",
  "MC-URF-03": "Environmental Quality Survey — bipolar scoring",
  "MC-URF-05": "Questionnaire design — closed vs scale questions",

  // ---- GCSE Economics (OCR J205). See GCSE_ECON_MC_TAGS in data/forge-data.js.
  "MC-GE-SCARCITY": "Opportunity cost — next best alternative, not every alternative",
  "MC-GE-FACTORS": "Factors of production — capital confused with money or labour",
  "MC-GE-PPF": "PPF — inside the frontier vs a shift of the frontier",
  "MC-GE-SECTORS": "Primary, secondary and tertiary sector classification",
  "MC-GE-SPECIALISATION": "Division of labour — benefits stated without drawbacks",
  "MC-GE-MARKET-DEF": "Product vs factor markets; what a market is",
  "MC-GE-PRICE-FUNC": "Price mechanism — signalling, incentive and rationing confused",
  "MC-GE-DISEQ": "Shortage vs surplus; effect of maximum and minimum prices",
  "MC-GE-SHIFT-VS-MOVE": "Movement along a curve vs a shift of the whole curve",
  "MC-GE-DS-DETERMINANTS": "Substitutes, complements and cost changes — which curve moves",
  "MC-GE-EQUILIBRIUM": "Equilibrium — quantity demanded equals quantity supplied",
  "MC-GE-ELASTICITY": "Elastic vs inelastic; PED confused with PES",
  "MC-GE-REV-COST-PROFIT": "Revenue, total cost, average cost and profit calculations",
  "MC-GE-PRODUCTIVITY": "Productivity (output per input) confused with total production",
  "MC-GE-EOS": "Economies vs diseconomies of scale",
  "MC-GE-MARKET-STRUCT": "Monopoly vs oligopoly vs competitive market",
  "MC-GE-BARRIERS": "Barriers to entry and market power",
  "MC-GE-NONPRICE-COMP": "Non-price competition, branding and loss leaders",
  "MC-GE-DERIVED-DEMAND": "Demand for labour is derived from demand for the output",
  "MC-GE-LABOUR-SUPPLY": "Supply of labour — who counts as willing and able",
  "MC-GE-WAGE-DIFFERENTIALS": "Why wages differ — scarcity of skill, not effort alone",
  "MC-GE-MIN-WAGE": "Minimum wage — binding above equilibrium, non-binding below",
  "MC-GE-IMMOBILITY": "Geographical vs occupational immobility of labour",
  "MC-GE-PAY": "Gross vs net pay; income tax and national insurance",
  "MC-GE-MONEY-FUNC": "Functions and qualities of money; why barter is inefficient",
  "MC-GE-INTEREST": "Interest as cost of borrowing and reward for saving",
  "MC-GE-FIN-INST": "Banks, insurance and credit risk",
  "MC-GE-OBJECTIVES": "The government's macroeconomic objectives",
  "MC-GE-GDP": "GDP, GDP per capita and the growth rate",
  "MC-GE-REAL-VS-NOMINAL": "Real vs nominal GDP — adjusting for price changes",
  "MC-GE-CYCLE": "Boom, recession and the economic cycle",
  "MC-GE-GROWTH-CAUSES": "Causes and benefits of economic growth",
  "MC-GE-GDP-WELLBEING": "GDP per capita as an incomplete measure of wellbeing",
  "MC-GE-SUSTAINABILITY": "Sustainable growth and development",
  "MC-GE-UNEMP-TYPES": "Structural, cyclical, frictional and seasonal unemployment",
  "MC-GE-UNEMP-MEASURE": "Unemployment rate; unemployed vs economically inactive",
  "MC-GE-UNEMP-EFFECTS": "Costs of unemployment to workers, firms and government",
  "MC-GE-INCOME-VS-WEALTH": "Income is a flow; wealth is a stock",
  "MC-GE-INEQUALITY": "Measuring income inequality; median vs mean",
  "MC-GE-REDISTRIBUTION": "Redistribution through taxes and benefits",
  "MC-GE-TAX-TYPES": "Direct vs indirect; progressive vs regressive tax",
  "MC-GE-INFLATION-DEF": "Falling inflation is not falling prices",
  "MC-GE-CPI": "CPI calculation and weighting of the basket",
  "MC-GE-INFLATION-CAUSES": "Demand-pull vs cost-push inflation",
  "MC-GE-INFLATION-EFFECTS": "Who gains and loses from unexpected inflation",
  "MC-GE-GOVT-SPENDING": "What government spending covers; ageing population pressure",
  "MC-GE-BUDGET": "Budget deficit vs surplus vs national debt",
  "MC-GE-FISCAL": "Expansionary vs contractionary fiscal policy",
  "MC-GE-AUTO-STABILISERS": "Automatic stabilisers act without a new decision",
  "MC-GE-POLICY-LAGS": "Policy time lags before an effect appears",
  "MC-GE-BOE": "Bank of England, the MPC and quantitative easing",
  "MC-GE-MONETARY": "Interest rate changes and their effect on spending",
  "MC-GE-RATES-AND-CURRENCY": "Interest rates and the exchange rate",
  "MC-GE-SUPPLYSIDE": "Supply-side policy — capacity, not demand",
  "MC-GE-EXTERNALITIES": "Positive and negative externalities on third parties",
  "MC-GE-MERIT-GOODS": "Merit, demerit and public goods",
  "MC-GE-MARKET-FAILURE": "Market failure — public goods and asymmetric information",
  "MC-GE-INTERVENTION": "Taxes, subsidies and regulation to correct market failure",
  "MC-GE-GOVT-FAILURE": "Government failure — intervention with unintended costs",
  "MC-GE-EXPORTS-IMPORTS": "Exports vs imports — direction of the flow",
  "MC-GE-TRADE-BENEFITS": "Gains from specialisation and comparative advantage",
  "MC-GE-PROTECTIONISM": "Tariffs and quotas — who gains and who loses",
  "MC-GE-TRADING-BLOCS": "Trading blocs and free trade agreements",
  "MC-GE-TRADE-RISKS": "Supply-chain interdependence and its risks",
  "MC-GE-BOP": "What the current account records",
  "MC-GE-BOP-CALC": "Calculating the trade and current account balance",
  "MC-GE-BOP-EVAL": "A current account deficit is not automatically a crisis",
  "MC-GE-BOP-POLICY": "Improving the current account through competitiveness",
  "MC-GE-APPREC-DEPREC": "Appreciation vs depreciation; what an exchange rate is",
  "MC-GE-CURRENCY-DEMAND": "What shifts demand for and supply of a currency",
  "MC-GE-EXCHANGE-RATE": "Exchange rate effects on exporters vs importers",
  "MC-GE-EXR-CALC": "Converting between currencies — multiply or divide",
  "MC-GE-J-CURVE": "Depreciation improves the balance only if demand responds",
  "MC-GE-GLOBALISATION": "Globalisation as growing integration and interdependence",
  "MC-GE-MNC": "Multinationals and foreign direct investment",
  "MC-GE-GLOB-COSTS": "Costs of globalisation for workers and communities"
};

// Resolve a tag to a human label, deriving one on the fly for tags that
// have no entry above (the per-question "solo" tags described up top).
// Cached after first computation since BANKS does not change at runtime.
var _mcLabelCache = Object.create(null);
var _mcTagIndex = null;

// 13 questions carry an ARRAY of tags rather than a single one (e.g.
// 2.3.1 FIS-05 is tagged ["MC-FIS-01","MC-EMP-02","MC-TECH-02"]). Indexing
// those under `q.tag` directly stringifies the array, producing a junk key
// ("MC-FIS-01,MC-EMP-02,MC-TECH-02") and leaving each real tag unindexed by
// that question. Every one of those tags happens to also appear on a
// single-tag question today, so nothing is currently unresolvable — but the
// moment one doesn't, it would fall back to a bare code. Index each element.
function _mcBuildTagIndex() {
  var index = Object.create(null);
  if (typeof BANKS === 'undefined') return index;
  for (var bankId in BANKS) {
    var bank = BANKS[bankId];
    if (!bank || !bank.questions) continue;
    for (var i = 0; i < bank.questions.length; i++) {
      var q = bank.questions[i];
      if (!q.tag) continue;
      var tags = Array.isArray(q.tag) ? q.tag : [q.tag];
      for (var t = 0; t < tags.length; t++) {
        var tag = String(tags[t]).trim();
        if (tag && !index[tag]) index[tag] = q;
      }
    }
  }
  return index;
}

// The generic scaffold template reads "This tests the <spec> knowledge
// point: <concept>." — for those, the concept after the colon is a cleaner
// label than the sentence itself. See CLAUDE.md's note on boilerplate
// scaffolds (232 questions, all GCSE History and GCSE Psychology).
var _mcBoilerplateRe = /^This tests the .+? knowledge point:\s*(.+?)\.?$/i;

// A second scaffold style (864 questions, mostly sociology) opens with the
// term being defined, lowercase, then a colon: "triple shift: Women
// performing paid work...". The term alone is a cleaner label than the
// sentence that follows -- and some of these scaffolds run two sentences
// together with no full stop between them ("...emotional work Use the
// definition..."), which the general first-sentence fallback below cannot
// segment, so this is tried first.
var _mcConceptColonRe = /^([a-z][a-z '\u2019-]{2,38}):\s+[A-Z]/;

// Shorten to fit a heatmap cell. The previous version sliced at a fixed 87
// characters, which cut mid-word on 2,827 tags ("...which shifts the\u2026").
// Prefer the first clause when there is one long enough to stand alone;
// otherwise fall back to the last whole word.
function _mcShorten(text, max) {
  var s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  var clause = s.slice(0, max).match(/^(.{24,}?)(?=\s*[,;:\u2014\u2013(])/);
  if (clause) return clause[1].replace(/[\s.,;:]+$/, '');
  var cut = s.slice(0, max);
  var space = cut.lastIndexOf(' ');
  if (space > 24) cut = cut.slice(0, space);
  return cut.replace(/[\s,;:\u2014\u2013-]+$/, '') + '\u2026';
}

// Exam framing that carries no information about the misconception.
var _mcStemFramingRe = /^(?:read (?:the following|this)[^.]*\.\s*|using the same[^:.]*[:.]\s*|complete the sentence about\s*|which of the following\s+(?:best\s+)?(?:describes|explains|shows|is)\s+|what is meant by\s+)/i;

// Some scaffolds open with a generic instruction rather than the idea being
// tested ("Use the named concept, apply it to the context..." covers 42
// sociology tags). When a derived label is shared by several tags it stops
// distinguishing rows in the teacher heatmap, so the question's own stem is
// tried instead.
function _mcDeriveFromStem(stem) {
  var s = String(stem || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  // Comprehension banks quote a whole source text in the stem and put the
  // actual question after a "Q:" / "Q2:" marker at the end. Every tag on one
  // passage shares the passage but asks something different, so the tail is
  // the only part that distinguishes them.
  var marked = s.match(/\bQ\s*\d*\s*[:：]\s*([\s\S]+)$/);
  if (marked) s = marked[1].trim();
  // Still long means the stem is a passage with no question marker. No prefix
  // of it describes a misconception, so don't try.
  if (s.length > 200) return '';
  s = s.replace(/\s*\([^)]*\bmarks?\b[^)]*\)\s*$/i, '');
  s = s.replace(_mcStemFramingRe, '');
  s = s.replace(/[?:.]+$/, '').trim();
  if (!s) return '';
  return _mcShorten(s.charAt(0).toUpperCase() + s.slice(1), 70);
}

function _mcDeriveFromScaffold(scaffold) {
  var s = (scaffold || '').trim();
  if (!s) return '';
  var boiler = s.match(_mcBoilerplateRe);
  if (boiler) return boiler[1].trim();
  var conceptColon = s.match(_mcConceptColonRe);
  if (conceptColon) {
    var term = conceptColon[1];
    return term.charAt(0).toUpperCase() + term.slice(1);
  }
  var firstSentence = (s.split(/(?<=[.!?])\s+(?=[A-Z])/)[0] || s).trim();
  firstSentence = firstSentence.replace(/^[\u2014\u2013\-\s]+/, '');
  return _mcShorten(firstSentence, 90);
}

// How many distinct tags each scaffold-derived label would serve. A label
// shared by more than a couple of tags is a generic scaffold opening, not a
// description of the misconception, so the stem is preferred for those.
var _mcDerivedCounts = null;

function _mcBuildDerivedCounts() {
  var counts = Object.create(null);
  for (var tag in _mcTagIndex) {
    if (MC_LABELS[tag]) continue;
    var label = _mcDeriveFromScaffold(_mcTagIndex[tag].scaffold);
    if (label) counts[label] = (counts[label] || 0) + 1;
  }
  return counts;
}

function resolveMCLabel(tag) {
  if (!tag) return '';
  // A handful of questions carry an array of tags; a caller passing one
  // through unchanged should still get something readable rather than a
  // stringified array.
  if (Array.isArray(tag)) {
    var parts = [];
    for (var i = 0; i < tag.length; i++) {
      var one = resolveMCLabel(tag[i]);
      if (one && parts.indexOf(one) === -1) parts.push(one);
    }
    return parts.join('; ');
  }
  if (MC_LABELS[tag]) return MC_LABELS[tag];
  if (_mcLabelCache[tag] !== undefined) return _mcLabelCache[tag];
  if (!_mcTagIndex) _mcTagIndex = _mcBuildTagIndex();
  var q = _mcTagIndex[tag];
  var derived = q ? _mcDeriveFromScaffold(q.scaffold) : '';
  if (derived && q) {
    if (!_mcDerivedCounts) _mcDerivedCounts = _mcBuildDerivedCounts();
    if (_mcDerivedCounts[derived] > 2) {
      var fromStem = _mcDeriveFromStem(q.stem);
      // Only swap when the stem yields a label that stands on its own: short
      // enough not to need truncating, and not already shared. A stem that
      // has to be cut is a reading passage rather than a question (the IB
      // Mandarin banks embed the whole source text in the stem), and cutting
      // it produces a worse label than the generic scaffold line.
      if (fromStem && fromStem.slice(-1) !== '…' && _mcDerivedCounts[fromStem] === undefined) {
        derived = fromStem;
      }
    }
  }
  _mcLabelCache[tag] = derived;
  return derived;
}

// A practical next move for the teacher, kept alongside the canonical label.
// This is a FALLBACK: where data/starter-activities.js has a specific starter
// for the tag, teacher.html shows that instead, because it always says more
// than a subject-level prompt can. This exists so a tag with no starter still
// gets a usable next step rather than a blank card.
//
// Callers should pass the subject key (teacher.html has MC_TO_SUBJECT, built
// from BANKS). Routing on the tag NAME does not work: tag names do not encode
// subject, so every A-Level Psychology tag (MC-APP-*, MC-ATT-*, MC-MEM-*)
// missed the psychology branch entirely, while ten Biopsychology tags named
// MC-BIO-* were routed to the science branch and told a psychology teacher to
// "label the key variable" on the nervous system. The name regexes are kept
// only for callers that cannot supply a subject.
var _mcInterventionsBySubject = {
  hist: 'Build a dated cause → event → consequence chain and require one precise piece of evidence before the judgement.',
  'gcse-hist': 'Place the event or factor on a short timeline, then explain its cause, consequence, and significance using one precise detail.',
  psych: 'Use a three-part response: define the concept, name the study or theorist, then apply it to a new scenario.',
  'gcse-psych': 'Use a three-part response: define the concept, name the study or theorist, then apply it to a new scenario.',
  bio: 'Ask students to state the process step by step, label the key variable, and predict what changes in a new example.',
  chem: 'Ask students to state the process step by step, label the key variable, and predict what changes in a new example.',
  phys: 'Ask students to state the process step by step, label the key variable, and predict what changes in a new example.',
  'gcse-science': 'Ask students to state the process step by step, label the key variable, and predict what changes in a new example.',
  'gcse-sep-bio': 'Ask students to state the process step by step, label the key variable, and predict what changes in a new example.',
  'gcse-sep-chem': 'Ask students to state the process step by step, label the key variable, and predict what changes in a new example.',
  'gcse-sep-phys': 'Ask students to state the process step by step, label the key variable, and predict what changes in a new example.'
};

function resolveMCIntervention(tag, subject) {
  if (!tag) return 'Ask students to explain the rule in their own words, then apply it to one fresh example.';
  if (subject && _mcInterventionsBySubject[subject]) return _mcInterventionsBySubject[subject];
  if (subject) return 'Have students state the governing rule, contrast it with the nearest distractor, and complete one fresh example.';
  if (/^(?:MC-)?HIST-/.test(tag)) {
    return _mcInterventionsBySubject.hist;
  }
  if (/^(?:MC-)?GCSE-HIST-/.test(tag)) {
    return _mcInterventionsBySubject['gcse-hist'];
  }
  if (/^(?:MC-)?(?:PSY|GCSE-PSY)-/.test(tag)) {
    return _mcInterventionsBySubject.psych;
  }
  if (/^(?:MC-)?(?:BIO|CHEM|PHYS)-/.test(tag)) {
    return _mcInterventionsBySubject.bio;
  }
  return 'Have students state the governing rule, contrast it with the nearest distractor, and complete one fresh example.';
}

if (typeof window !== 'undefined') {
  window.MC_LABELS = MC_LABELS;
  window.resolveMCLabel = resolveMCLabel;
  window.resolveMCIntervention = resolveMCIntervention;
}
