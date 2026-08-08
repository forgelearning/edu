# A-Level Economics stage 2 — misconception taxonomy (DRAFT for review)

Edexcel 9EC0, subject key `econ`. Stage 2 of `docs/econ-misconception-plan.md`:
the questions stage 1 left on single-use tags.

**Nothing has been changed in `data/forge-data.js`.** Mark it up and I'll do the
mapping, labels and starters after.

## Where econ stands after stage 1

| | |
|---|---|
| Questions | 515 across 19 banks |
| Distinct tags | 347 |
| Shared tags (2+ questions) | 117 — all have a hand-authored starter |
| Single-use tags | **230 (44.7%)** |
| Ratchet | `econ: 0.45`, a floor against regression |

The plan predicted 228; the live count is 230. The two extra are `TH3C-27`
(market share) and `TH3COST-27` (diminishing marginal returns) — the stragglers
stage 1 flagged and deferred. Both are absorbed below.

## The shape of the problem is different from stage 1

Stage 1 merged *generated concept pairs*, where the concept was named in the
stem and the merge was script-derived. Stage 2's 230 are two other things:

| group | n | shape |
|---|---|---|
| **A. Definitional recall** | ~150 | `TH1-*`, `TH3-*`, `TH4-GT-*` — "What is a tariff?", "What is normal profit?" |
| **B. Hand-authored misconception items** | ~80 | `SD-*`, `FIS-*`, `MON-*`, `INF-*` — already misconception-shaped: "A student says: 'Raising interest rates will solve inflation without any trade-offs.'" |

Group B is the good content in this subject and needs grouping, not rewriting.
Group A carries the same caveat History and Geography did: a tag on a
definitional question means *"missed a definition in this area"*, not a
diagnosed reasoning error. I have grouped them by concept anyway, because a
teacher heatmap showing "six students shaky on exchange-rate regimes" is useful
even when each question is only recall.

**The single most valuable finding: 26 of the 230 land on tags stage 1 already
created.** Those are deepenings, not new tags — `TH1-SPL-09` ("What is absolute
advantage?") belongs on `MC-GLOB-ABSOLUTE`, and `BOP-03` (J-curve drawn with an
immediate improvement) belongs on `MC-GLOB-JCURVE`, which is exactly the error
that tag names.

## Projected effect

Encoded the full mapping and ran it against the live file:

| | now | projected |
|---|---|---|
| Distinct tags | 347 | 191 |
| Single-use questions | 230 (0.447) | **10 (0.019)** |
| New tags | — | 64 |
| Existing tags deepened | — | 26 |

