#!/usr/bin/env node
/*
 * Content-review report for GCSE Geography. This deliberately complements
 * audit-banks.js: structural tests can prove that a question is answerable,
 * while this report surfaces scaffolds that refer to option letters and
 * extracts case-study years/statistics for a subject review pass.
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'data', 'forge-data.js'), 'utf8');
const { BANKS, SUBJECTS } = new Function(`${source}\nreturn { BANKS, SUBJECTS };`)();
const questions = SUBJECTS['gcse-geo'].banks.flatMap((bankId) =>
  (BANKS[bankId]?.questions || []).map((question) => ({ ...question, bankId }))
);
const optionReferences = questions.filter((question) =>
  /\b(?:A|B|C|D)\s+(?:describes|correctly|is|means|refers|shows|gives|defines|was|were|are)\b/i.test(question.scaffold || '')
);
const yearCounts = new Map();
for (const question of questions) {
  for (const year of String(`${question.stem || ''} ${question.scaffold || ''}`).match(/\b(?:19|20)\d{2}\b/g) || []) {
    yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
  }
}
console.log(`GCSE Geography content review: ${questions.length} questions across ${SUBJECTS['gcse-geo'].banks.length} banks`);
console.log(`Scaffolds with explicit option-letter references: ${optionReferences.length}`);
for (const question of optionReferences) console.log(`  ${question.id} [${question.correct}] ${question.scaffold}`);
console.log('Case-study years by frequency: ' + [...yearCounts.entries()].sort((a, b) => b[1] - a[1]).map(([year, count]) => `${year}×${count}`).join(', '));
