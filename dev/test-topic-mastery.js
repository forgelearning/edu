#!/usr/bin/env node
/* One readiness ring per topic, the same on Practice, Home and Profile. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const ctx = { ForgeMisconceptions: { summarize: () => ({ active: [{ tag: 'MC-OPEN' }] }) } };
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('scripts/forge-topic-mastery.js', 'utf8'), ctx);
const T = ctx.ForgeTopicMastery;
const rows = (n, correct, extra) => Array.from({ length: n }, (_, i) => Object.assign({ bank: 'B', question_id: 'Q' + i, is_correct: i < correct, created_at: '2026-10-01T10:' + String(i).padStart(2, '0') }, extra || {}));

assert.strictEqual(T.status([], 'B').key, 'none', 'no answers: not started');
assert.strictEqual(T.status(rows(10, 4), 'B').key, 'red', 'under half: needs work');
assert.strictEqual(T.status(rows(10, 6), 'B').key, 'amber', 'half or more: getting there');
assert.strictEqual(T.status(rows(10, 9), 'B').key, 'green', '80% over eight or more: secure');
assert.strictEqual(T.status(rows(5, 5), 'B').key, 'amber', 'too few answers to confirm');
assert.strictEqual(T.status(rows(9, 9).concat([{ bank: 'B', question_id: 'W', is_correct: false, misconception_tag: 'MC-OPEN', created_at: '2026-09-01' }]), 'B').key, 'amber', 'an unrepaired mistake in the topic holds it at amber');
assert.strictEqual(T.status(rows(10, 10, { hint_used: true }), 'B').key, 'red', 'hinted answers are not credited');
assert.strictEqual(T.status(rows(10, 10).concat(rows(5, 0, { question_id: 'X-ANVIL', reforge_attempted: true })), 'B').key, 'green', 'repair attempts are not first attempts');
// Only the latest ten count, so a topic can recover.
const old = rows(10, 0).map((r, i) => Object.assign({}, r, { question_id: 'O' + i, created_at: '2026-01-01T00:' + String(i).padStart(2, '0') }));
assert.strictEqual(T.status(old.concat(rows(10, 9)), 'B').key, 'green', 'early mistakes age out of the window');
assert(/answer 3 more to confirm/.test(T.detail(T.status(rows(5, 5), 'B'))), 'the detail says what would make it secure');
assert(T.ringHtml(T.status(rows(10, 9), 'B'), true).includes('Secure'), 'the ring carries a text label');

['pages/app/forge-quiz.html', 'pages/app/student-dashboard.html', 'pages/app/profile.html'].forEach((file) => {
  const src = fs.readFileSync(file, 'utf8');
  assert(src.includes('scripts/forge-topic-mastery.js'), file + ' loads the shared ring');
  assert(src.includes('ForgeTopicMastery.ringHtml('), file + ' shows the shared ring');
});
console.log('Topic mastery tests passed (thresholds, open mistakes, hints, repair rows, rolling window, three pages).');
