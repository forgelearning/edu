#!/usr/bin/env node
'use strict';
/*
 * Ratchet on longest-answer cues in the SOURCE, before the anti-cue loop runs.
 *
 * Why this exists as a separate gate from `dev/audit-banks.js`:
 *
 * The audit measures what a student sees, after the anti-cue loop near the end
 * of `data/forge-data.js` has swapped a longer distractor into every question
 * whose correct answer was the longest option. So the audit reports 0 CUE no
 * matter how the question was written, and a newly authored bank where the key
 * is the giveaway every time passes it cleanly. That is not hypothetical: the
 * first draft of the Year 10 GCSE Geography extension cued 12 questions out of
 * 12, and `npm run check` was green on all of them.
 *
 * Writing nuanced correct answers against blunt distractors is the natural way
 * to write a question, which is why CLAUDE.md's authoring standard opens with
 * this rule and why it keeps being broken. This check makes the mistake visible
 * at authoring time rather than after the runtime patch has hidden it.
 *
 *   node dev/check-source-cues.js               # ratchet, fails on regression
 *   node dev/check-source-cues.js gcse-geo      # list a subject's cued items
 *   node dev/check-source-cues.js GCSE-GEO-URB  # list one bank's cued items
 *
 * Filtered runs are an authoring aid and never fail: a partial run cannot see
 * the total the baseline is pinned to.
 *
 * Every swap the loop makes has to take a longer distractor from somewhere,
 * which is the recycling problem documented in CLAUDE.md. Lowering this number
 * is what would let the loop be deleted, so ratchet it down as banks are
 * rewritten. Raising it is not a fix.
 */

const { loadBankPair, cueItems } = require('./lib/source-bank.js');

// Lower this as source questions are rewritten; never raise it. Measured
// 2026-08-26 (CLAUDE.md's 2,430 / 16.1% figure predates work by other sessions
// and was already stale when this was written — re-measure, don't trust it).
const SOURCE_CUE_BASELINE = 1615;

const filter = process.argv[2];
const { raw } = loadBankPair();
const all = cueItems(raw);

if (filter) {
  const scoped = all.filter((i) => i.subject === filter || i.bankId === filter);
  if (!scoped.length) {
    console.error(`No bank or subject matched "${filter}".`);
    process.exit(2);
  }
  const cued = scoped.filter((i) => i.cued);
  console.log(`${filter}: ${cued.length} of ${scoped.length} items have the correct answer as the single longest option.\n`);
  for (const item of cued) console.log(`  CUE  ${item.id}  (${item.bankId})`);
  if (!cued.length) console.log('  none — every correct answer has a distractor at least as long.');
  console.log('\nFix by writing a distractor of comparable length, never by padding the key:');
  console.log('padding is what produced the "in this context" filler bug. See CLAUDE.md.');
  process.exit(0);
}

const cued = all.filter((i) => i.cued);
const rate = ((cued.length / all.length) * 100).toFixed(1);
console.log(`source longest-answer cues: ${cued.length} of ${all.length} items (${rate}%)  (baseline ${SOURCE_CUE_BASELINE})`);

if (cued.length > SOURCE_CUE_BASELINE) {
  const per = {};
  for (const item of cued) per[item.bankId] = (per[item.bankId] || 0) + 1;
  console.log(`\nSource cues regressed: ${cued.length} > baseline ${SOURCE_CUE_BASELINE}.`);
  console.log('Worst banks:');
  Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .forEach(([bank, n]) => console.log(`  ${String(n).padStart(4)}  ${bank}`));
  console.log(
    '\nThe anti-cue loop will hide these from students, so audit-banks.js stays green —\n' +
    'but each one is a question whose correct answer was written longer than all three\n' +
    'distractors. Run this with a bank id to list them, and lengthen a distractor.'
  );
  process.exit(1);
}

if (cued.length < SOURCE_CUE_BASELINE) {
  console.log(
    `\nSource cues improved: ${cued.length} < baseline ${SOURCE_CUE_BASELINE}. ` +
    'Lower SOURCE_CUE_BASELINE in dev/check-source-cues.js to lock the gain in.'
  );
}
