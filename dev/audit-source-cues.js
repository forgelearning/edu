#!/usr/bin/env node
/*
 * How much of "0 longest-answer cues" is authored, and how much is a runtime
 * patch?
 *
 * `dev/audit-banks.js` reports 0 CUE across all 15,063 items, and that is true
 * of what a student sees. But it is measured *after* the anti-cue loop near the
 * end of `data/forge-data.js` has swapped a longer distractor into every
 * question whose correct answer was the longest option.
 *
 * This script loads the bank twice — once as-is, once with that loop removed —
 * so the debt underneath the patch is visible. It is reporting-only and never
 * fails a build: the number is large, it is not a regression, and pinning a
 * ratchet on it would just block every PR.
 *
 * Run it before deciding that a cue-related backlog is hand-authoring work.
 * When this was written, 393 of the 394 SHORT CUE items were authored that way
 * in source, but roughly half the remaining RECYCLED DISTRACTOR strings were
 * produced by the loop rather than by an author.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'data', 'forge-data.js');
const lines = fs.readFileSync(SRC, 'utf8').split('\n');

// The loop is delimited by these two comments. Matching on them rather than on
// line numbers means this keeps working as the file grows around it.
const START_MARK = 'If clause de-duplication shortened a distractor below the key';
const END_MARK = 'Resolve the small set of coverage twins whose Reforge options are only a';
const start = lines.findIndex((l) => l.includes(START_MARK));
const end = lines.findIndex((l) => l.includes(END_MARK));
if (start === -1 || end === -1 || end <= start) {
  console.error(
    'Could not locate the anti-cue loop in data/forge-data.js.\n' +
    'It is delimited by two comments; if they were reworded, update START_MARK/END_MARK here.'
  );
  process.exit(2);
}

const load = (source) => new Function('window', source + ';return {BANKS:BANKS,SUBJECTS:SUBJECTS};')({});
const patched = load(lines.join('\n'));
const raw = load(lines.slice(0, start).concat(lines.slice(end)).join('\n'));

const subjectOf = (data) => {
  const map = {};
  for (const key of Object.keys(data.SUBJECTS)) {
    for (const bank of data.SUBJECTS[key].banks || []) if (!map[bank]) map[bank] = key;
  }
  return map;
};

function cueStats(data) {
  const bankToSubject = subjectOf(data);
  const per = {};
  let total = 0, cued = 0;
  for (const bankId of Object.keys(data.BANKS)) {
    const subject = bankToSubject[bankId] || '(orphan)';
    for (const question of data.BANKS[bankId].questions || []) {
      for (const item of [question, question.reforge]) {
        if (!item || !item.options || typeof item.correct !== 'string') continue;
        per[subject] = per[subject] || { n: 0, cue: 0 };
        per[subject].n++; total++;
        const lengths = Object.values(item.options).map((v) => String(v).trim().length);
        const max = Math.max(...lengths);
        const correct = String(item.options[item.correct] || '').trim().length;
        if (lengths.filter((l) => l === max).length === 1 && correct === max) { per[subject].cue++; cued++; }
      }
    }
  }
  return { per, total, cued };
}

const after = cueStats(patched);
const before = cueStats(raw);

console.log('Longest-answer cues in the SOURCE, before the anti-cue loop runs\n');
console.log(`  items                       ${before.total}`);
console.log(`  cued in source              ${before.cued}  (${((before.cued / before.total) * 100).toFixed(1)}%)`);
console.log(`  cued after the loop runs    ${after.cued}`);
console.log(`  masked by the loop          ${before.cued - after.cued}`);

const rows = Object.entries(before.per)
  .filter(([, v]) => v.n >= 100)
  .map(([k, v]) => [k, v.cue, v.n, v.cue / v.n])
  .sort((a, b) => b[3] - a[3]);

console.log('\n  by subject (>=100 items), worst first:');
console.log('  subject            cued/items   rate');
for (const [subject, cue, n, rate] of rows) {
  console.log(`  ${subject.padEnd(18)} ${String(cue).padStart(5)}/${String(n).padEnd(6)} ${(rate * 100).toFixed(1)}%`);
}

console.log(
  '\nThe loop keeps students from seeing these, but every one is a question whose\n' +
  'correct answer was written longer than all three distractors. Fixing them at\n' +
  'source is what would let the loop be deleted.'
);
