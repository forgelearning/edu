'use strict';
/*
 * Loading the question bank twice: as a student sees it, and as it was written.
 *
 * The anti-cue loop near the end of `data/forge-data.js` swaps a longer
 * distractor into any question whose correct answer was the longest option.
 * That is why `dev/audit-banks.js` can report 0 CUE while thousands of source
 * questions are still authored with a giveaway key. Anything that wants to see
 * the authored state has to load the file with that loop removed.
 *
 * The loop is located by two comments rather than by line number, so this keeps
 * working as the file grows around it. If those comments are reworded, both
 * `dev/audit-source-cues.js` and `dev/check-source-cues.js` fail loudly with a
 * pointer here rather than silently reporting zero.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'data', 'forge-data.js');
const START_MARK = 'If clause de-duplication shortened a distractor below the key';
const END_MARK = 'Resolve the small set of coverage twins whose Reforge options are only a';

const evaluate = (source) =>
  new Function('window', source + ';return {BANKS:BANKS,SUBJECTS:SUBJECTS};')({});

/*
 * Returns { patched, raw }: the bank with the anti-cue loop applied, and the
 * bank as authored. Exits 2 if the loop can no longer be located, because
 * every caller's number would otherwise be quietly wrong.
 */
function loadBankPair() {
  const lines = fs.readFileSync(SRC, 'utf8').split('\n');
  const start = lines.findIndex((l) => l.includes(START_MARK));
  const end = lines.findIndex((l) => l.includes(END_MARK));
  if (start === -1 || end === -1 || end <= start) {
    console.error(
      'Could not locate the anti-cue loop in data/forge-data.js.\n' +
      'It is delimited by two comments; if they were reworded, update\n' +
      'START_MARK/END_MARK in dev/lib/source-bank.js.'
    );
    process.exit(2);
  }
  return {
    patched: evaluate(lines.join('\n')),
    raw: evaluate(lines.slice(0, start).concat(lines.slice(end)).join('\n'))
  };
}

/* bank id -> subject key, first subject wins (a bank can be shared). */
function bankToSubject(data) {
  const map = {};
  for (const key of Object.keys(data.SUBJECTS)) {
    for (const bank of data.SUBJECTS[key].banks || []) if (!map[bank]) map[bank] = key;
  }
  return map;
}

/*
 * Every gradeable item (stem and Reforge twin alike) with a flag for whether
 * its correct option is the single longest one — the cue a student can score
 * above chance on without knowing the subject. Ties are not cues: if two
 * options share the maximum length there is nothing to pick out.
 */
function cueItems(data) {
  const subjectOf = bankToSubject(data);
  const items = [];
  for (const bankId of Object.keys(data.BANKS)) {
    for (const question of data.BANKS[bankId].questions || []) {
      for (const [item, label] of [[question, ''], [question.reforge, ' (reforge)']]) {
        if (!item || !item.options || typeof item.correct !== 'string') continue;
        const lengths = Object.values(item.options).map((v) => String(v).trim().length);
        const max = Math.max(...lengths);
        const correct = String(item.options[item.correct] || '').trim().length;
        items.push({
          id: (question.id || '(no id)') + label,
          bankId,
          subject: subjectOf[bankId] || '(orphan)',
          cued: correct === max && lengths.filter((l) => l === max).length === 1
        });
      }
    }
  }
  return items;
}

module.exports = { loadBankPair, cueItems, bankToSubject, SRC };
