#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(root, 'data', 'forge-data.js'), 'utf8') +
    '\nthis.BANKS = BANKS; this.SUBJECTS = SUBJECTS;',
  sandbox
);
vm.runInContext(
  fs.readFileSync(path.join(root, 'data', 'misconception-labels.js'), 'utf8') +
    '\nthis.MC_LABELS = MC_LABELS;',
  sandbox
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const expected = {
  'GCSE-GEO-HAZ': 30,
  'GCSE-GEO-BIOSPHERE': 23,
  'GCSE-GEO-DEV': 32
};

for (const [bankId, expectedTags] of Object.entries(expected)) {
  const questions = sandbox.BANKS[bankId].questions;
  const tags = new Set();
  const historicalGroups = new Set();
  for (const question of questions) {
    assert(question.tag && question.tag.startsWith('MC-GG-'), `${bankId}/${question.id}: missing diagnostic MC-GG tag`);
    assert(question.misconceptionGroup, `${bankId}/${question.id}: missing historical parent group`);
    assert(question.tag !== question.misconceptionGroup, `${bankId}/${question.id}: child tag did not become more specific`);
    assert(sandbox.MC_LABELS[question.tag], `${bankId}/${question.id}: no explicit teacher-facing label for ${question.tag}`);
    tags.add(question.tag);
    historicalGroups.add(question.misconceptionGroup);
  }
  assert(tags.size === expectedTags, `${bankId}: expected ${expectedTags} diagnostic tags, found ${tags.size}`);
  for (const group of historicalGroups) {
    assert(questions.some(question => question.misconceptionGroup === group && question.options && question.reforge),
      `${bankId}: historical group ${group} has no Anvil repair question`);
  }
}

const hazard = sandbox.BANKS['GCSE-GEO-HAZ'].questions;
const byId = Object.fromEntries(hazard.map(question => [question.id, question]));
assert(byId['GCSE-HAZ-33'].tag === 'MC-GG-HAZ-MAGMA-VISCOSITY-EXPLOSIVITY', 'volcano viscosity diagnosis regressed');
assert(byId['GCSE-HAZ-04'].tag === 'MC-GG-HAZ-PINATUBO-CLIMATE-EFFECT', 'Pinatubo diagnosis regressed');
assert(byId['GCSE-HAZ-05'].tag === 'MC-GG-HAZ-EYJAFJALLAJOKULL-PREPAREDNESS', 'Eyjafjallajokull diagnosis regressed');
assert(new Set([byId['GCSE-HAZ-33'].tag, byId['GCSE-HAZ-04'].tag, byId['GCSE-HAZ-05'].tag]).size === 3,
  'distinct volcano misconceptions were collapsed back into one tag');

console.log('GCSE Geography Year 9 diagnostic taxonomy validation passed.');
