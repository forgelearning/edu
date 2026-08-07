# A-Level Economics — retag plan (DRAFT for review)

Edexcel 9EC0, subject key `econ`. **Nothing has been written to
`data/forge-data.js`.** This is the plan to argue with before any of it lands.

## Where econ stands

| | |
|---|---|
| Questions | 515 across 19 banks |
| Distinct tags | 421 |
| Shared tags (2+ questions) | 43 — all 43 already have a hand-authored starter |
| Single-use tags | 378 (**73.4%** of questions) |

`econ` is not in `TAG_TAXONOMY_SUBJECTS`, so nothing currently protects it.
Theme 2's macro banks (2.1.x, 2.2.x) are already well tagged — that is the
earlier work, and it is good. The 378 sit almost entirely in four banks plus a
policy/finance tail.

## The structural find

The untagged banks contain **generated concept pairs**. Each concept produced
two questions with two different tags:

> `TH1C-07` "How should consumer surplus be understood here?"
> `TH1C-08` "A student is revising consumer surplus. Which conclusion is correct?"

Both are about consumer surplus. Both carry a tag used exactly once. Merging
them is not a judgement call — the concept is named in the stem, so the mapping
is *derived from the text and checkable by script*, not read off by hand. That
makes this a much lower-risk retag than History's.

Parsing the four stem templates across all 378 single-use questions:

- **150 questions** resolve to a named concept → **76 concepts**, of which
  **74 are exact pairs** and 2 are unpaired stragglers (`market share`,
  `diminishing marginal returns` — both have a partner among the definitional
  questions, so stage 2 absorbs them).
- **228 questions** do not parse. These are the hand-authored `SD-*` items and
  the definitional `TH1-*` / `TH3-*` "What is X?" questions.

---

## Stage 1 — merge the 74 concept pairs

Mechanical, script-derived, script-verifiable.

| bank | concepts |
|---|---|
| `ECON-1.1` Supply & Demand | 25 — movement along demand, demand shift, consumer/producer surplus, binding & non-binding price ceiling, binding price floor, subsidy to consumers, specific & ad valorem taxation, unitary/perfectly inelastic/perfectly elastic demand, short- & long-run supply, positive externality of production, over-production, under-consumption, information failure, merit & demerit good, natural monopoly, allocative inefficiency, government failure, deadweight welfare loss |
| `3.1.1` Business Growth | 13 — profit/revenue/sales maximisation, survival, organic growth, backward & forward vertical integration, conglomerate integration, managerial/technical/risk-bearing economies of scale, brand loyalty |
| `3.2.1` Revenue, Costs & Profit | 13 — total/marginal/average total cost, falling average cost, diseconomies of scale, fixed & variable cost, break-even revenue, shutdown point, contribution, profit margin, labour productivity |
| `4.1.1` Globalisation & Trade | 25 — comparative & absolute advantage, terms of trade, trade intensity, global value chain, outsourcing, offshoring, trade in services, invisible exports, import penetration, export diversification, commodity dependence, trade shock, tariff escalation, trade bloc, economic & monetary union, capital mobility, financial account, FX reserves, currency convertibility, real exchange rate, J-curve, Marshall-Lerner, import substitution |

**Effect: single-use share 0.734 → 0.450.** 148 questions move onto 74 tags
that genuinely aggregate, each covering two questions on one named concept.

### What stage 1 actually costs

The merge itself is an afternoon. The honest cost is what the 74 tags need
afterwards:

- **74 labels** in `data/misconception-labels.js`. Cheap — each concept has an
  obvious label.
- **74 starters.** This is the real cost, and it is twice the History job.

One thing has changed in our favour since I last looked at this file.
`getStarterActivity()` now falls through `_mcCuratedStarter` /
`_mcStarterFallback`, which build a starter **anchored to the actual question**
("Commit before the reveal: answer this exact question — …"). That is a genuine
activity, not the old generic drill. So 74 tags without hand-authored starters
degrade to something usable rather than something embarrassing.

But note `dev/audit-banks.js:228` — the `NO STARTER` check requires an
*explicit* `MC_STARTERS` entry, and it only runs for subjects listed in the
ratchet. So stage 1 will not fail the audit today, but **econ cannot be added
to the ratchet until the 74 have explicit starters.**

## Stage 2 — the 228 that need design

| bank | n | | bank | n |
|---|---|---|---|---|
| `4.1.1` Globalisation | 50 | | `2.3.3` Supply-Side | 8 |
| `ECON-1.1` Supply & Demand | 47 | | `2.1.2` Inflation | 7 |
| `3.1.1` Business Growth | 25 | | `2.4.1` Inequality | 7 |
| `3.2.1` Revenue & Costs | 25 | | `2.5.2` Role of Banks | 7 |
| `2.3.1` Fiscal Policy | 12 | | `2.5.3` Central Banks | 7 |
| `2.3.2` Monetary Policy | 12 | | `2.4.2` Poverty | 6 |
| | | | `2.5.1` Financial Markets | 5 |
| | | | Theme 2 macro remainder | 10 |

These are definitional ("What is normal profit?") and hand-authored (`SD-*`)
questions. Grouping them needs a designed misconception taxonomy in the way
History did — my draft, your review — and many will land on the *same* concepts
as the stage 1 pairs, which deepens those tags rather than adding new ones.

## Two things I need from you

**1. Naming.** Existing econ tags are numeric by topic (`MC-SD-01`,
`MC-AD-03`, `MC-GRO-02`). History used readable names (`MC-HIST-BREAK`), which
I find far easier to audit. My proposal, flagged because it mixes conventions
within one subject:

- `ECON-1.1` → `MC-MICRO-SURPLUS`, `MC-MICRO-CEILING`, …
- `3.1.1` → `MC-FIRM-*` · `3.2.1` → `MC-COST-*` · `4.1.1` → `MC-GLOB-*`

**2. Whether stage 1 ships before stage 2.** It can: the merge is
self-contained and the fallback covers the starters. Doing so gets econ from
73% to 45% single-use quickly, at the cost of 74 tags temporarily on generated
starters.

## What I'd do

Stage 1 now, with the 74 labels, **and hand-author starters for the ~25 highest
-value concepts** rather than all 74 — the ones where the misconception is
sharp and examinable (comparative vs absolute advantage, J-curve,
Marshall-Lerner, shutdown point, normal vs economic profit, merit goods,
government failure, deadweight loss). Let the question-anchored fallback carry
the rest, and add econ to the ratchet only once the remaining starters are
written. Then stage 2 as a separate designed pass.

That sequences a large job into something shippable without pretending the
generated fallback is as good as a written starter.
