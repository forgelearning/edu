#!/usr/bin/env node
/* Class Mode is projected to the class: the board shows a question number and
   readable misconception labels, never internal ids (GCSE-HAZ-34) or raw tags. */
const assert = require('assert');
const fs = require('fs');
const src = fs.readFileSync('pages/app/present.html', 'utf8');
const present = src.slice(src.indexOf('function renderPresent()'), src.indexOf("document.addEventListener('keydown'"));
assert(!/'\+q\.id\+'/.test(present), 'the board does not print the question id');
assert(!/\(q\.tag\|\|''\)/.test(present), 'the reveal does not print the raw misconception tag');
assert(present.includes('window.resolveMCLabel(tag)'), 'the reveal uses the readable label');
assert(present.includes('ForgeQuestion.scaffoldText(q)'), 'placeholder explanations are made readable');
assert(src.includes('data/misconception-labels.js') && src.includes('scripts/forge-question.js'), 'Class Mode loads the label and explanation helpers');
console.log('Class Mode tests passed (no ids or raw tags on the board, readable labels and explanations).');
