# GCSE Geography — Consuming Energy Resources misconception mapping

Third curated bank of the `gcse-geo` retag, after Hazardous Earth and Forests
Under Threat. Same cause: `gcseGeoSemanticStem()` derives a tag from the first
five content words of each stem, so 39 of the bank's 43 tags sat on a single
question.

## Result

| | before | after |
|---|---|---|
| Distinct tags | 43 | 14 |
| Single-use tags | 39 | 0 |
| Questions per tag | 1.1 | 3.4 |

All 47 questions mapped (43 multiple-choice plus 4 fill-blank twins), keyed by
question id. Every tag has a label and a hand-written starter with a reveal.

Subject-wide `gcse-geo` moves from 368 single-use tags (57.5%) to 329 (51.4%);
the ratchet drops 0.58 to 0.52.

## The organising idea

Energy questions fall into three families, and keeping them apart is what makes
the tags diagnostic:

1. **What a source *is*** — classification, conventional vs unconventional, how
   each technology generates.
2. **What decides whether it gets used** — reserves vs production, price,
   security of supply, demand.
3. **What it costs beyond the bill** — extraction impacts, hidden costs,
   stakeholders, grid constraints.

A student can be fluent in (1) and still fail (2) and (3), which is exactly the
distinction a single "energy sources" tag would erase.

## Grouping decisions worth knowing

- **`13` (renewable vs recyclable) sits with classification, not with
  renewables.** The error is a definitional confusion between three separate
  axes — renewable/non-renewable, primary/secondary, recyclable — and the
  starter makes students label one source on all three.
- **Security and reserves are deliberately separate.** `03` (UK coal unused)
  and `31` (large reserves, modest production) are about a reserve being an
  *economic* category, not a geological one. `20` and `33` are about
  reliability of supply. Both feel like "we have/haven't got fuel" but the
  errors differ.
- **`19` (nuclear decommissioning) is grouped with hidden costs**, alongside
  `02` (renewables still have impacts) and `37` (biofuel vs food). The shared
  idea is that every source carries a cost that is not carbon, paid at a
  different point in the lifecycle.
- **`10` moved out of conservation into hidden costs.** Its answer is that
  renewables remain more expensive and less efficient, which is a cost
  argument, not a behaviour-vs-technology one.
- **Both footprint calculations (`28`, `43`) sit with the concept, not in a
  numeracy tag.** One asks for a percentage and one for an absolute change,
  and confusing those two is the error the starter drills.
- **Price has its own tag because demand is the missing half.** `24` and `32`
  are recession and boom — students routinely explain every oil price move by
  supply alone.

## Full mapping

| tag | label | questions | ids (GCSE-ENE-…) |
|---|---|---|---|
| `MC-GG-ENE-CLASSIFY` | Renewable is not the same as recyclable or secondary | 4 | 01, FB-01, 13, 14 |
| `MC-GG-ENE-CONSERVATION` | Conservation is using less; efficiency is using it better | 2 | 26, 40 |
| `MC-GG-ENE-DEMAND` | Demand grows with development, not with population alone | 3 | 04, 05, 23 |
| `MC-GG-ENE-EXTRACTION-IMPACT` | Extraction damages water and land, not just air | 3 | 16, 34, 35 |
| `MC-GG-ENE-FOOTPRINT` | Footprint measures consumption, not where it is produced | 4 | 11, 12, 28, 43 |
| `MC-GG-ENE-HIDDEN-COST` | Every source has costs beyond the carbon it emits | 4 | 02, 10, 19, 37 |
| `MC-GG-ENE-HYDROGEN` | Hydrogen is a carrier that must be made and stored | 2 | 27, 41 |
| `MC-GG-ENE-INTERMITTENCY` | Intermittency is a grid problem, not a generation one | 2 | 21, 38 |
| `MC-GG-ENE-PRICE` | Oil price follows demand as much as supply | 3 | 06, 24, 32 |
| `MC-GG-ENE-RENEWABLE-TECH` | Tidal follows the moon; wave follows the wind | 3 | 17, 18, 22 |
| `MC-GG-ENE-RESERVES` | A reserve is only worth extracting if it pays | 4 | 03, 08, 25, 31 |
| `MC-GG-ENE-SECURITY` | Security means reliable supply, not owning the resource | 7 | 09, FB-02, FB-04, 15, 20, 33, 42 |
| `MC-GG-ENE-STAKEHOLDERS` | Energy decisions create losers as well as winners | 3 | 29, 36, 39 |
| `MC-GG-ENE-UNCONVENTIONAL` | Unconventional means harder to extract, not a different fuel | 3 | 07, FB-03, 30 |

## Remaining banks

`GCSE-GEO-BIOSPHERE` has since been curated too — see
`docs/misconceptions/gcse/gcse-geo-biosphere-misconception-mapping.md`, which carries the current
list. Eight banks still use auto-generated slugs, largest single-use count
first:

| bank | questions | tags | single-use |
|---|---|---|---|
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
map beside `GCSE_GEO_HAZ_TAGS`, `GCSE_GEO_FOR_TAGS` and `GCSE_GEO_ENE_TAGS`,
add labels and starters, then lower the `gcse-geo` entry in
`TAG_TAXONOMY_SUBJECTS` to the measured share.
