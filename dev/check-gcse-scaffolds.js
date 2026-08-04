#!/usr/bin/env node
// Quality gate for the GCSE History/Psychology scaffold review. The runtime
// renderer supplies a teaching fallback for the remaining authoring
// placeholders; this report keeps the source backlog visible as content is
// replaced with subject-specific explanations.
const fs = require('fs');
const vm = require('vm');
const root = require('path').join(__dirname, '..');
const context = { console, Math, Date };
vm.createContext(context);
vm.runInContext(fs.readFileSync(root + '/data/forge-data.js', 'utf8') + '\nthis.BANKS=BANKS;this.SUBJECTS=SUBJECTS;', context);

const subjects = ['gcse-hist', 'gcse-psych'];
let total = 0;
let placeholders = 0;
let short = 0;
for (const subject of subjects) {
  for (const bankId of context.SUBJECTS[subject].banks) {
    for (const q of context.BANKS[bankId].questions) {
      if (!q.options) continue;
      total++;
      if (/^This tests the specified .+ knowledge point:/i.test(q.scaffold || '')) placeholders++;
      if (String(q.scaffold || '').trim().length < 100) short++;
    }
  }
}
console.log(`GCSE scaffold review: ${total} MCQs, ${placeholders} placeholder-style, ${short} short (<100 chars).`);
console.log('Placeholder-style feedback is expanded by scripts/forge-question.js until each item receives a subject-specific rewrite.');
