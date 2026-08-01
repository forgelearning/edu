#!/usr/bin/env node
// Checks marketing/teaser pages' hand-written "N questions · N banks" claims
// against the canonical data in data/forge-data.js, so stale counts (like
// economics.html once claiming 125 questions when the real total was 119)
// get caught automatically instead of found by accident.
//
// Run: node scripts/check-subject-counts.js
// Exits non-zero if any page disagrees with the canonical data.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

const sandbox = {};
vm.createContext(sandbox);
const dataSrc = fs.readFileSync(path.join(root, 'data/forge-data.js'), 'utf8');
vm.runInContext(dataSrc + '\nthis.SUBJECTS = SUBJECTS; this.BANKS = BANKS;', sandbox);
const { SUBJECTS, BANKS } = sandbox;

function realCounts(key) {
  const s = SUBJECTS[key];
  if (!s) return null;
  const banks = s.banks.length;
  const questions = s.banks.reduce((sum, b) => sum + (BANKS[b] && BANKS[b].questions ? BANKS[b].questions.length : 0), 0);
  return { banks, questions };
}

// Pages that state a top-line "N questions · N banks" figure for a single subject.
// Add an entry here whenever a new subject teaser page is built.
const PAGES = [
  { file: 'economics.html', key: 'econ' },
  { file: 'psychology.html', key: 'psych' },
  { file: 'a-level-sociology.html', key: 'soc' },
  { file: 'gcse-geography.html', key: 'gcse-geo' },
  { file: 'gcse-economics.html', key: 'gcse-econ' },
  { file: 'gcse-history.html', key: 'gcse-hist' },
  { file: 'gcse-psychology.html', key: 'gcse-psych' },
];

let problems = 0;

for (const { file, key } of PAGES) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP  ${file} — file not found`);
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  const match = html.match(/subj-stat-n[^>]*>(\d+)<\/span>\s*questions\s*·\s*(\d+)\s*banks?/i);
  if (!match) {
    console.log(`SKIP  ${file} — no "N questions · N banks" stat found (page structure may have changed)`);
    continue;
  }
  const stated = { questions: parseInt(match[1], 10), banks: parseInt(match[2], 10) };
  const real = realCounts(key);
  if (!real) {
    console.log(`SKIP  ${file} — no SUBJECTS["${key}"] entry in data/forge-data.js`);
    continue;
  }
  if (stated.questions !== real.questions || stated.banks !== real.banks) {
    problems++;
    console.log(`STALE ${file}: page says ${stated.questions}q/${stated.banks}b, data/forge-data.js says ${real.questions}q/${real.banks}b`);
  } else {
    console.log(`OK    ${file}: ${real.questions}q/${real.banks}b`);
  }
}

if (problems > 0) {
  console.log(`\n${problems} page(s) have stale subject counts. Update the page copy to match data/forge-data.js.`);
  process.exit(1);
} else {
  console.log('\nAll checked pages match data/forge-data.js.');
}
