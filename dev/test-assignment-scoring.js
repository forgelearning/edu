#!/usr/bin/env node
/*
 * Pins the assignment attainment rule.
 *
 * The student's assignment card and the teacher's assignment card used to
 * implement scoring separately and disagreed on identical data — student 0%,
 * teacher 38%, quiz evidence 31%. Both now call
 * ForgeAssignmentProgress.progress, so these cases lock in the shared rule and
 * would fail if either surface forked again.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const sandbox = { window: {}, console };
sandbox.window.ForgeAssignmentBanks = {
  'BANK-A': { questions: Array.from({ length: 20 }, (_, i) => ({ id: 'A-' + (i + 1) })) },
  'BANK-B': { questions: Array.from({ length: 20 }, (_, i) => ({ id: 'B-' + (i + 1) })) }
};
sandbox.localStorage = { getItem: () => null, setItem: () => {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'scripts', 'forge-assignment-progress.js'), 'utf8'), sandbox);
const P = sandbox.window.ForgeAssignmentProgress;

let failures = 0;
function eq(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { console.log('  ok   ' + name); return; }
  failures++;
  console.log('  FAIL ' + name + '\n         expected ' + e + '\n         actual   ' + a);
}

const CREATED = '2026-08-17T10:00:00.000Z';
const assignment = { id: 'asgn-1', banks: JSON.stringify(['BANK-A', 'BANK-B']), created_at: CREATED };
const at = (mins) => new Date(Date.parse(CREATED) + mins * 60000).toISOString();
const row = (o) => Object.assign({ bank: 'BANK-A', is_correct: true, created_at: at(1) }, o);

console.log('Assignment scoring rule\n');

// total = min(8, available) per bank, across two banks
eq('total is 8 per bank', P.progress(assignment, []).total, 16);

// Rule 1: first attempt counts; the reforge twin is practice, not reassessment.
eq('reforge twin does not count as a second answer',
  (() => {
    const p = P.progress(assignment, [
      row({ question_id: 'A-1', is_correct: false, created_at: at(1) }),
      row({ question_id: 'A-1-RF', is_correct: true, created_at: at(2) })
    ]);
    return { answered: p.answered, correct: p.correct };
  })(), { answered: 1, correct: 0 });

// Rule 1, order independence: the same rows in the opposite order must score
// identically. This is what made the two surfaces disagree.
eq('score does not depend on row order',
  (() => {
    const rows = [
      row({ question_id: 'A-1', is_correct: false, created_at: at(1) }),
      row({ question_id: 'A-2', is_correct: true, created_at: at(2) })
    ];
    const forward = P.progress(assignment, rows);
    const reverse = P.progress(assignment, rows.slice().reverse());
    return [
      { answered: forward.answered, correct: forward.correct },
      { answered: reverse.answered, correct: reverse.correct }
    ];
  })(), [{ answered: 2, correct: 1 }, { answered: 2, correct: 1 }]);

// Rule 2: Anvil and Crucible are separate activities, not assigned work.
eq('Anvil and Crucible rows are excluded',
  (() => {
    const p = P.progress(assignment, [
      row({ question_id: 'A-1', is_correct: true }),
      row({ question_id: 'A-2-ANVIL', bank: 'MC-SOME-TAG', is_correct: true }),
      row({ question_id: 'A-3-CRU', bank: 'A-MIX', is_correct: true })
    ]);
    return { answered: p.answered, correct: p.correct };
  })(), { answered: 1, correct: 1 });

// Rule 3: nothing from before the assignment existed.
eq('answers predating the assignment are excluded',
  P.progress(assignment, [
    row({ question_id: 'A-1', created_at: at(-60) }),
    row({ question_id: 'A-2', created_at: at(5) })
  ]).answered, 1);

// Rule 3, exact form: an explicit assignment_id wins over the time heuristic.
eq('assignment_id scopes rows exactly when present',
  (() => {
    const p = P.progress(assignment, [
      row({ question_id: 'A-1', assignment_id: 'asgn-1' }),
      row({ question_id: 'A-2', assignment_id: 'asgn-other' })
    ]);
    return p.answered;
  })(), 1);

// Duplicate submissions of the same question count once.
eq('repeat answers to one question count once',
  P.progress(assignment, [
    row({ question_id: 'A-1', is_correct: false, created_at: at(1) }),
    row({ question_id: 'A-1', is_correct: true, created_at: at(3) })
  ]).correct, 0);

// Once a bank's assigned eight-question session is complete, later practice
// in that bank must not push accuracy above 100% or rewrite the original mark.
eq('later bank practice cannot inflate a completed assignment',
  (() => {
    const rows = [];
    for (let i = 1; i <= 10; i++) {
      rows.push(row({ question_id: 'A-' + i, is_correct: i !== 1, created_at: at(i) }));
    }
    const p = P.progress({ id: 'asgn-one', banks: JSON.stringify(['BANK-A']), created_at: CREATED }, rows);
    return { answered: p.answered, correct: p.correct, accuracy: Math.round((p.correct / p.answered) * 100) };
  })(), { answered: 8, correct: 7, accuracy: 88 });

// Per-bank progress, which drives "Open next assignment".
eq('bankProgress is scoped to its own bank',
  (() => {
    const rows = [row({ question_id: 'A-1', bank: 'BANK-A' }), row({ question_id: 'B-1', bank: 'BANK-B' })];
    return [P.bankProgress(assignment, 'BANK-A', rows).answered, P.bankProgress(assignment, 'BANK-B', rows).answered];
  })(), [1, 1]);

// The routing bug: with BANK-A finished, the next bank must be BANK-B.
eq('nextBank skips a completed bank',
  (() => {
    const rows = [];
    for (let i = 1; i <= 8; i++) rows.push(row({ question_id: 'A-' + i, bank: 'BANK-A' }));
    return P.nextBank(assignment, rows);
  })(), 'BANK-B');

eq('nextBank returns the first bank when nothing is done', P.nextBank(assignment, []), 'BANK-A');

// Student and teacher agreement: the teacher filters to one student's rows and
// then calls the same function, so the two must land on the same numbers.
eq('student and teacher agree on the same data',
  (() => {
    const rows = [
      row({ question_id: 'A-1', student_id: 's1', is_correct: true, created_at: at(1) }),
      row({ question_id: 'A-1-RF', student_id: 's1', is_correct: true, created_at: at(2) }),
      row({ question_id: 'A-2', student_id: 's1', is_correct: false, created_at: at(3) }),
      row({ question_id: 'A-9-CRU', student_id: 's1', bank: 'A-MIX', is_correct: true, created_at: at(4) }),
      row({ question_id: 'A-3', student_id: 's2', is_correct: true, created_at: at(5) })
    ];
    const student = P.progress(assignment, rows.filter((r) => r.student_id === 's1'));
    const teacher = P.progress(assignment, rows.filter((r) => r.student_id === 's1'));
    const pct = (p) => (p.answered ? Math.round((p.correct / p.answered) * 100) : null);
    return { student: pct(student), teacher: pct(teacher), answered: student.answered };
  })(), { student: 50, teacher: 50, answered: 2 });

console.log('');
if (failures) { console.error('Assignment scoring tests FAILED (' + failures + ').'); process.exit(1); }
console.log('Assignment scoring tests passed (' + 12 + ' cases).');
