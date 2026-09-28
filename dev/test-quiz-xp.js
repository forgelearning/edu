#!/usr/bin/env node
/* The XP a student sees during a quiz must add up to the total the dashboard
   computes from the same answers, or the two numbers drift apart. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
function grab(start, end) { const i = src.indexOf(start); return src.slice(i, src.indexOf(end, i)); }
const code = grab('function calcXPFromResponses(', 'function renderResults(')
  + grab('// ── XP feedback ──', 'var requestedBank');

const ctx = { state: { classId: 'c1', isPaid: false, isTrial: false, baseXP: null, pageXP: 0, sessionXP: 0 }, document: { getElementById: () => null } };
ctx.isFreeTier = () => !ctx.state.isPaid && !ctx.state.isTrial && !ctx.state.classId;
vm.createContext(ctx);
vm.runInContext(code, ctx);

// In-quiz awards match the response-based total.
const rows = [
  { question_id: 'A-01', is_correct: true, reforge_attempted: false },
  { question_id: 'A-02', is_correct: false, reforge_attempted: false },
  { question_id: 'A-02', is_correct: true, reforge_attempted: true, reforge_correct: true },
  { question_id: 'A-03', is_correct: false, reforge_attempted: false },
  { question_id: 'A-03', is_correct: false, reforge_attempted: true, reforge_correct: false }
];
assert.strictEqual(ctx.XP_CORRECT + ctx.XP_REFORGE, ctx.calcXPFromResponses(rows), 'quiz awards equal the dashboard total for the same answers');

// Session and results.
const host = { html: '', insertAdjacentHTML(_, h) { this.html += h; } };
ctx.awardXP(10, host); ctx.awardXP(20, host);
assert.strictEqual(ctx.state.sessionXP, 30);
assert(host.html.includes('+10 XP') && host.html.includes('+20 XP'), 'each award is shown where it was earned');
assert(ctx.xpResultsHtml().includes('+30 XP') && !ctx.xpResultsHtml().includes('progressbar'), 'without history, results show session XP but no rank bar');

ctx.setXPHistory([{ question_id: 'X', is_correct: true }].concat(Array(28).fill({ question_id: 'Y', is_correct: true })));
assert.strictEqual(ctx.state.baseXP, 290);
const html = ctx.xpResultsHtml();
assert(html.includes('New rank: Journeyman') && html.includes('320 XP'), 'crossing 300 XP announces the new rank');
assert(html.includes('1,180 XP to Craftsman'), 'shows the distance to the next rank');

ctx.state.classId = null;
assert.strictEqual(ctx.xpResultsHtml(), '', 'free-tier students see no XP, matching the Pro upsell');

console.log('Quiz XP tests passed (matches dashboard total, session awards, rank progress, rank-up, free tier hidden).');
