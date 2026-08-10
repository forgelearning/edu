#!/usr/bin/env node
// Check the GCSE granular coverage layer.
// Every live GCSE question must have a topic tag and a Reforge variant;
// together these provide two distinct exposures for the tagged skill.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..', '..');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(root, 'data/forge-data.js'), 'utf8') +
    '\nthis.SUBJECTS = SUBJECTS; this.BANKS = BANKS;',
  sandbox
);

const errors = [];
let banksChecked = 0;
let questionsChecked = 0;
let tagsChecked = 0;
let exposuresChecked = 0;

for (const subjectKey of Object.keys(sandbox.SUBJECTS).filter(key => key.startsWith('gcse'))) {
  const subject = sandbox.SUBJECTS[subjectKey];
  for (const bankId of subject.banks || []) {
    const bank = sandbox.BANKS[bankId];
    banksChecked += 1;
    const tagCounts = new Map();
    for (const question of bank?.questions || []) {
      questionsChecked += 1;
      if (!question.tag) {
        errors.push(`${subjectKey}/${bankId}/${question.id}: missing granular topic tag`);
        continue;
      }
      if (question.options && (!question.reforge?.stem || !question.reforge?.options)) {
        errors.push(`${subjectKey}/${bankId}/${question.id}: missing Reforge variant`);
      }
      tagCounts.set(question.tag, (tagCounts.get(question.tag) || 0) + 1);
      exposuresChecked += 1 + (question.reforge?.stem ? 1 : 0);
    }
    tagsChecked += tagCounts.size;
    for (const [tag, count] of tagCounts) {
      if (count < 1) errors.push(`${subjectKey}/${bankId}/${tag}: no question exposure`);
    }
    console.log(`${subjectKey}\t${bankId}\t${bank?.questions?.length || 0} questions\t${tagCounts.size} tagged skills\t${[...tagCounts.values()].filter(count => count < 2).length} repeated source tags`);
  }
}

console.log(`\nChecked ${questionsChecked} questions across ${banksChecked} GCSE banks.`);
console.log(`Granular tags: ${tagsChecked}; question/Reforge exposures: ${exposuresChecked}.`);
if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.slice(0, 100).forEach(error => console.log(`FAIL  ${error}`));
  process.exit(1);
}
console.log('\nGCSE granular coverage validation passed.');
