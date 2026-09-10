#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const stored = {};
const window = {
  BANKS: {
    'GCSE-GEO-HAZ': { questionCount: 12, questions: [] },
    'GCSE-GEO-BIOSPHERE': { questionCount: 10, questions: [] },
    'GCSE-GEO-DEV': { questionCount: 9, questions: [] }
  },
  localStorage: {
    getItem(key) { return Object.prototype.hasOwnProperty.call(stored, key) ? stored[key] : null; },
    setItem(key, value) { stored[key] = String(value); }
  },
  Intl,
  Date,
  Promise,
  Math,
  JSON,
  Object,
  Array,
  String,
  parseInt,
  setTimeout() {}
};
window.window = window;
vm.createContext(window);
vm.runInContext(fs.readFileSync('scripts/forge-revision.js', 'utf8'), window);

const revision = window.ForgeRevision;
const assignment = { id: 'r-1', banks: JSON.stringify(['GCSE-GEO-HAZ', '__FORGE_REVISION_10__']) };

assert.deepStrictEqual(Array.from(revision.banks(assignment)), ['GCSE-GEO-HAZ']);
assert.strictEqual(revision.config(assignment).mode, 'count');
assert.strictEqual(revision.config(assignment).target, 10);
assert.strictEqual(revision.config({ banks: ['GCSE-GEO-HAZ', revision.markerFor('due')] }).mode, 'due');
assert.strictEqual(revision.isRevision({ banks: ['GCSE-GEO-HAZ'] }), false);
assert.strictEqual(revision.assignmentProgress(assignment, { assignments: {}, reviews: {} }).answered, 0);

const saved = { reviews: {}, assignments: { 'r-1': { answered: ['a', 'b'], complete: false } } };
window.localStorage.setItem('forge-revision:student-1', JSON.stringify(saved));
assert.strictEqual(revision.readState({ studentId: 'student-1' }).assignments['r-1'].answered.length, 2);

const teacherPanel = revision.teacherPanelHtml('gcse-geo');
assert(teacherPanel.includes('Year 10 Geography pilot'));
assert(teacherPanel.includes('Shared progress appears in the Revision tab'));
assert.strictEqual(revision.teacherPanelHtml('alevel-econ'), '');

console.log('Revision pilot tests passed (11 assertions).');
