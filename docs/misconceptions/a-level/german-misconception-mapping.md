# A-Level German misconception mapping

`german` was the one gap left when the CUE-repair and taxonomy-completion pass
retagged French, Spanish and every other remaining subject. Every German
source question still carried `tag: "MC-" + id` — the classic mechanical
pattern — so the teacher heatmap had nothing to aggregate and every starter
fell back to the generic drill. 27 of the subject's 28 source questions were
mechanical, and it was tracked in neither `TAG_TAXONOMY_SUBJECTS` nor
`TAG_TAXONOMY_MECHANICAL`, so nothing would have caught it regressing either.

## Result

| | before | after |
|---|---|---|
| Distinct tags | 27 | 10 |
| Mechanical source questions | 27/28 (96%) | 0/28 (0%) |
| Single-use tags (across all 212 questions) | 12 | 0 |

All 212 questions in the `german` subject (28 source plus the
`expandSubjectToMinimum()` coverage clones that pad it to 200, minus a couple
of near-duplicate options) picked up the new tags automatically — the retag
only touches the 28 source questions, keyed by id, via the same
`addLanguageTags()` helper already used for French and Spanish.

## Matching the sibling languages

French and Spanish were retagged at a coarser grain than most subjects in
this backlog — 6 broad tags each (`TENSES`, `SUBJUNCTIVE`, `PRONOUNS`/
`HISTORY-FILM`, `CULTURE-SOCIETY`, `ANALYSIS-RESEARCH`, plus one more) rather
than the 3-5-questions-per-tag granularity used elsewhere. German only has 28
source questions in total, about a quarter of French's or Spanish's, and its
16 grammar questions each test a genuinely distinct grammar point (case,
gender, the passive, word order, tense, subordinate constructions) — collapsing
them into one or two mega-tags the way the tense/subjunctive buckets do for
French would have thrown away exactly the diagnostic value a retag is meant to
add. So German uses 10 tags instead of 6: 6 grammar tags averaging 3 questions
each, and 4 theme tags for the non-grammar content covering roughly the same
ground as French's `CULTURE-SOCIETY`/`HISTORY-TEXTS` split.

Prefix is `MC-GDE-`, matching the `MC-GFR-`/`MC-GSP-` convention and confirmed
clear of any existing tag in `data/forge-data.js`, `data/misconception-labels.js`
or `data/starter-activities.js`.

## Grouping decisions worth knowing

- **Case is one tag covering four different triggers** — a verb governing the
  accusative (`kaufen`), a preposition with a fixed case (`mit` + dative), a
  two-way preposition where the case itself carries the meaning (`auf` +
  accusative for motion vs dative for location), and a relative pronoun whose
  case is set by the verb in its own clause (`helfen` + dative). All four are
  the same underlying error — assuming case follows the noun's role in the
  English sentence rather than the German verb or preposition — so one starter
  drills all four together.
- **`werden` is its own tag, not folded into tense or passive**, because the
  actual misconception is about the WORD, not any one grammatical structure:
  students need to recognise `werden` doing three unrelated jobs (to become,
  the passive auxiliary, marking an ongoing process versus `sein` marking the
  resulting state) and not default to `sein`. `DE-03` (passive formation) sits
  here rather than in a general "passive voice" tag because German forms its
  passive with `werden`, so the error is still about that verb.
- **Word order groups a dependent-clause rule, a modal-verb rule and an
  adverbial-ordering rule** that are three different mechanisms producing the
  same symptom: assuming English word order applies. Splitting them into three
  single-question tags would have been more "precise" but each would have
  been unable to aggregate.
- **The four topic tags roughly mirror French's `CULTURE-SOCIETY` /
  `HISTORY-TEXTS` / `ANALYSIS-RESEARCH` split**, but German's content leans
  heavily on reunification and the GDR, so `REUNIFICATION` is its own tag
  (Berlin Wall, GDR life, *Good Bye, Lenin!*, post-1990 migration and
  unemployment) rather than being folded into a general history bucket.
- **`DE-COV-12` (the independent research project) sits with course topics,
  not with immigration or reunification**, since the question tests knowing
  it is an assessment task/skill, not a content theme — confusing the two
  loses marks independently of getting either topic right.

## Full mapping

| tag | label | questions | source ids |
|---|---|---|---|
| `MC-GDE-CASE` | The verb or preposition decides the case, not English word order | 4 | DE-01, DE-09, DE-10, DE-11 |
| `MC-GDE-CONSTRUCTIONS` | Conditional and purpose clauses need a fixed German pattern | 2 | DE-12, DE-15 |
| `MC-GDE-COURSE-TOPICS` | Each specification theme covers a distinct area of German life | 3 | DE-COV-01, DE-COV-02, DE-COV-12 |
| `MC-GDE-CULTURE-SOCIETY` | Culture is evidence of social change, not a neutral fact | 2 | DE-COV-03, DE-COV-07 |
| `MC-GDE-GENDER-AGREEMENT` | Grammatical gender governs pronouns and endings, not meaning | 2 | DE-02, DE-07 |
| `MC-GDE-IMMIGRATION` | Immigration spans policy, public opinion and lived experience | 3 | DE-COV-04, DE-COV-08, DE-COV-09 |
| `MC-GDE-REUNIFICATION` | Reunification reshaped politics, identity and daily life together | 4 | DE-COV-05, DE-COV-10, DE-COV-11, DE-COV-06 |
| `MC-GDE-TENSE` | German tense choice does not map word-for-word onto English | 2 | DE-08, DE-14 |
| `MC-GDE-WERDEN` | Werden means 'to become', forms the passive, and is not sein | 3 | DE-03, DE-05, DE-13 |
| `MC-GDE-WORD-ORDER` | The verb or infinitive moves to a fixed position, unlike English | 3 | DE-04, DE-06, DE-16 |