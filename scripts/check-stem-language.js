#!/usr/bin/env node
// Fails when internal generation labels or formulaic question openings leak
// into the student-facing bank. A varied stem should stand alone without
// referring to an earlier card or practice set.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(root, 'data/forge-data.js'), 'utf8') +
    '\nthis.SUBJECTS = SUBJECTS; this.BANKS = BANKS;',
  sandbox
);

const { SUBJECTS, BANKS } = sandbox;
const forbidden = [
  /practice set\s*\d*/i,
  /second classroom example/i,
  /a separate scenario asks/i,
  /the following case asks/i,
  /now consider this case/i,
  /^which statement\b/i,
  /^which claim\b/i,
];
const hits = [];

for (const [subjectId, subject] of Object.entries(SUBJECTS)) {
  for (const bankId of subject.banks || []) {
    for (const question of BANKS[bankId]?.questions || []) {
      for (const [kind, item] of [['question', question], ['reforge', question.reforge]]) {
        const stem = String(item?.stem || '').trim();
        if (forbidden.some(pattern => pattern.test(stem))) {
          hits.push(`${subjectId}/${bankId}/${question.id}/${kind}: ${stem}`);
        }
      }
    }
  }
}

if (hits.length) {
  console.error(`Stem-language validation failed: ${hits.length} prohibited stem(s).`);
  hits.forEach(hit => console.error(`- ${hit}`));
  process.exit(1);
}

console.log('Stem-language validation passed: no internal wrappers or generic statement/claim openings found.');
