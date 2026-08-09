# GCSE Psychology misconception mapping

The eight GCSE Psychology banks contain 202 questions. Before this pass every
question used its own bank-position tag (202 single-use tags); they now use 53
shared misconception categories and 0 single-use tags. The mechanical ratchet
is also 0. Labels and explicit commit-before-reveal starters were added for
every category.

## Organising decisions

- Memory is grouped by the error about capacity, systems, retrieval cues,
  interference and reconstruction, not by researcher name.
- Perception separates depth cues, illusions and perceptual set; a monocular
  cue is not merged with a binocular mechanism just because both signal depth.
- Development separates Piaget's schema/stage errors from mindset and the
  unsupported learning-styles claim.
- Research methods groups variables, sampling, design, method choice,
  correlation and reliability; validity is shared with the social-psychology
  ecological-validity question.
- Social influence separates conformity, obedience, minority-led change,
  group behaviour, bystander effects and prejudice/discrimination.
- Language separates linguistic relativity, language structure, early speech,
  cognition, non-verbal communication, context and code-switching.
- Brain and mental-health tags distinguish mechanisms, evidence and treatment
  choices rather than simply repeating the paper topic.
- Prefix `MC-GPSY-` was checked across the data, label and starter files before
  use.

## Full mapping

| tag | questions | ids |
|---|---:|---|
| `MC-GPSY-MEMORY-CAPACITY` | 3 | GCSE-PSY-MEM-01, GCSE-PSY-MEM-02, GCSE-PSY-MEM-11 |
| `MC-GPSY-MEMORY-SERIAL` | 4 | GCSE-PSY-MEM-03, GCSE-PSY-MEM-09, GCSE-PSY-MEM-10, GCSE-PHASE6-PSY-01 |
| `MC-GPSY-MEMORY-SYSTEMS` | 7 | GCSE-PSY-MEM-04, GCSE-PSY-MEM-12–16, GCSE-PSY-BR-07 |
| `MC-GPSY-MEMORY-REHEARSAL` | 2 | GCSE-PSY-MEM-05, GCSE-PSY-MEM-21 |
| `MC-GPSY-MEMORY-RECONSTRUCTION` | 2 | GCSE-PSY-MEM-06, GCSE-PSY-MEM-22 |
| `MC-GPSY-MEMORY-INTERFERENCE` | 4 | GCSE-PSY-MEM-07, GCSE-PSY-MEM-17–18, GCSE-PHASE6-PSY-02 |
| `MC-GPSY-MEMORY-MISINFORMATION` | 3 | GCSE-PSY-MEM-08, GCSE-PSY-MEM-23–24 |
| `MC-GPSY-MEMORY-CONTEXT` | 2 | GCSE-PSY-MEM-19–20 |
| `MC-GPSY-RESEARCH-RELIABILITY` | 5 | GCSE-PSY-MEM-25, GCSE-PSY-RM-07, GCSE-PSY-RM-24–25, GCSE-PSY-SOC-25 |
| `MC-GPSY-PERCEPTION-INTERPRETATION` | 3 | GCSE-PSY-PER-01, GCSE-PSY-PER-04, GCSE-PSY-PER-07 |
| `MC-GPSY-PERCEPTION-MONO` | 5 | GCSE-PSY-PER-02, GCSE-PSY-PER-09–11, GCSE-PSY-PER-13 |
| `MC-GPSY-PERCEPTION-BINO` | 2 | GCSE-PSY-PER-03, GCSE-PSY-PER-12 |
| `MC-GPSY-PERCEPTION-SET` | 6 | GCSE-PSY-PER-05, GCSE-PSY-PER-19–23 |
| `MC-GPSY-PERCEPTION-ILLUSIONS` | 4 | GCSE-PSY-PER-06, GCSE-PSY-PER-08, GCSE-PSY-PER-14, GCSE-PSY-PER-17 |
| `MC-GPSY-PERCEPTION-AMBIGUITY` | 3 | GCSE-PSY-PER-15–16, GCSE-PSY-PER-18 |
| `MC-GPSY-NATURE-NURTURE` | 2 | GCSE-PSY-PER-24–25 |
| `MC-GPSY-DEV-SCHEMA` | 4 | GCSE-PSY-DEV-01–02, GCSE-PSY-DEV-24–25 |
| `MC-GPSY-DEV-STAGES` | 5 | GCSE-PSY-DEV-03, GCSE-PSY-DEV-09–12 |
| `MC-GPSY-DEV-EGOCENTRISM` | 4 | GCSE-PSY-DEV-04–05, GCSE-PSY-DEV-13–14 |
| `MC-GPSY-DEV-MINDSET` | 5 | GCSE-PSY-DEV-06–07, GCSE-PSY-DEV-15–16, GCSE-PSY-DEV-20 |
| `MC-GPSY-DEV-LEARNING-STYLES` | 4 | GCSE-PSY-DEV-08, GCSE-PSY-DEV-17–19 |
| `MC-GPSY-DEV-BRAIN` | 3 | GCSE-PSY-DEV-21–23 |
| `MC-GPSY-RESEARCH-VARIABLES` | 5 | GCSE-PSY-RM-01–03, GCSE-PSY-RM-09–10 |
| `MC-GPSY-RESEARCH-SAMPLING` | 5 | GCSE-PSY-RM-04–05, GCSE-PSY-RM-11–13 |
| `MC-GPSY-RESEARCH-DESIGN` | 6 | GCSE-PSY-RM-06, GCSE-PSY-RM-14–18 |
| `MC-GPSY-RESEARCH-METHODS` | 4 | GCSE-PSY-RM-08, GCSE-PSY-RM-19–21 |
| `MC-GPSY-RESEARCH-CORRELATION` | 2 | GCSE-PSY-RM-22–23 |
| `MC-GPSY-SOC-CONFORMITY` | 6 | GCSE-PSY-SOC-01–02, GCSE-PSY-SOC-09–12 |
| `MC-GPSY-SOC-OBEDIENCE` | 6 | GCSE-PSY-SOC-03–04, GCSE-PSY-SOC-13–15, GCSE-PSY-SOC-24 |
| `MC-GPSY-SOC-CHANGE` | 4 | GCSE-PSY-SOC-05–06, GCSE-PSY-SOC-16–17 |
| `MC-GPSY-SOC-GROUP` | 4 | GCSE-PSY-SOC-07–08, GCSE-PSY-SOC-18, GCSE-PSY-SOC-21 |
| `MC-GPSY-SOC-BYSTANDER` | 2 | GCSE-PSY-SOC-19–20 |
| `MC-GPSY-SOC-PREJUDICE` | 2 | GCSE-PSY-SOC-22–23 |
| `MC-GPSY-LANG-RELATIVITY` | 2 | GCSE-PSY-LAN-01, GCSE-PSY-LAN-24 |
| `MC-GPSY-LANG-STRUCTURE` | 5 | GCSE-PSY-LAN-02–03, GCSE-PSY-LAN-09–11 |
| `MC-GPSY-LANG-EARLY-SPEECH` | 4 | GCSE-PSY-LAN-04, GCSE-PSY-LAN-12–14 |
| `MC-GPSY-LANG-COGNITION` | 4 | GCSE-PSY-LAN-05–06, GCSE-PSY-LAN-17–18 |
| `MC-GPSY-LANG-NONVERBAL` | 6 | GCSE-PSY-LAN-07, GCSE-PSY-LAN-15–16, GCSE-PSY-LAN-19–21 |
| `MC-GPSY-LANG-CONTEXT` | 2 | GCSE-PSY-LAN-08, GCSE-PSY-LAN-22 |
| `MC-GPSY-LANG-CODE` | 2 | GCSE-PSY-LAN-23, GCSE-PSY-LAN-25 |
| `MC-GPSY-BRAIN-LOBES` | 5 | GCSE-PSY-BR-01–02, GCSE-PSY-BR-09–11 |
| `MC-GPSY-BRAIN-LANGUAGE` | 3 | GCSE-PSY-BR-03–04, GCSE-PSY-BR-19 |
| `MC-GPSY-BRAIN-SCANS` | 4 | GCSE-PSY-BR-05, GCSE-PSY-BR-15–17 |
| `MC-GPSY-BRAIN-RECOVERY` | 4 | GCSE-PSY-BR-06, GCSE-PSY-BR-08, GCSE-PSY-BR-22–23 |
| `MC-GPSY-BRAIN-LATERALISATION` | 6 | GCSE-PSY-BR-12–14, GCSE-PSY-BR-18, GCSE-PSY-BR-20–21 |
| `MC-GPSY-BRAIN-NEURAL` | 2 | GCSE-PSY-BR-24–25 |
| `MC-GPSY-PROB-DIAGNOSIS` | 5 | GCSE-PSY-PP-01–02, GCSE-PSY-PP-08, GCSE-PSY-PP-21–22 |
| `MC-GPSY-PROB-BIOLOGY` | 3 | GCSE-PSY-PP-03, GCSE-PSY-PP-06, GCSE-PSY-PP-14 |
| `MC-GPSY-PROB-THERAPY` | 4 | GCSE-PSY-PP-04–05, GCSE-PSY-PP-15–16 |
| `MC-GPSY-PROB-STIGMA` | 4 | GCSE-PSY-PP-07, GCSE-PSY-PP-23–25 |
| `MC-GPSY-PROB-COGNITIVE` | 3 | GCSE-PSY-PP-09–11 |
| `MC-GPSY-PROB-CONCEPTS` | 2 | GCSE-PSY-PP-12–13 |
| `MC-GPSY-PROB-TREATMENT-COURSE` | 4 | GCSE-PSY-PP-17–20 |

Every group has an explicit starter that asks the learner to classify,
predict, sequence or distinguish before revealing the explanation.
