#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = {
  window: {},
  BANKS: { demo: { questions: [{ id: 'Q-1', tag: 'MC-DEMO-01' }] } }
};
context.window.BANKS = context.BANKS;
vm.createContext(context);
vm.runInContext(fs.readFileSync('scripts/forge-misconception-state.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('scripts/forge-metrics.js', 'utf8'), context);

const rows = [
  { question_id: 'Q-1', misconception_tag: 'MC-DEMO-01', is_correct: false, created_at: '2026-01-01T00:00:00Z' },
  { question_id: 'Q-1-RF', reforge_attempted: true, reforge_correct: true, is_correct: true, created_at: '2026-01-02T00:00:00Z' },
  { question_id: 'Q-1-ANVIL', misconception_tag: 'MC-DEMO-01', reforge_attempted: true, reforge_correct: false, is_correct: false, created_at: '2026-01-03T00:00:00Z' },
  { question_id: 'Q-1-ANVIL', misconception_tag: 'MC-DEMO-01', reforge_attempted: true, reforge_correct: true, is_correct: true, created_at: '2026-01-04T00:00:00Z' },
  { question_id: 'Q-1-ANVIL', misconception_tag: 'MC-DEMO-01', reforge_attempted: true, reforge_correct: true, is_correct: true, created_at: '2026-01-05T00:00:00Z' },
  { question_id: 'Q-1-ANVIL', misconception_tag: 'MC-DEMO-01', reforge_attempted: true, reforge_correct: true, is_correct: true, created_at: '2026-01-06T00:00:00Z' }
];

let summary = context.window.ForgeMisconceptions.summarize(rows);
assert.deepStrictEqual(Array.from(summary.resolved), ['MC-DEMO-01'], 'three consecutive successful repairs must resolve a fired signal');
assert.strictEqual(summary.data['MC-DEMO-01'].fires, 1, 'failed Re-forges must not create new misconception fires');
assert.strictEqual(summary.data['MC-DEMO-01'].reforgeAttempts, 5, 'all repair attempts must remain visible');
assert.strictEqual(context.window.ForgeMisconceptions.tagForRow(rows[1]), 'MC-DEMO-01', 'legacy untagged Re-forges must recover their tag from the question id');

summary = context.window.ForgeMisconceptions.summarize(rows.concat({
  question_id: 'Q-1', misconception_tag: 'MC-DEMO-01', is_correct: false, created_at: '2026-01-07T00:00:00Z'
}));
assert.deepStrictEqual(Array.from(summary.active), ['MC-DEMO-01'], 'a later scored error must reopen a resolved signal');
assert.strictEqual(summary.data['MC-DEMO-01'].streak, 0, 'a later scored error must reset the repair streak');

const session = context.window.ForgeMisconceptions.session(['MC-DEMO-01', 'MC-OTHER-01'], ['MC-DEMO-01']);
assert.deepStrictEqual(Array.from(session.repaired), ['MC-DEMO-01']);
assert.deepStrictEqual(Array.from(session.remaining), ['MC-OTHER-01']);

const metricRows = [
  { is_correct: true, mode: 'forge' },
  { is_correct: false, mode: 'assignment' },
  { is_correct: true, mode: 'crucible' },
  { is_correct: true, reforge_attempted: true, mode: 'anvil' }
];
const accuracy = context.window.ForgeMetrics.accuracy(metricRows);
assert.strictEqual(accuracy.total, 3, 'Re-forge attempts must be excluded from scored-answer denominators');
assert.strictEqual(accuracy.correct, 2);
assert.strictEqual(accuracy.percent, 67);

const school = fs.readFileSync('pages/app/school-overview.html', 'utf8');
assert(school.includes('classEngagement.filter(function(cls){return cls.responses>=5;})'), 'leadership focus must require a reliable class sample');
assert(school.includes('Build a reliable baseline'), 'leadership focus must explain the small-sample fallback');
assert(school.includes('Accuracy = correct scored answers ÷ scored answers'), 'leadership metrics must state their denominator');
assert(school.includes('Relative volume compares each signal'), 'misconception bars must define their comparison');

console.log('Analytics integrity tests passed (misconception lifecycle, denominators, and leadership sample rules).');
