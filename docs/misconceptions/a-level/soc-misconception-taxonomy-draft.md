# A-Level Sociology — misconception taxonomy (DRAFT for review)

AQA 7192. 200 questions across 10 banks. Currently 192 tags, 6 of which
aggregate; 92 of 200 questions carry a tag that just repeats the question id.

**Nothing has been changed in `data/forge-data.js`.** Mark categories to cut,
merge, rename or add, and I'll do the mapping, labels and starters after.

## What the banks actually look like

Two different situations, and they need different treatment:

| banks | questions | shape |
|---|---|---|
| `SOC-EDU`, `SOC-MET` | 56 | Stems already probe errors, and six real category tags exist |
| the other eight | 144 | Pure term recall, one concept per question, tags `MC-SOC-<TOPIC>-1..18` |

The eight uniform banks are the same shape as the History banks and the econ
Theme banks: `MC-SOC-FAM-1` is "domestic division of labour", `-2` is
"instrumental roles", and so on — 18 distinct concepts, one question each.
So a tag there will mean *"missed a definition in the area where this error
lives"*, not *"holds this error"*, exactly as in History. Same caveat, same
options: accept the weaker claim, or rewrite one question per tag afterwards.

Education and Methods are better already. `MC-EDU-03` is *"A student writes:
'Working-class pupils underachieve because they are less intelligent'"* — that
is a misconception question. Those two banks need folding into their existing
categories, not redesigning.

## The one structural finding

**Research methods is spread across three banks that overlap heavily.**
`SOC-THEORY` (positivism, validity, sampling), `SOC-RESEARCH` (hypothesis,
sampling, ethics) and `SOC-MET` all cover the same ground. Sampling appears in
two, official statistics in three. The methods categories below are therefore
deliberately **cross-bank** — that is where most of the aggregation comes from,
and tagging each bank separately would waste it.

Two smaller duplicates worth knowing: "folk devil" appears in both `SOC-MED-8`
and `SOC-CRIME-11`, and absolute/relative poverty in `SOC-STRAT-7/8` duplicates
`MC-POV-01` over in A-Level Economics.

---

## Research methods — cross-bank (12 categories, ~50 questions)

The biggest win. Draws from `SOC-THEORY`, `SOC-RESEARCH` and `SOC-MET`.

| id | the error |
|---|---|
| `MC-SOC-POSINTERP` | Positivism and interpretivism treated as a preference for numbers vs words, rather than as claims about what society IS |
| `MC-SOC-OBJECTIVITY` | Objectivity and value freedom conflated; "being unbiased" taken to mean having no values |
| `MC-SOC-VALREL` | Validity and reliability swapped — the single most examined methods confusion |
| `MC-SOC-CAUSATION` | Correlation read as causation |
| `MC-SOC-SAMPLING` | Sampling techniques confused; random assumed to mean representative |
| `MC-SOC-RESDESIGN` | Hypothesis, operationalisation and pilot study treated as interchangeable stages |
| `MC-SOC-DATATYPE` | Primary/secondary confused with quantitative/qualitative — they are independent axes |
| `MC-SOC-OFFSTATS` | Official statistics treated as objective fact rather than a social construct |
| `MC-SOC-OBSERVATION` | Covert and overt observation compared on validity without weighing ethics |
| `MC-SOC-INTERVIEW` | Structured and unstructured interviews confused, and questionnaires assumed to be interviews |
| `MC-SOC-TRIANGULATION` | Triangulation assumed to mean "using two methods" rather than cross-checking findings |
| `MC-SOC-RESEFFECT` | Researcher, Hawthorne and interviewer effects merged into one idea |

## Families and Households (4 categories, 18 questions)

| id | the error |
|---|---|
| `MC-SOC-CONJUGAL` | "Symmetrical family" assumed to mean equal; the domestic division of labour, triple shift and the dark side all bear on why it is not |
| `MC-SOC-FAMCHANGE` | Serial monogamy, confluent love and the pure relationship treated as decline rather than as a changed basis for staying |
| `MC-SOC-FAMDIVERSITY` | Family diversity read as "more single parents"; beanpole, modified extended and postmodern types confused |
| `MC-SOC-DEMOG` | Birth rate confused with family size, and an ageing population treated purely as a burden |

## Beliefs in Society (5 categories, 18 questions)

| id | the error |
|---|---|
| `MC-SOC-RELORG` | Church, denomination, sect and cult used interchangeably — the typology is the most examined thing in the topic |
| `MC-SOC-RELFUNCTION` | Collective conscience, anomie and civil religion treated as descriptions rather than as functionalist claims |
| `MC-SOC-RELIDEOLOGY` | "Opium of the people" quoted without the Marxist argument; theodicy and ideology conflated |
| `MC-SOC-SECULAR` | Secularisation assumed to be a simple decline in belief, ignoring the market-theory and revival counter-evidence |
| `MC-SOC-RELGLOBAL` | Fundamentalism treated as traditional rather than as a modern response to globalisation |

