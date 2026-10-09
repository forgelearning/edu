#!/usr/bin/env node
/* Which video each question would offer after a wrong answer
 * (scripts/forge-video-match.js). Diagnostic, not a gate: it prints coverage
 * per subject and a sample of matches to read, because a wrong video after a
 * mistake is worse than none and only reading the pairs shows that.
 *
 *   node dev/audit-video-matches.js              coverage for every subject
 *   node dev/audit-video-matches.js econ 25      plus 25 sample matches for econ
 *   node dev/audit-video-matches.js econ 25 miss plus 25 unmatched questions
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
ctx.window.window = ctx.window;
ctx.globalThis = ctx.window;
vm.createContext(ctx);
const run = (file, tail) => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8') + (tail || ''), ctx, { filename: file });
run('data/forge-data.js', ';window.__S=SUBJECTS;window.__B=BANKS;');
try { run('data/misconception-labels.js'); } catch (e) { /* labels are a bonus */ }
run('scripts/forge-video-library.js');
run('scripts/forge-video-match.js');
const W = ctx.window, M = W.ForgeVideoMatch, L = W.ForgeVideoLibrary;
const label = (tag) => { try { return W.resolveMCLabel ? W.resolveMCLabel(tag) : ''; } catch (e) { return ''; } };

const [only, sampleArg, mode] = process.argv.slice(2);
const sample = Number(sampleArg) || 0;
let total = 0, matched = 0;
for (const subject of Object.keys(W.__S)) {
  if (only && subject !== only) continue;
  const seen = new Set();
  const qs = [], topic = {};
  for (const bank of W.__S[subject].banks || []) {
    for (const q of (W.__B[bank] && W.__B[bank].questions) || []) {
      if (!q.correct || seen.has(q.id) || q.coverageVariant) continue;
      seen.add(q.id); qs.push(q); topic[q.id] = W.__B[bank].label;
    }
  }
  // The same corpus the page uses to judge which words are distinctive.
  const corpus = M.subjectQuestions ? (W.SUBJECTS = W.__S, W.BANKS = W.__B, M.subjectQuestions(subject)) : qs;
  const results = qs.map((q) => ({ q, v: M.match(L, q, subject, label(q.tag), corpus, topic[q.id]) }));
  const hit = results.filter((r) => r.v).length;
  total += qs.length; matched += hit;
  const used = new Set(results.filter((r) => r.v).map((r) => r.v.id)).size;
  console.log(`${subject.padEnd(14)} ${String(hit).padStart(4)}/${String(qs.length).padEnd(4)} ${(qs.length ? hit / qs.length * 100 : 0).toFixed(0).padStart(3)}%  ${used} distinct videos  (${L.subjects[subject] || 'no library'})`);
  if (sample) {
    const pool = results.filter((r) => mode === 'miss' ? !r.v : r.v);
    const step = Math.max(1, Math.floor(pool.length / sample));
    for (let i = 0; i < pool.length && i / step < sample; i += step) {
      const { q, v } = pool[i];
      const stem = String(q.stem || q.template || '').replace(/\s+/g, ' ').slice(0, 110);
      console.log(`  ${q.id}: ${stem}\n      answer: ${String(q.options[q.correct]).slice(0, 80)}${v ? `\n      → ${v.title} [${v.score.toFixed(1)}]` : ''}`);
    }
  }
}
console.log(`\n${matched}/${total} source questions (${(matched / total * 100).toFixed(0)}%) would offer a video.`);
