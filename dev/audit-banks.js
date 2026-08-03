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

// Regression guard for permuted Reforge twins (see CLAUDE.md "Known
// outstanding issues"). 1,102 already exist and are being rewritten by hand,
// bank by bank — this only stops that count from growing. Only enforced on
// a full run (no bank/subject filter), since a partial run can't see the
// true total. Lower PERMUTED_REFORGE_BASELINE as banks get fixed.
const PERMUTED_REFORGE_BASELINE = 831;
if (!args.length && totals.permutedRef > PERMUTED_REFORGE_BASELINE) {
  console.log(
    `\nPermuted Reforge twins regressed: ${totals.permutedRef} > baseline ${PERMUTED_REFORGE_BASELINE}. ` +
    `Every new Reforge twin must test the misconception from a different angle, not reorder the parent's options.`
  );
  process.exit(1);
} else if (!args.length && totals.permutedRef < PERMUTED_REFORGE_BASELINE) {
  console.log(`\nPermuted Reforge twins improved: ${totals.permutedRef} < baseline ${PERMUTED_REFORGE_BASELINE}. Lower PERMUTED_REFORGE_BASELINE in dev/audit-banks.js to lock in the gain.`);
}
