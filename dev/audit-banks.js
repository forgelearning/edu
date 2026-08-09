#!/usr/bin/env node
// Question-bank quality audit for data/forge-data.js.
//
//   node dev/audit-banks.js              # every bank, summary + issues
//   node dev/audit-banks.js econ psych   # only these subject keys
//   node dev/audit-banks.js 2.1.1        # only these bank ids
//
// Checks each question AND its Reforge twin. The Reforge twin is easy to
// forget: it is what a student sees immediately after getting something
// wrong, so a giveaway there matters at least as much as in the stem.

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'data', 'forge-data.js');
const { BANKS, SUBJECTS } = new Function(
  fs.readFileSync(SRC, 'utf8') + '\nreturn { BANKS, SUBJECTS };'
)();

// Loaded for the misconception-tag checks at the bottom. The browser globals
// guard at the end of the file is stripped so it can be evaluated headless.
const STARTERS_SRC = path.join(__dirname, '..', 'data', 'starter-activities.js');
const MC_STARTERS = new Function(
  fs.readFileSync(STARTERS_SRC, 'utf8').replace(/if \(typeof window[\s\S]*$/, '') + '\nreturn MC_STARTERS;'
)();

// A question is "cued" when the correct option is the single longest one.
// Students learn to pick the longest answer, so this scores marks without
// any subject knowledge.
const isCued = (item) => {
  const lengths = Object.values(item.options).map((v) => String(v).length);
  const max = Math.max(...lengths);
  return (
    lengths.filter((l) => l === max).length === 1 &&
    String(item.options[item.correct]).length === max
  );
};

// Maths scaffolds are legitimately terse — "√50 = √(25 × 2) = 5√2." is a
// complete explanation — so only flag one that is missing or near-empty.
const MIN_SCAFFOLD = 10;

const bankToSubject = {};
for (const [key, subject] of Object.entries(SUBJECTS)) {
  for (const bank of subject.banks) bankToSubject[bank] = key;
}

const args = process.argv.slice(2);
const wanted = (bankId) => {
  if (!args.length) return true;
  return args.includes(bankId) || args.includes(bankToSubject[bankId]);
};

const seenIds = new Map();
const rows = [];
const issues = [];
let totals = { mcq: 0, cuedStem: 0, ref: 0, cuedRef: 0, permutedRef: 0 };

for (const [bankId, bank] of Object.entries(BANKS)) {
  if (!bankToSubject[bankId]) {
    issues.push(`ORPHAN BANK: ${bankId} is defined but no subject references it`);
    continue;
  }
  if (!wanted(bankId)) continue;

  const stemKeys = { A: 0, B: 0, C: 0, D: 0 };
  const refKeys = { A: 0, B: 0, C: 0, D: 0 };
  const stems = new Map();
  let mcq = 0, ref = 0, cuedStem = 0, cuedRef = 0, permutedRef = 0;

  for (const q of bank.questions) {
    if (seenIds.has(q.id)) {
      issues.push(`DUPLICATE ID: ${q.id} in ${bankId} and ${seenIds.get(q.id)}`);
    } else {
      seenIds.set(q.id, bankId);
    }

    const norm = String(q.stem || '').trim().toLowerCase();
    if (!norm) issues.push(`EMPTY STEM: ${q.id} (${bankId})`);
    else if (stems.has(norm)) {
      issues.push(`DUPLICATE STEM: ${q.id} repeats ${stems.get(norm)} in ${bankId}`);
    } else stems.set(norm, q.id);

    // fill_blank and short_answer questions have their own shape.
    if (q.type === 'fill_blank') {
      const slots = (q.template || '').split('___').length - 1;
      if (!Array.isArray(q.blanks) || !q.blanks.length) {
        issues.push(`FILL-BLANK MALFORMED: ${q.id} (${bankId})`);
      } else if (slots !== q.blanks.length) {
        issues.push(`FILL-BLANK SLOTS: ${q.id} (${bankId}) ${slots} gaps vs ${q.blanks.length} answers`);
      }
      continue;
    }
    if (q.type === 'short_answer' || q.type === 'extended_answer') {
      if (!q.model_answer && !q.model_answer_outline) {
        issues.push(`WRITTEN-ANSWER NO MODEL: ${q.id} (${bankId})`);
      }
      continue;
    }

    let stemTextSet = null, refTextSet = null;
    for (const [item, label] of [[q, ''], [q.reforge, ' (reforge)']]) {
      if (!item || !item.options) {
        if (!label) issues.push(`NO OPTIONS: ${q.id} (${bankId})`);
        else issues.push(`NO REFORGE: ${q.id} (${bankId})`);
        continue;
      }
      const keys = Object.keys(item.options).sort().join(',');
      if (keys !== 'A,B,C,D') {
        issues.push(`BAD OPTION KEYS: ${q.id}${label} (${bankId}) has [${keys}]`);
        continue;
      }
      if (!item.options[item.correct]) {
        issues.push(`UNGRADEABLE: ${q.id}${label} (${bankId}) correct="${item.correct}" is not an option`);
        continue;
      }
      const texts = Object.values(item.options).map((v) => String(v).trim().toLowerCase());
      if (new Set(texts).size !== 4) {
        issues.push(`DUPLICATE OPTION TEXT: ${q.id}${label} (${bankId})`);
      }
      if (label) {
        ref++; refKeys[item.correct]++;
        if (isCued(item)) { cuedRef++; issues.push(`CUE: longest option is correct - ${q.id}${label} (${bankId})`); }
        refTextSet = texts.slice().sort().join('');
      } else {
        mcq++; stemKeys[item.correct]++;
        if (isCued(item)) { cuedStem++; issues.push(`CUE: longest option is correct - ${q.id} (${bankId})`); }
        stemTextSet = texts.slice().sort().join('');
      }
    }

    // The Reforge twin must test the misconception from a different angle.
    // If its option set is just the parent's options reordered, the student
    // sees the answer highlighted and then the same four options again —
    // the twin gives away the answer instead of teaching.
    if (stemTextSet !== null && refTextSet !== null && stemTextSet === refTextSet) {
      permutedRef++;
      issues.push(`PERMUTED REFORGE: ${q.id} (${bankId}) reforge options are the parent's options reordered`);
    }

    if (!q.scaffold || q.scaffold.trim().length < MIN_SCAFFOLD) {
      issues.push(`MISSING SCAFFOLD: ${q.id} (${bankId})`);
    }
  }

  // A bank where one letter is correct far more often than the rest is
  // guessable. Flag anything at or above half.
  for (const [name, keys, n] of [['stem', stemKeys, mcq], ['reforge', refKeys, ref]]) {
    if (n < 8) continue;
    for (const letter of 'ABCD') {
      const share = keys[letter] / n;
      if (share >= 0.5) {
        issues.push(`ANSWER SKEW: ${bankId} ${name} keys are ${Math.round(share * 100)}% "${letter}" (${keys[letter]}/${n})`);
      }
    }
  }

  totals.mcq += mcq; totals.ref += ref;
  totals.cuedStem += cuedStem; totals.cuedRef += cuedRef;
  totals.permutedRef += permutedRef;
  rows.push({ bankId, subject: bankToSubject[bankId], n: bank.questions.length, mcq, ref, cuedStem, cuedRef, permutedRef, stemKeys, refKeys });
}

for (const [key, subject] of Object.entries(SUBJECTS)) {
  // Reader-mode subjects (currently IB Mandarin) deliberately use a passage
  // workflow instead of MCQ banks, so an empty banks array is expected.
  if (!subject.banks.length && !subject.readerMode) issues.push(`EMPTY SUBJECT: "${key}" (${subject.label}) lists no banks, so its card is dead`);
  for (const bank of subject.banks) {
    if (!BANKS[bank]) issues.push(`MISSING BANK: subject "${key}" references "${bank}", which is not defined`);
  }
}

// A misconception tag used by exactly one question is a per-question
// identifier, not a category: the teacher heatmap has nothing to aggregate and
// getStarterActivity() can only offer a generic drill. Structural checks above
// cannot see this, because a bank of 420 one-off tags is perfectly well-formed.
//
// Enforced per subject rather than globally: two subjects that coincidentally
// share a tag once each still give neither teacher anything to act on. Only
// the subjects listed below have a real taxonomy today; the rest are the
// backlog recorded in CLAUDE.md, so they are held at their current level
// rather than failing the build. Lower a threshold once a subject is retagged.
const TAG_TAXONOMY_SUBJECTS = {
  // subject key: max share of that subject's questions allowed to sit on a
  // tag used only once within the subject.
  'gcse-econ': 0,
  'gcse-sep-bio': 0,
  'gcse-sep-chem': 0,
  'gcse-sep-phys': 0,
  psych: 0.18,
  // Combined science shares the separate sciences' MC-SEP-* taxonomy. The
  // remaining share is 15 questions whose tag names a topic, not an error.
  'gcse-science': 0.08,
  // The only single-use tag left is MC-MATH-INVERSE; nothing else in the
  // subject tests inverse functions.
  'gcse-maths': 0.01,
  // Being retagged bank by bank. Curated so far: Hazardous Earth (49 tags ->
  // 16, 41 single-use -> 0), Forests Under Threat (44 -> 11, 40 -> 0),
  // Consuming Energy Resources (43 -> 14, 39 -> 0) and People and the
  // Biosphere (41 -> 13, 37 -> 0), taking the subject from 0.697 to 0.456.
  // The other eight banks still carry auto-generated per-question concept
  // slugs; drop this figure as each one is curated.
  'gcse-geo': 0.46,
  // 185 of 200 questions retagged onto 44 shared categories, taking the
  // single-use share from 0.930 to 0.010. The two tags left on one question
  // each are MC-EDU-ETHNIC and MC-TECH-01, both real categories with one
  // question in the bank rather than per-question identifiers.
  soc: 0.02,
  // 141 of 208 questions retagged onto 38 shared MC-HIST-* tags. The residue
  // is the 67 purely definitional questions that only a TOPIC tag would cover
  // (see docs/history-misconception-mapping.md), plus four taxonomy tags
  // sitting on a single question each until the rewrite pass gives them a
  // second. The rewrite pass has now landed: all 38 tags aggregate, and the
  // four extra questions took the share to 0.316, so the ratchet tightens
  // from 0.35 to lock that in. The residue is the 67 purely definitional
  // questions that only a TOPIC tag would cover.
  hist: 0.32,
  // Stage 2 has landed. All 230 remaining single-use questions were mapped
  // onto shared categories, taking the share from 0.447 to 0.012. The six
  // left are concepts with no genuine partner in the bank — twin deficits,
  // AD-shift-and-inflation, wages and AD, movement vs shift of SRAS,
  // asymmetric information and stock market crashes — each renamed from its
  // index form so it names the error rather than the question's position.
  // See docs/econ-misconception-taxonomy-draft.md.
  econ: 0.013,
  // All 238 questions retagged onto 52 shared MC-GEO-* categories, none of
  // which carries fewer than two questions, taking the single-use share from
  // 0.992 to 0.004. The 0.01 is not headroom: it is the single array-tagged
  // question, TEC-05, which carries ["MC-GEO-TEC-VULNERABILITY","MC-TECH-02"].
  // The counting below keys on the tag VALUE, so an array counts as its own
  // composite key and reads as used-once however many questions share its
  // members. MC-GEO-TEC-VULNERABILITY itself covers five questions. Fixing
  // that properly means teaching this check to count array members
  // individually, which would change the reported share for every subject
  // using array tags, so it is left as a known limitation rather than
  // silently rescored here.
  geo: 0.01,
};

// Companion ratchet to the one above, measuring something it cannot see: the
// share of a subject's SOURCE questions whose tag is literally MC-<id>. Such a
// tag names nothing, and because expandSubjectToMinimum() clones carry their
// source's tag, a subject of purely mechanical tags can score 0.00 on the
// single-use check. Defaults to 0 for any subject not listed.
//
// The subjects at 0 below have a genuine taxonomy: every tag names a concept.
// The ones with a value carry a residue, and each number is the CURRENT level,
// set to catch regression and to be lowered as the residue is retagged — not
// an endorsement of it.
//
// Several values below rose when the check stopped looking only for the
// literal MC-<id> form and started asking whether the tag names a concept at
// all. Nothing regressed; the old numbers were measuring less than they
// claimed. The subjects that were genuinely retagged were unmoved by the
// change, which is the evidence that the new rule is not over-firing.
const TAG_TAXONOMY_MECHANICAL = {
  'gcse-econ': 0,
  'gcse-sep-bio': 0,
  'gcse-sep-chem': 0,
  'gcse-sep-phys': 0,
  'gcse-science': 0,
  'gcse-maths': 0,
  // Was 0.996 when every tag was a bank code plus a position (MC-GEO-HAZ-27).
  // The concept-slug pass cleared that: the subject now measures 0, so the
  // floor is closed. Note this ratchet alone says nothing about whether the
  // subject aggregates — the slugs name concepts but 405 of 640 questions are
  // still on a tag of their own, which is what TAG_TAXONOMY_SUBJECTS tracks.
  'gcse-geo': 0,
  // 29 of 264, all in the Forensic and Cognitive banks added after the retag.
  psych: 0.12,
  // 67 of 212 — the residue of definitional questions that only a topic tag
  // would cover, documented in docs/history-misconception-mapping.md. Was
  // 0.26 against the literal check; the extra 15 are MC-HIST-BRIT1-1 style
  // positional tags in the same residue.
  hist: 0.32,
  // 2 of 200: MC-TECH-01 and MC-TECH-02, each carried by one question. Both
  // are array-tagged, which is also why they read as used-once on the
  // single-use check above.
  soc: 0.01,
  // 35 of 515, down from 256 after the stage 2 retag. The residue is an
  // artefact of the `tag === MC-<id>` clause rather than a real defect: these
  // are questions whose id happens to match the name of a tag that genuinely
  // aggregates — question SD-02 on MC-SD-02, GRO-01 on MC-GRO-01, which
  // carries four questions with a label and a starter. The index-tag clause
  // below correctly passes those tags; the MC-<id> clause flags the one
  // member whose id matches. Conditioning that clause on the tag failing to
  // aggregate would take econ to ~0, and is worth doing for hist and psych
  // at the same time.
  econ: 0.068,
  // Retagged: 0 of 238, down from 200. Every tag names a concept.
  geo: 0,
};
for (const [key, maxSingleShare] of Object.entries(TAG_TAXONOMY_SUBJECTS)) {
  const subject = SUBJECTS[key];
  if (!subject) { issues.push(`TAG TAXONOMY: subject "${key}" is checked but no longer exists`); continue; }
  const counts = new Map();
  let n = 0;
  for (const bankId of subject.banks) {
    for (const q of (BANKS[bankId] || { questions: [] }).questions) {
      n++;
      if (q.tag) counts.set(q.tag, (counts.get(q.tag) || 0) + 1);
    }
  }
  if (!n) continue;
  const singles = [...counts.entries()].filter(([, c]) => c === 1);
  const share = singles.length / n;
  if (share > maxSingleShare) {
    issues.push(
      `TAG TAXONOMY: "${key}" has ${singles.length}/${n} questions (${Math.round(share * 100)}%) on a tag used only once ` +
      `(allowed ${Math.round(maxSingleShare * 100)}%). Group them into shared misconception tags, ` +
      `then add a label in data/misconception-labels.js and a starter in data/starter-activities.js for each.`
    );
  }
  // The single-use share above is computed over ALL questions, and
  // expandSubjectToMinimum() clones a question to pad a subject to 200 with
  // the clone carrying its source's tag. So a purely mechanical tag can be
  // paired up by its own clone and score a perfect 0.00 while naming nothing.
  // `cs` is the live example: 92 of its 112 source questions are tagged
  // MC-<id>, and its single-use share is 0.00.
  //
  // This catches that directly by asking a different question — does the tag
  // name a CONCEPT, or merely repeat the question id? Coverage variants are
  // excluded because they inherit their source's tag by design.
  //
  // Deliberately NOT the same as "how many distinct questions share a tag".
  // gcse-maths and the gcse-sep-* sciences carry one topical tag per source
  // concept (MC-MATH-RATIO, MC-SEP-BIO-OSMOSIS) reused across that concept's
  // variants, which is the design working, not a defect.
  //
  // MC-<id> is only the most literal form. A tag can name just as little
  // while looking nothing like the id: gcse-geo tags GCSE-HAZ-27 as
  // MC-GEO-HAZ-27, which is a bank code plus a position and scored 0.00 here
  // for years. So the test is not "does the tag equal the id" but "does the
  // tag contain a concept word at all" — an all-caps code ending in a number
  // does not.
  //
  // An index tag still passes when it genuinely groups two or more distinct
  // source questions, because that is econ's MC-AD-03: numeric, but shared,
  // labelled and starter-backed. What does not pass is an index tag carried
  // by a single question. fill_blank restatements are excluded from that
  // count for the same reason coverage variants are — gcse-geo's 72 -FB-
  // twins restate their source question and inherit its tag, which paired up
  // 71 of its 73 "aggregating" tags without grouping anything.
  const isIndexTag = (tag) => /^MC-(?:[A-Z0-9]+-)+\d+$/.test(tag);
  const sourceQuestions = subject.banks
    .flatMap((bankId) => (BANKS[bankId] || { questions: [] }).questions)
    .filter((q) => q.tag && !q.coverageVariant);
  const distinctCarriers = new Map();
  for (const q of sourceQuestions) {
    if (q.type === 'fill_blank') continue;
    distinctCarriers.set(q.tag, (distinctCarriers.get(q.tag) || 0) + 1);
  }
  const mechanical = sourceQuestions.filter(
    (q) => q.tag === `MC-${q.id}` ||
      (isIndexTag(q.tag) && (distinctCarriers.get(q.tag) || 0) < 2)
  );
  if (sourceQuestions.length) {
    const mechShare = mechanical.length / sourceQuestions.length;
    const allowed = TAG_TAXONOMY_MECHANICAL[key] ?? 0;
    if (mechShare > allowed) {
      issues.push(
        `MECHANICAL TAGS: "${key}" has ${mechanical.length}/${sourceQuestions.length} source questions ` +
        `(${Math.round(mechShare * 100)}%) on a tag that names no concept (allowed ${Math.round(allowed * 100)}%). ` +
        `A tag of the form MC-<id>, or a bank code plus a number carried by one question, names nothing a ` +
        `teacher can act on, and clones and fill_blank restatements can hide it from the single-use check.`
      );
    }
  }

  // Runtime starter resolution is audited below for every active tag. A
  // shared tag may use the question-aware fallback rather than a literal
  // hand-authored entry; that is still actionable and avoids forcing a second
  // copy of hundreds of near-identical activities into this source file.
}

const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '-');
const fmt = (k) => ['A', 'B', 'C', 'D'].map((l) => k[l]).join('/');

