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

// Hazardous Earth was split into two assignable banks on 2026-09-07, so its 30
// diagnostic tags now sit 14 in the tectonics half and 16 in the climate half.
// The totals below are asserted separately, and the split itself is checked at
// the end of this file.
const expected = {
  'GCSE-GEO-HAZ': 14,
  'GCSE-GEO-CLIMATE': 16,
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

// The three volcano questions are deliberately split across the two halves:
// Pinatubo sits with climate because Edexcel treats volcanic aerosols as a
// natural cause of climate change, not as volcano content. Look them up across
// both banks so the assertions below survive that.
const hazard = sandbox.BANKS['GCSE-GEO-HAZ'].questions;
const climate = sandbox.BANKS['GCSE-GEO-CLIMATE'].questions;
const byId = Object.fromEntries(hazard.concat(climate).map(question => [question.id, question]));
assert(byId['GCSE-HAZ-33'].tag === 'MC-GG-HAZ-MAGMA-VISCOSITY-EXPLOSIVITY', 'volcano viscosity diagnosis regressed');
assert(byId['GCSE-HAZ-04'].tag === 'MC-GG-HAZ-PINATUBO-CLIMATE-EFFECT', 'Pinatubo diagnosis regressed');
assert(byId['GCSE-HAZ-05'].tag === 'MC-GG-HAZ-EYJAFJALLAJOKULL-PREPAREDNESS', 'Eyjafjallajokull diagnosis regressed');
assert(new Set([byId['GCSE-HAZ-33'].tag, byId['GCSE-HAZ-04'].tag, byId['GCSE-HAZ-05'].tag]).size === 3,
  'distinct volcano misconceptions were collapsed back into one tag');

// The split moves questions between banks at the very end of forge-data.js. A
// dropped or duplicated id there would be invisible to the audit — both banks
// would still be internally well-formed — so pin the totals and the partition.
assert(hazard.length === 35, `Hazardous Earth tectonics: expected 35 questions, found ${hazard.length}`);
assert(climate.length === 34, `Hazardous Earth climate: expected 34 questions, found ${climate.length}`);
const hazardIds = new Set(hazard.map(question => question.id));
const overlap = climate.filter(question => hazardIds.has(question.id));
assert(overlap.length === 0, `a question is in both halves: ${overlap.map(q => q.id).join(', ')}`);
const splitTags = new Set(hazard.concat(climate).map(question => question.tag));
assert(splitTags.size === 30, `the split lost a diagnostic tag: expected 30 across both halves, found ${splitTags.size}`);
assert(climate.every(question => question.specPointId === 'edexcel-gcse-geo-climate'),
  'a climate question still carries the tectonics spec point, so its card would show the wrong topic');
assert(sandbox.SUBJECTS['gcse-geo'].banks.includes('GCSE-GEO-CLIMATE'),
  'the climate bank is not registered on the subject, so it cannot be assigned');

console.log('GCSE Geography Year 9 diagnostic taxonomy validation passed.');
