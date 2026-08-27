#!/usr/bin/env node
'use strict';
/*
 * Pins each spec point to the exam paper it is actually assessed in.
 *
 * The bank cards in forge-quiz.html print "<code> · <paper>" straight from
 * SPEC_REGISTRY, so a wrong value here sends a student revising for one paper
 * to the wrong topics. Nothing else in the suite looks at the field: the
 * coverage audit checks that every point is covered, not that it is labelled
 * correctly, so seven of GCSE Geography's fourteen points sat wrong until they
 * were spotted by eye in the staging harness on 2026-08-27 (UKLAND and both
 * fieldwork banks, plus all three Paper 3 topics).
 *
 * Only specifications with an entry below are checked. Adding one is the point
 * of the file, so extend EXPECTED when a subject's paper structure is
 * confirmed against the board's specification — not from memory.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', '..', 'data', 'spec-registry.js');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(SRC, 'utf8') + ';window.__REGISTRY = SPEC_REGISTRY;', context);
const registry = context.window.__REGISTRY;

// Edexcel GCSE Geography B (1GB0):
//   Paper 1 Global Geographical Issues
//   Paper 2 UK Geographical Issues — includes BOTH fieldwork enquiries
//   Paper 3 People and Environment Issues — includes the decision-making exercise
// Geographical skills are assessed across all three papers; the bank is grouped
// with Paper 3 because that is where the decision-making exercise needs them.
const EXPECTED = {
  'gcse-geo': {
    HAZ: 'Paper 1', DEV: 'Paper 1', IND: 'Paper 1', URB: 'Paper 1',
    UKLAND: 'Paper 2', UKHUMAN: 'Paper 2', ENQ: 'Paper 2', RVF: 'Paper 2', URF: 'Paper 2',
    BIO: 'Paper 3', FOR: 'Paper 3', ENE: 'Paper 3', DEC: 'Paper 3', SKILLS: 'Paper 3'
  }
};

const problems = [];
let checked = 0;

for (const [subject, expectedPapers] of Object.entries(EXPECTED)) {
  const points = Object.entries(registry.points).filter(([, p]) => p.subject === subject);
  for (const [code, expected] of Object.entries(expectedPapers)) {
    const match = points.find(([, p]) => p.code === code);
    if (!match) {
      problems.push(`${subject}: no spec point with code "${code}" — was it renamed or removed?`);
      continue;
    }
    checked++;
    const [id, point] = match;
    if (point.paper !== expected) {
      problems.push(`${subject}/${code}: paper is "${point.paper}", expected "${expected}" (${id})`);
    }
  }
  // A point the table does not mention is unpinned, and would drift unnoticed.
  for (const [, point] of points) {
    if (!(point.code in expectedPapers)) {
      problems.push(`${subject}/${point.code}: not listed in EXPECTED — add it, with the paper confirmed against the specification`);
    }
  }
}

if (problems.length) {
  console.error(`Paper mapping check failed (${problems.length}):\n`);
  problems.forEach((p) => console.error('  ' + p));
  console.error(
    '\nThese labels appear on the bank cards a student picks from, so a wrong\n' +
    'paper steers revision at the wrong topics. Correct the paper field in\n' +
    'data/spec-registry.js, or update EXPECTED here if the specification changed.'
  );
  process.exit(1);
}

console.log(`paper mapping: ${checked} spec points match their specification paper`);