The 10 residue are the unresolved items in the last section. Every one has a
home in an existing Theme 2 tag; I just want to read that tag's current label
before assigning, because A-Level `geo` was burned by exactly this (a tag whose
label described a different subject's question).

---

## Naming

Stage 1 settled the convention question by using readable names in the four big
banks (`MC-MICRO-*`, `MC-FIRM-*`, `MC-COST-*`, `MC-GLOB-*`) while Theme 2 macro
kept its numeric `MC-AD-03` style. I am extending the readable convention into
Theme 2 for the new tags (`MC-FIS-CROWDING-OUT`, `MC-MON-QE`) and leaving the
existing numeric tags alone. That leaves one subject with two conventions —
deliberately, since renaming working tags buys nothing and risks the
match-on-text trap. Say if you would rather I converted the numeric ones too.

---

## ECON-1.1 Supply & Demand — 47 questions

| tag | n | the error |
|---|---|---|
| `MC-MICRO-EQUILIBRIUM` | 4 | Equilibrium read as "the price the seller wants"; surplus and shortage not derived from it |
| `MC-MICRO-XED` | 4 | Sign of cross elasticity not linked to substitute vs complement |
| `MC-MICRO-SCARCITY` | 3 | Opportunity cost given as the money price; factors of production and their rewards not paired |
| `MC-MICRO-PPF` | 3 | A point inside the PPF read as impossible rather than inefficient; the bow explained by scarcity rather than imperfect factor substitutability |
| `MC-MICRO-SUPPLY-DETERMINANTS` | 3 | Anything affecting supply drawn as a movement along the curve |
| `MC-MICRO-COMPETITION` | 3 | Monopoly defined by firm size rather than market share; barriers to entry confused with high costs |
| `MC-MICRO-PED-ELASTIC` | 3 (+2) | Elasticity read as the slope; revenue effect of a price cut not derived from it |
| `MC-MICRO-YED` | 2 | Inferior good treated as low quality rather than negative YED |
| `MC-MICRO-SPECIALISATION` | 2 | Gains asserted without the mechanism; over-specialisation risk omitted |
| `MC-MICRO-EXT-NEGATIVE` | 2 | Social cost given as external cost alone, omitting private cost |
| `MC-MICRO-PUBLIC-GOODS` | 2 | Non-rivalry and non-excludability conflated; free-riding treated as dishonesty |
| `MC-MICRO-CORRECTIVE-TAX` | 2 | Corrective tax justified by revenue rather than by internalising the externality |
| *deepened* | 8 | `MC-MICRO-MOVEMENT` (+2) `MC-MICRO-SHIFT` (+1) `MC-MICRO-PED-INELASTIC` (+1) `MC-MICRO-PES-SHORTRUN` (+3, incl. `SD-08`) `MC-MICRO-EXT-POSITIVE` (+1) `MC-MICRO-INFO-FAILURE` (+2) `MC-MICRO-CEILING-BINDING` (+1) `MC-MICRO-FLOOR` (+2) `MC-GLOB-ABSOLUTE` (+1) |

**Flag.** `TH1-PED-09` ("What does PED measure?") is generic, and I have put it
on `MC-MICRO-PED-ELASTIC` with the two elastic-case questions rather than
inventing a `MC-MICRO-PED-CONCEPT` that would carry one question. Defensible,
but it is the loosest fit in this bank.

## 4.1.1 Globalisation & Trade — 50 questions

| tag | n | the error |
|---|---|---|
| `MC-GLOB-FDI` | 5 | FDI not distinguished from portfolio investment; repatriated profit ignored when judging host-country gain |
| `MC-GLOB-INTEGRATION` | 4 | Globalisation equated with convergence of living standards |
| `MC-GLOB-CURRENT-ACCOUNT` | 4 | Balance of trade used as the whole current account; a deficit read as debt |
| `MC-GLOB-DEV-FINANCE` | 4 | Remittances, aid and foreign borrowing treated as interchangeable inflows with no cost |
| `MC-GLOB-BLOC` | 4 (+2) | Free-trade area and customs union conflated; rules of origin and deflection unexplained |
| `MC-GLOB-TARIFF` | 3 | Tariff incidence assumed to fall wholly on the foreign producer |
| `MC-GLOB-PROTECTION` | 3 | Protection judged only by the protected industry's gain |
| `MC-GLOB-NONTARIFF` | 3 | Quota treated as a tariff with the same revenue effect |
| `MC-GLOB-ER-EFFECTS` | 3 (+1) | Depreciation assumed to improve the current account immediately and unconditionally |
| `MC-GLOB-MNC` | 2 | MNC location explained by wage costs alone |
| `MC-GLOB-GAINS` | 2 | Gains from trade asserted statically, dynamic efficiency omitted |
| `MC-GLOB-INFANT` | 2 | Infant-industry protection defended with no exit condition |
| `MC-GLOB-DUMPING` | 2 | Dumping treated as any cheap import |
| `MC-GLOB-CREATION-DIVERSION` | 2 | Trade creation and diversion not distinguished; a bloc assumed welfare-improving |
| `MC-GLOB-ER-REGIME` | 2 | Fixed rate assumed to need no reserves or policy commitment |
| `MC-GLOB-INEQUALITY` | 2 | Aggregate gains from trade taken to mean everyone gains |
| *deepened* | 3 | `MC-GLOB-VALUECHAIN` (+1) `MC-GLOB-TOT` (+1) `MC-GLOB-COMMODITY` (+1) |

## 3.1.1 Business Growth — 26 questions

| tag | n | the error |
|---|---|---|
| `MC-FIRM-PRINCIPAL-AGENT` | 3 | Managers assumed to maximise profit for owners; divorce of ownership and control not applied |
| `MC-FIRM-OBJECTIVES` | 3 | Objectives assumed to be profit by default; satisficing read as failure |
| `MC-FIRM-CONTESTABILITY` | 3 | Sunk costs treated as fixed costs; contestability judged by current number of firms |
| `MC-FIRM-GROWTH-MOTIVE` | 2 | Growth assumed always to raise profit |
| `MC-FIRM-MARKET-SHARE` | 2 | Market share read as loyalty or as absolute sales |
| `MC-FIRM-EXTERNAL-GROWTH` | 2 | Takeover and horizontal integration used interchangeably |
| `MC-FIRM-COMPETITION-STRATEGY` | 2 | Non-price competition treated as not competing |
| `MC-FIRM-NONPROFIT-FORMS` | 2 | Social enterprise and cooperative assumed not to need a surplus |
| `MC-FIRM-EOS-SOURCES` | 2 | Financial economies and economies of scope both read as "bigger is cheaper" |
| *deepened* | 7 | `MC-COST-FALLING-AC` (+1) `MC-COST-DISECONOMIES` (+1) `MC-FIRM-ORGANIC` (+2) `MC-FIRM-CONGLOMERATE` (+1) |

**Flag.** `MC-FIRM-EOS-SOURCES` is the weakest merge in the draft. A financial
economy of scale and an economy of scope are not the same mechanism; I pooled
them because each has exactly one question and both fail the same way in
student answers. Splitting them means two single-use tags. Your call.

## 3.2.1 Revenue, Costs & Profit — 26 questions

| tag | n | the error |
|---|---|---|
| `MC-COST-NORMAL-PROFIT` | 4 | Normal profit read as zero profit; implicit costs omitted from economic profit |
| `MC-COST-REVENUE` | 3 | Average revenue not recognised as price; marginal revenue assumed equal to price |
| `MC-COST-FIXED` | 3 (+2) | Average fixed cost assumed constant as output rises |
| `MC-COST-MARGINAL` | 3 (+2) | Rising MC attributed to rising input prices rather than diminishing returns |
| `MC-COST-BREAKEVEN` | 3 (+2) | Break-even quoted in revenue but read as profit; linearity assumption unstated |
| `MC-COST-PROFIT-CALC` | 2 | Profit per unit computed from totals, or revenue treated as profit |
| `MC-COST-VARIABLE` | 2 (+2) | Total and average variable cost conflated |
| `MC-COST-CONTRIBUTION` | 2 (+2) | Contribution treated as profit |
| `MC-MICRO-ALLOCATIVE` | 2 (+2) | Productive and allocative efficiency conflated |
| *deepened* | 1 | `MC-FIRM-PROFITMAX` (+1, the MC = MR condition) |

Both stage-1 stragglers resolve here and in 3.1.1: `TH3COST-27` (diminishing
marginal returns) onto `MC-COST-MARGINAL`, `TH3C-27` (market share) onto the
new `MC-FIRM-MARKET-SHARE` with `TH3-BO-08`.

## Theme 2 policy and finance tail — 81 questions

This is the group-B content, and the tags below name real errors rather than
topics.

| tag | n | the error |
|---|---|---|
| `MC-MON-QE` | 4 | QE described as printing cash for government spending; forward guidance treated as a rate change |
| `MC-MON-LIMITS` | 4 | Monetary policy assumed to fix cost-push inflation without trade-offs |
| `MC-SSP-LIMITS` | 4 | Supply-side policies assumed costless and immediate |
| `MC-POV-ABSOLUTE-RELATIVE` | 4 | Absolute and relative poverty conflated; growth assumed to eliminate both |
| `MC-FIS-LIMITS` | 3 | Budget deficit and national debt conflated; time lags ignored |
| `MC-FIS-STABILISERS` | 3 | Automatic stabilisers described as discretionary decisions |
| `MC-MON-INDEPENDENCE` | 3 | Interest rates assumed to be set by government |
| `MC-MON-TRANSMISSION` | 3 | Rate change linked to AD with no transmission mechanism |
| `MC-BNK-FUNCTIONS` | 3 | Commercial bank and central bank functions merged |
| `MC-BNK-MORAL-HAZARD` | 3 | Bailouts judged only on short-run stability; moral hazard omitted |
| `MC-CB-FIN-STABILITY` | 3 | FPC and MPC roles swapped |
| `MC-INQ-REDISTRIBUTION` | 3 | Progressive tax defined by amount paid rather than share of income |
| `MC-INF-RATE-VS-LEVEL` | 3 | A falling inflation rate read as falling prices; index numbers read as prices |
| `MC-FIS-CROWDING-OUT` | 2 | Crowding out asserted regardless of spare capacity |
| `MC-FIS-DEFINITION` | 2 | Fiscal policy defined to include interest rates |
| `MC-FIS-TAX-REVENUE` | 2 | Higher tax rates assumed always to raise revenue |
| `MC-SSP-DEMAND-VS-SUPPLY` | 2 | Any government spending classified as supply-side |
| `MC-SSP-INTERVENTIONIST` | 2 | Training and infrastructure assumed to work through AD only |
| `MC-INQ-MEASURES` | 2 | Gini and Lorenz read as poverty measures |
| `MC-INQ-CAUSES` | 2 | Causes of inequality listed without evaluation |
| `MC-POV-TRAP` | 2 | Poverty trap explained by low wages alone, not the withdrawal rate |
| `MC-BNK-MONEY-CREATION` | 2 | Banks assumed only to lend out existing deposits |
| `MC-FMK-FORWARD` | 2 | Forward markets described as speculation rather than hedging |
| `MC-FMK-INSTABILITY` | 2 | Financial market failure treated as having no real-economy effect |
| `MC-INF-MEASUREMENT` | 2 | CPI basket assumed fixed; target confused with a ceiling |
| `MC-INF-COSTPUSH` | 2 | Cost-push explained by wages alone |
| *deepened* | 2 | `MC-GLOB-ER-EFFECTS` (+`MON-06`) `MC-GLOB-JCURVE` (+`BOP-03`) |

**Flag.** `MC-INQ-CAUSES` pairs `INQ-04` (a real cause-of-inequality question)
with `INQ-03`, which is an exam-technique item — "how many marks are they likely
to lose?". `INQ-03` is not a misconception question at all and sits badly on any
tag. Options: leave it here, or accept one single-use tag for it. I lean towards
leaving it and noting it.

---

## The 10 I have not assigned

Each belongs in an existing Theme 2 tag family, but I want to read the current
label before committing, per the A-Level `geo` lesson — a tag whose label
describes a different question is worse than no tag.

| question | topic | likely family |
|---|---|---|
| `EMP-18` | net inward migration of working-age people | `MC-EMP-*` |
| `BOP-02` | budget deficit ≠ current account deficit (twin deficits) | `MC-BOP-*` |
| `AD-02` | rate cut → two AD components | `MC-AD-*` |
| `AD-04` | AD right ≠ growth *and* lower inflation | `MC-AD-*` |
| `AD-07` | higher wages as an AD shifter | `MC-AD-*` |
| `AS-05` | movement along vs shift of SRAS | `MC-AS-*` |
| `AS-19` | corporation tax rise | `MC-AS-*` |
| `NI-14` | marginal propensity to import | `MC-NI-*` (multiplier) |
| `NI-19` | marginal propensity to save | `MC-NI-*` (multiplier) |
| `ECON-FINANCE-01` | role of an equity market | `MC-FMK-01`? |

## Cost after the merge

Same shape as stage 1, and the same honest accounting:

- **64 labels** in `data/misconception-labels.js`. Cheap.
- **64 starters.** The real cost. `_mcCuratedStarter` / `_mcStarterFallback`
  keep an unwritten one usable, not good.
- **Ratchet.** `econ` can drop from `0.45` to `0.02` once the 10 are placed —
  but per `dev/audit-banks.js:228` the `NO STARTER` check only fires for
  subjects in the ratchet, so **the ratchet must not be tightened until all 64
  have explicit starters**, or the audit will start failing on tags I created.

## What I'd do

Merge in one pass (it is checkable — I have the mapping encoded and it covers
all 230 with no gaps), write all 64 labels, then hand-author starters for the
~30 where the misconception is sharp and examinable — the whole Theme 2 policy
tail, plus normal profit, contestability, principal-agent, trade
creation/diversion, FDI and current account. Tighten the ratchet only when the
remaining 34 are written.

## Two things I need from you

1. **The three flags** — `TH1-PED-09`, `MC-FIRM-EOS-SOURCES`, `INQ-03`. Each is
   a "one loose fit vs one single-use tag" trade and I have guessed.
2. **Whether the definitional group A questions deserve tags at all**, or
   whether grouping recall questions by topic is dressing up a topic tag as a
   misconception tag. It is the same question History settled by accepting them;
   worth re-asking here because group A is 150 of the 230.