console.log('bank                 subject         n   stem-cue  keys        ref-cue  keys');
for (const r of rows.sort((a, b) => a.subject.localeCompare(b.subject) || a.bankId.localeCompare(b.bankId))) {
  console.log(
    r.bankId.padEnd(20), r.subject.padEnd(15), String(r.n).padStart(3),
    pct(r.cuedStem, r.mcq).padStart(8), fmt(r.stemKeys).padEnd(12),
    pct(r.cuedRef, r.ref).padStart(7), fmt(r.refKeys)
  );
}

console.log(`\nstems ${totals.cuedStem}/${totals.mcq} cued (${pct(totals.cuedStem, totals.mcq)})  |  reforges ${totals.cuedRef}/${totals.ref} cued (${pct(totals.cuedRef, totals.ref)})  |  reforges permuted ${totals.permutedRef}/${totals.ref} (${pct(totals.permutedRef, totals.ref)})`);

// Corrective-starter audit. Explicit starters are preferred, but every active
// tag must resolve to a usable question-aware builder. This is intentionally a
// quality report rather than a second source of coverage: getStarterActivity()
// remains the single runtime path used by teacher.html.
const starterSource = fs.readFileSync(path.join(__dirname, '..', 'data', 'starter-activities.js'), 'utf8');
const { MC_CURATED_TAGS: curatedMap, MC_ADDITIONAL_TAGS: additionalMap, getStarterActivity } = new Function('BANKS', starterSource + '\nreturn { MC_CURATED_TAGS, MC_ADDITIONAL_TAGS, getStarterActivity };')(BANKS);
const anchorGroups = [curatedMap || {}, additionalMap || {}];
const curatedTags = new Set(anchorGroups.flatMap((group) => Object.values(group).flat()));
const starterRows = {};
const starterTypes = {};
const starterTitles = new Map();
const starterSubjectStats = {};
let activeTags = 0, explicitStarters = 0, handAuthoredStarters = 0, curatedStarters = 0, generatedStarters = 0, unusableStarters = 0, recallEvaluateStarters = 0;
for (const [bankId, bank] of Object.entries(BANKS)) {
  const subject = bankToSubject[bankId];
  if (!subject || !wanted(bankId)) continue;
  for (const q of bank.questions) {
    if (!q.tag) continue;
    const subjectStats = (starterSubjectStats[subject] ||= { tags: new Set(), explicit: 0, hand: 0, curated: 0 });
    if (subjectStats.tags.has(q.tag)) continue;
    subjectStats.tags.add(q.tag);
    const isCurated = curatedTags.has(q.tag);
    const isHandAuthored = !!MC_STARTERS[q.tag];
    const isExplicit = isHandAuthored || isCurated;
    if (isExplicit) subjectStats.explicit++;
    if (isHandAuthored) subjectStats.hand++;
    if (isCurated) subjectStats.curated++;
    if (starterRows[q.tag]) continue;
    activeTags++;
    const starter = getStarterActivity(q.tag, q.tag);
    if (isExplicit) explicitStarters++; else generatedStarters++;
    if (isHandAuthored) handAuthoredStarters++;
    if (isCurated) curatedStarters++;
    const hasActivityContent = starter && (starter.prompt || starter.answer || starter.items || (starter.headers && starter.rows));
    if (!starter || !starter.type || !starter.title || !starter.instruction || !hasActivityContent) {
      unusableStarters++;
      issues.push(`STARTER COVERAGE: ${q.tag} (${subject}) does not resolve to a usable starter`);
    }
    const starterType = starter && starter.type || 'missing';
    starterTypes[starterType] = (starterTypes[starterType] || 0) + 1;
    const stem = String(q.stem || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const plainRecall = /^(what|which|who|where|when|define|identify|name|state)\b/.test(stem) && !/\b(response shows|passage|best|most important|argument|view)\b/.test(stem);
    if (!isExplicit && starterType === 'evaluate' && plainRecall) {
      recallEvaluateStarters++;
      issues.push(`STARTER INFERENCE: ${q.tag} uses evaluate for a plain recall stem`);
    }
    if (starter && starter.title) starterTitles.set(starter.title, (starterTitles.get(starter.title) || 0) + 1);
    starterRows[q.tag] = { subject, isExplicit };
  }
}
const repeatedGeneratedTitles = [...starterTitles.values()].filter((n) => n > 1).length;
console.log(`\nstarters ${explicitStarters} explicit (${handAuthoredStarters} hand-authored, ${curatedStarters} structured anchors) / ${generatedStarters} generated / ${unusableStarters} unusable across ${activeTags} active tags`);
console.log(`starter types ${Object.entries(starterTypes).sort((a, b) => b[1] - a[1]).map(([type, n]) => `${type}=${n}`).join('  ')}`);
console.log(`generated recall stems incorrectly using evaluate ${recallEvaluateStarters}`);
console.log(`repeated starter titles ${repeatedGeneratedTitles}`);
for (const subject of [...new Set(anchorGroups.flatMap((group) => Object.keys(group)))]) {
  const stats = starterSubjectStats[subject] || { tags: new Set(), explicit: 0, hand: 0, curated: 0 };
  console.log(`starter anchors ${subject}: ${stats.explicit}/${stats.tags.size} explicit (${stats.hand} hand-authored, ${stats.curated} structured)`);
  if (stats.tags.size >= 15 && stats.explicit < 15) issues.push(`STARTER ANCHORS: ${subject} has only ${stats.explicit} explicit starters; expected at least 15`);
}

const grouped = {};
for (const i of issues) (grouped[i.split(':')[0]] ||= []).push(i);
console.log(`\n=== ISSUES (${issues.length}) ===`);
for (const [type, list] of Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n[${type}] x${list.length}`);
  for (const line of list.slice(0, 15)) console.log('  ' + line);
  if (list.length > 15) console.log(`  ...and ${list.length - 15} more`);
}
if (!issues.length) console.log('none');

// Non-zero exit on anything that breaks a question for a student.
const fatal = issues.filter((i) => /^(UNGRADEABLE|BAD OPTION KEYS|MISSING BANK|DUPLICATE ID|NO OPTIONS|EMPTY STEM)/.test(i));
if (fatal.length) {
  console.log(`\n${fatal.length} fatal issue(s) — these break questions for students.`);
  process.exit(1);
}

// A correct answer that opens with a conjunction or relative pronoun is the
// tail of a sentence whose front was lost — "so there's no route for magma to
// reach the surface". The student reads the right answer as broken English.
//
// This is how the GCSE Science answers were damaged: several *ConciseAnswers
// tables overwrite item.options[item.correct] with a shortened string, and a
// bad entry there silently replaces a correct answer with a fragment, a
// circular phrase, or a different fact. Nothing else in this audit can see it,
// because the result is still a well-formed four-option question.
//
// Allowances are per subject at today's level, so the known backlog does not
// fail the build but nothing new slips in. Any subject not listed must be 0.
const FRAGMENT_ANSWER_ALLOWANCE = { 'gcse-geo': 30, cs: 4 };
const FRAGMENT_OPENERS = /^(?:and|so|but|which|that|because|while|whereas|although|then|therefore)\b/i;
const fragmentCounts = {};
for (const [key, subject] of Object.entries(SUBJECTS)) {
  for (const bankId of subject.banks || []) {
    for (const q of (BANKS[bankId] || { questions: [] }).questions) {
      for (const item of [q, q.reforge]) {
        if (!item || !item.options || !item.correct) continue;
        const answer = String(item.options[item.correct]).trim();
        if (/^[a-z]/.test(answer) && FRAGMENT_OPENERS.test(answer)) {
          (fragmentCounts[key] = fragmentCounts[key] || []).push(`${q.id}: "${answer.slice(0, 60)}"`);
        }
      }
    }
  }
}
for (const [key, list] of Object.entries(fragmentCounts)) {
  const allowed = FRAGMENT_ANSWER_ALLOWANCE[key] || 0;
  if (list.length > allowed) {
    issues.push(
      `FRAGMENT ANSWER: "${key}" has ${list.length} correct answer(s) that start mid-sentence (allowed ${allowed}) — ` +
      `e.g. ${list.slice(0, 2).join('; ')}. Restore the full answer text, and check the *ConciseAnswers override tables in data/forge-data.js.`
    );
  }
}

// Misconception-taxonomy guard. These do not break a question for a student,
// so they are not in the "fatal" list above, but they silently make the
// teacher heatmap useless — and nothing else in this audit can see them, since
// a bank of 420 one-off tags is structurally perfect. Enforced for the
// subjects listed in TAG_TAXONOMY_SUBJECTS only, at their current level, so
// this stops regressions without failing on the known backlog.
const taxonomy = issues.filter((i) => /^(TAG TAXONOMY|NO STARTER|FRAGMENT ANSWER)/.test(i));
if (taxonomy.length) {
  console.log(
    `\n${taxonomy.length} content-quality issue(s) — a structurally valid question can still be unusable. ` +
    `Group one-off tags into shared categories with a label and a starter, and keep correct answers readable in full.`
  );
  process.exit(1);
}

// Regression guard for permuted Reforge twins (see CLAUDE.md "Known
// outstanding issues"). 1,102 already exist and are being rewritten by hand,
// bank by bank — this only stops that count from growing. Only enforced on
// a full run (no bank/subject filter), since a partial run can't see the
// true total. Lower PERMUTED_REFORGE_BASELINE as banks get fixed.
const PERMUTED_REFORGE_BASELINE = 0;
if (!args.length && totals.permutedRef > PERMUTED_REFORGE_BASELINE) {
  console.log(
    `\nPermuted Reforge twins regressed: ${totals.permutedRef} > baseline ${PERMUTED_REFORGE_BASELINE}. ` +
    `Every new Reforge twin must test the misconception from a different angle, not reorder the parent's options.`
  );
  process.exit(1);
} else if (!args.length && totals.permutedRef < PERMUTED_REFORGE_BASELINE) {
  console.log(`\nPermuted Reforge twins improved: ${totals.permutedRef} < baseline ${PERMUTED_REFORGE_BASELINE}. Lower PERMUTED_REFORGE_BASELINE in dev/audit-banks.js to lock in the gain.`);
}
