# Short-answer cue review — 5 November 2026

Reviewed the original 286 flags in three batches. The raw short-answer count is now 16. These retained cases remain visible in the audit: no detector suppression or blanket numerical exemption was introduced. Future increases still fail the baseline. This closes review of this flagged set, not all question-quality work: the source longest-answer count remains 1,262 and the recycled-distractor count remains 1.

The final batch reviews 90 flagged items, changes 77 option sets, clarifies four prompts, and updates the sensory-memory and parallel-lines explanations. Answer letters remain unchanged. Numerical distractors representing calculation mistakes are retained; equivalent duplicate wrong fractions were removed.

## Retained flags

| Item | Variant | Correct answer | Review decision |
|---|---|---|---|
| GCSE-P2-NAT-05 | base | 5% | Calculated numerical answer; digit count is not a prose-quality defect. |
| GCSE-P2-GRO-01 | base | 3% | Calculated numerical answer; digit count is not a prose-quality defect. |
| GCSE-P2-GRO-09 | base | 5% | Calculated numerical answer; digit count is not a prose-quality defect. |
| GCSE-P2-UNEMP-01 | base | 5% | Calculated numerical answer; digit count is not a prose-quality defect. |
| GCSE-P2-UNEMP-01 | reforge | 3% | Calculated numerical answer; digit count is not a prose-quality defect. |
| GCSE-P2-UNEMP-09 | base | 5% | Calculated numerical answer; digit count is not a prose-quality defect. |
| GCSE-P2-UNEMP-09 | reforge | 4% | Calculated numerical answer; digit count is not a prose-quality defect. |
| EWQ-03 | reforge | 3 m | Calculated numerical answer; digit count is not a prose-quality defect. |
| PSYBIO-04 | reforge | GABA | Standard neurotransmitter abbreviation. |
| MATH-N1-02 | reforge | 2 | Calculated numerical answer; digit count is not a prose-quality defect. |
| MATH-P2-28 | reforge | 3 | Calculated numerical answer; digit count is not a prose-quality defect. |
| MATH-P2-32 | reforge | 3 | Calculated numerical answer; digit count is not a prose-quality defect. |
| MATH-N2-20 | reforge | 5 | Calculated numerical answer; digit count is not a prose-quality defect. |
| MATH-P3-11 | base | 1 | Calculated numerical answer; digit count is not a prose-quality defect. |
| MATH-P3-18 | base | 2 | Calculated numerical answer; digit count is not a prose-quality defect. |
| MATH-P3-40 | reforge | 4n | Algebraic form, explicitly restricted to integer n. |

## Factual checks

- Sensory-memory duration varies by modality: [Pearson subject guidance](https://qualifications.pearson.com/en/news-policy/subject-updates/psychology/november-2025-psychology-subject-update.html). The answer and scaffold now distinguish brief visual storage from longer auditory storage.
- Contract labels need not determine condition/warranty classification: [Sale of Goods Act 1979, section 11(3)](https://www.legislation.gov.uk/ukpga/1979/54/section/11?timeline=false). The follow-up now asks explicitly about English sale-of-goods contracts.
- Past consideration: [HMRC explanation](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm28382).
- Bruner and Minturn: [AQA 2023 paper](https://www.aqa.org.uk/files/sample-papers-and-mark-schemes.2023.june.AQA-81821-QP-JUN23_PDF) identifies expectation and perception as the focus.

## Verification

The full `npm run check` suite passed, including the source-cue gate, generated-payload build and route/behaviour checks. `git diff --check` passed. A before/after comparison confirmed exactly 77 changed option sets and no changed answer letters.
