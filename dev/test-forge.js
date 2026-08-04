#!/usr/bin/env node
// Lightweight regression suite for the static Forge contract. This stays
// dependency-free so it can run in CI and before publishing the site.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const context = { console, Math, Date };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data/forge-data.js'), 'utf8') + '\nthis.SUBJECTS=SUBJECTS;this.BANKS=BANKS;', context);

assert(context.SUBJECTS.mand, 'IB Mandarin subject must remain available');
assert(!context.SUBJECTS.mandarin, 'duplicate zero-bank Mandarin subject must be removed');

let mcqs = 0;
for (const subject of Object.values(context.SUBJECTS)) {
  for (const bankId of subject.banks || []) {
    const bank = context.BANKS[bankId];
    assert(bank, `missing bank ${bankId}`);
    for (const question of bank.questions || []) {
      if (!question.options || !question.correct) continue;
      mcqs++;
      assert(question.reforge && question.reforge.options, `${question.id} missing Reforge`);
      const normalise = options => Object.values(options).map(String).sort().join('\u001f');
      assert(normalise(question.options) !== normalise(question.reforge.options), `${question.id} has a copied Reforge option set`);
    }
  }
}
assert(mcqs > 7000, `unexpectedly low MCQ count: ${mcqs}`);

console.log(`Forge regression tests passed (${mcqs} MCQs checked).`);