## Media (6 categories, 18 questions)

| id | the error |
|---|---|
| `MC-SOC-MEDIAOWN` | Ownership assumed to control content directly, skipping the pluralist counter-argument |
| `MC-SOC-MEDIAGATE` | Agenda setting and gatekeeping conflated |
| `MC-SOC-MEDIAREP` | Representation treated as inaccuracy rather than as construction |
| `MC-SOC-MORALPANIC` | Moral panic used loosely for any public concern; the folk devil's role omitted |
| `MC-SOC-AUDIENCE` | Hypodermic syringe assumed to be the current model; active-audience theories treated as one thing |
| `MC-SOC-NEWMEDIA` | Digital divide assumed to be purely about access; cultural imperialism assumed to be one-way |

## Stratification (5 categories, 18 questions)

| id | the error |
|---|---|
| `MC-SOC-STRATBASIS` | Class, status and power collapsed into income — the Weberian distinction lost |
| `MC-SOC-LIFECHANCES` | Social mobility taken as proof of meritocracy |
| `MC-SOC-POVERTY` | Absolute and relative poverty confused; underclass used descriptively without the critique |
| `MC-SOC-INTERSECT` | Intersectionality treated as adding disadvantages together |
| `MC-SOC-ELITE` | Elite and power elite conflated; social closure treated as informal rather than structural |

## Crime and Deviance (5 categories, 18 questions)

| id | the error |
|---|---|
| `MC-SOC-CRIMEDEV` | Crime and deviance treated as the same thing, and neither as socially constructed |
| `MC-SOC-STRAIN` | Strain theory reduced to "poverty causes crime"; status frustration omitted |
| `MC-SOC-LABELLING` | Labelling assumed to cause crime directly, skipping the deviant career and the moral entrepreneur |
| `MC-SOC-CRIMEPOWER` | White-collar, corporate and state crime conflated; green crime assumed not to be crime |
| `MC-SOC-CRIMESTATS` | Police statistics and victim surveys treated as measuring the same thing |

## Global Development (4 categories, 18 questions)

| id | the error |
|---|---|
| `MC-SOC-DEVMEASURE` | Development equated with GDP per capita; HDI's components unknown |
| `MC-SOC-DEVTHEORY` | Modernisation and dependency theory conflated, or dependency assumed to be Marxist by default |
| `MC-SOC-AIDTRADE` | Aid assumed to be straightforwardly beneficial; FDI and TNC investment treated as the same as aid |
| `MC-SOC-DEVSTRATEGY` | Sustainable development read as environmental only; microfinance and appropriate technology assumed to be small-scale versions of aid |

## Education and Methods in Context — fold into what exists

These six tags already aggregate and already have starters. The 30 remaining
per-question tags (`MC-EDU-01..16`, `MC-MET-01..28`) fold into them, with the
methods ones going to the cross-bank categories above. No new design needed.

| existing tag | absorbs |
|---|---|
| `MC-EDU-CLASS` | `MC-EDU-03` (the "less intelligent" claim), `-11` cultural capital, `-16` multi-factor achievement |
| `MC-EDU-INSCHOOL` | `-09` hidden curriculum, `-10` educational triage, `-12` setting and streaming |
| `MC-EDU-PERSPECTIVE` | `-01` role allocation, `-02` correspondence principle, `-04` interactionist analysis |
| `MC-EDU-POLICY` | `-06` marketisation, `-14` parentocracy, `-15` New Labour policy |
| `MC-EDU-GENDER` | `-13` the feminist criticism of meritocracy |
| `MC-MET-THEORY` | the `SOC-MET` items not going to a cross-bank methods category |

---

## Totals and the decision

**41 new categories + 6 existing = 47**, covering ~174 questions, averaging
about 4 questions per tag. Single-use share would fall from 0.93 to roughly
0.05, and mechanical `MC-<id>` tags from 0.46 to 0.

Where I'd cut if you want fewer: **the methods block**, which is the one I have
over-specified at 12. `MC-SOC-TRIANGULATION` and `MC-SOC-OFFSTATS` could fold
into `MC-SOC-DATATYPE`, and `MC-SOC-RESEFFECT` into `MC-SOC-OBSERVATION`,
taking it to 9 and the total to 44. I'd rather you cut them than have me guess
which distinctions your students actually need.

Where I'd resist cutting: `MC-SOC-VALREL` and `MC-SOC-CRIMEDEV`. Both are
single confusions that examiners test directly and repeatedly, and merging them
into anything larger would lose exactly the diagnosis a teacher wants.
