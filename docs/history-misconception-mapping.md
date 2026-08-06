# A-Level History — question → tag mapping (DRAFT, not applied)

Every one of the 208 questions in `HIST-BRIT1`, `HIST-BRIT2`, `HIST-USA1`,
`HIST-USA2`, `HIST-TUDOR` assigned by hand against the approved 40-category
taxonomy. **Nothing has been written to `data/forge-data.js`.**

## Headline

- **141 of 208 (68%) map honestly** to 38 of the 40 categories.
- **67 (32%) have no honest home** and are listed at the bottom.
- **2 approved categories get zero questions**: `MC-HIST-SOURCE` and
  `MC-HIST-CAUSATION`. No question in these banks tests source evaluation or
  causal reasoning, so the tags would exist with nothing ever firing them.
  `MC-HIST-JUDGEMENT` survives only because each bank ends with a
  "judgement" question.

Mapped tags average 3.7 questions each — enough to aggregate.

---

## Britain 1906–1918 (`HIST-BRIT1`)

| tag | questions |
|---|---|
| `MC-HIST-LIB-WELFARE` | 05, 06, 08, 38, 39 |
| `MC-HIST-CONTRIB` | 07, 10, 11, 12, 40 |
| `MC-HIST-NEWLIB` | 03 |
| `MC-HIST-LORDS` | 09, 13, 14 |
| `MC-HIST-SUFFRAGE` | 22, 23, 24, 25, 26 |
| `MC-HIST-FRANCHISE` | 33, 34 |
| `MC-HIST-WARCAUSE` | 32 |
| `MC-HIST-HOMERULE` | 15, 16, 17, 18, 19, 20 |
| `MC-HIST-JUDGEMENT` | 41 |

## Britain 1918–1957 (`HIST-BRIT2`)

| tag | questions |
|---|---|
| `MC-HIST-GENSTRIKE` | 03, 04, 05 |
| `MC-HIST-THIRTIES` | 09, 10, 11, 16, 17 |
| `MC-HIST-NATGOV` | 12, 19 |
| `MC-HIST-GOLD` | 13, 14 |
| `MC-HIST-APPEASE` | 15, 20, 21 |
| `MC-HIST-BEVERIDGE` | 25, 29, 31, 38 |
| `MC-HIST-1945` | 27, 28 |
| `MC-HIST-CONSENSUS` | 30, 32, 37, GAPS-02, GAPS-05 |
| `MC-HIST-SUEZ` | 36, GAPS-03 |
| `MC-HIST-JUDGEMENT` | 40 |

## USA 1865–1920 (`HIST-USA1`)

| tag | questions |
|---|---|
| `MC-HIST-RECON` | 01, 02, 06, 07, 08 |
| `MC-HIST-AMENDMENTS` | 03, 04, 05 |
| `MC-HIST-JIMCROW` | 11, 12, 13 |
| `MC-HIST-LAISSEZ` | 14, 15, 16, 17, 21 |
| `MC-HIST-POPPROG` | 22, 23, 24, 25, 26, 27, 28, 29, 30 |
| `MC-HIST-RIGHTSDECLINE` | 09, 10, 39 |
| `MC-HIST-CIVILRIGHTS-START` | 33 |
| `MC-HIST-JUDGEMENT` | 40 |

## USA 1920–1975 (`HIST-USA2`)

| tag | questions |
|---|---|
| `MC-HIST-CRASH` | 02, 06, 07 |
| `MC-HIST-NEWDEAL-PLAN` | 08, 09, 10, 11, 12, 13, 14, 15 |
| `MC-HIST-NEWDEAL-END` | 18 |
| `MC-HIST-NDOPP` | 16, 17 |
| `MC-HIST-COLDWARPOLICY` | 20, 21, 22, 24, 37 |
| `MC-HIST-CIVILRIGHTS-LAW` | 27, 28, 29, 30, 31, 32 |
| `MC-HIST-CIVILRIGHTS-START` | 19 |
| `MC-HIST-JUDGEMENT` | 39 |

## Tudor (`HIST-TUDOR`)

| tag | questions |
|---|---|
| `MC-HIST-TUDORCLAIM` | 01, 02, 03, 06, 20, 25, 26 |
| `MC-HIST-PRETENDERS` | 04, 05 |
| `MC-HIST-BREAK` | 14, 15, 19 |
| `MC-HIST-DISSOLUTION` | 16 |
| `MC-HIST-REBELLION` | 17, 23, 34, 35 |
| `MC-HIST-ELIZSETTLE` | 30, 31, 32, 33 |
| `MC-HIST-MINISTERS` | 11, 12, 13, 18 |
| `MC-HIST-JUDGEMENT` | 40 |

---

## The 67 with no honest home

Grouped by the topic they'd need a category for. Each group is a *topic*, not
an error — which is the finding, not an oversight.

| would-be category | questions |
|---|---|
| Edwardian party politics | BRIT1 01, 02, 04, 21 |
| Liberal decline / rise of Labour | BRIT1 36, 37 |
| Total war and the home front 1914–18 | BRIT1 27, 28, 29, 30, 31, 35 |
| Inter-war economy and unemployment | BRIT2 01, 02, 18 |
| The two minority Labour governments | BRIT2 06, 07, 08 |
| The People's War / home front 1939–45 | BRIT2 22, 23, 24, 26 |
| Austerity and affluence 1945–57 | BRIT2 33, 34, 39, GAPS-01, GAPS-04, GAPS-06, GAPS-08 |
| End of empire | BRIT2 35, GAPS-07 |
| Urban machine politics | USA1 18, 19 |
| Immigration and nativism | USA1 20, USA2 05 |
| US women's suffrage | USA1 31, 32 |
| US overseas expansion | USA1 35, 36, 37, 38 |
| 1920s society and culture | USA1 34, USA2 01, 03 |
| Red Scare and McCarthyism | USA2 04, 23 |
| Post-war affluence and suburbia | USA2 25, 26 |
| Great Society and the New Right | USA2 33, 35, 38 |
| Vietnam and Watergate | USA2 34, 36 |
| Henry VII's government and finance | TUDOR 07, 08 |
| Tudor foreign policy | TUDOR 09, 10, 29, 36 |
| Edward VI and minority rule | TUDOR 21, 22, 24 |
| Marian religious restoration | TUDOR 27, 28 |
| Tudor government and institutions | TUDOR 37, 38, 39 |

That is **22 further categories** to reach full coverage, taking the taxonomy
from 40 to 62 — and most of the 22 are topic labels with no error in them.

## The decision

**(i) Ship the 40. 141 questions retagged, 67 keep their per-question tags.**
Those 67 never aggregate and never get a starter; the heatmap simply stays
quiet on them. Coverage 68%, every tag means something.

**(ii) Add the 22. Full coverage, 62 categories.** The heatmap fires on
everything, but roughly half the taxonomy names a topic rather than an error,
and the starters for those would be topic revision, not correction — which is
the thing the file header says is not worth having.

I'd take **(i)**. The 67 are the most purely definitional questions in the
bank; a tag that aggregates them would be telling a teacher "your class is
weak on Tudor foreign policy", which the existing spec-point accuracy table
already says, and says with better evidence.
