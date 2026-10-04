#!/usr/bin/env node
/* A practice set mixes formats: one question is answered from memory before
   the options appear, and a clean set offers a match round in the same topic. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
const start = quiz.indexOf('var RECALL_ANSWER_MAX');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(quiz.slice(start, quiz.indexOf('function forgeCompleteSession()', start)), ctx);
const mcq = (answer) => ({ options: { A: answer, B: 'x' }, correct: 'A' });
const fill = { type: 'fill_blank' };

assert.strictEqual(ctx.forgeRecallIndex([mcq('a'), mcq('b'), mcq('Short answer'), mcq('c')]), 2, 'not the opening questions: the third is the first candidate');
assert.strictEqual(ctx.forgeRecallIndex([mcq('a'), mcq('b'), fill, mcq('x'.repeat(80)), mcq('Short')]), 4, 'skips fill-in-the-gap and long answers');
assert.strictEqual(ctx.forgeRecallIndex([mcq('a'), mcq('b')]), -1, 'a short set may have none');
const set = [mcq('a'), mcq('b'), mcq('c'), mcq('d')];
assert.strictEqual(ctx.forgeRecallIndex(set), ctx.forgeRecallIndex(set), 'chosen by rule, so a resumed set picks the same question');

assert(quiz.includes("id=\"forge-recall-options\" hidden"), 'options stay hidden until the student asks for them');
assert(/logResponse\(q, k, isCorrect, false, null, hinted\)/.test(quiz), 'the recall question is still scored as its multiple-choice answer');
assert(quiz.includes("'&amp;match='+encodeURIComponent(state.bank)"), 'a clean set links to a match round in the same topic');

const rev = fs.readFileSync('scripts/forge-revision.js', 'utf8');
assert(/options\.startMatch&&availableCards\(\[options\.startMatch\]\)\.length/.test(rev), 'Revision opens a linked match round only for a topic it can serve');
assert(fs.readFileSync('pages/app/revision.html', 'utf8').includes("startMatch:new URLSearchParams(location.search).get('match')"), 'the match link reaches Revision');
console.log('Mixed practice tests passed (answer from memory, scoring unchanged, match link).');
