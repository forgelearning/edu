#!/usr/bin/env node
// Detect question banks that have become formulaic.
// Usage: node scripts/checks/check-stem-diversity.js [subject-key]

const fs = require('fs');
const vm = require('vm');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync('data/forge-data.js', 'utf8') +
    '\nthis.SUBJECTS = SUBJECTS; this.BANKS = BANKS;',
  sandbox
);

const requested = process.argv.slice(2);
const subjects = requested.length ? requested : Object.keys(sandbox.SUBJECTS);
const issues = [];
const rows = [];

function clean(stem) {
  return String(stem || '').trim().replace(/\s+/g, ' ');
}

function opening(stem) {
  return clean(stem).split(/\s+/).slice(0, 7).join(' ').toLowerCase();
}

function inspect(label, items) {
  const counts = new Map();
  items.forEach(item => {
    const key = opening(item.stem);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const total = items.length;
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0];
  const share = total ? top[1] / total : 0;
  rows.push({label, total, top: top[0], count: top[1], share});

  // A repeated opening is acceptable for a small bank, but not as the
  // dominant voice of a subject. This catches the exact Politics/History
  // failure and the generated coverage frames without banning normal forms.
  if (total >= 20 && share > 0.25) {
    issues.push(`${label}: opening "${top[0]}" is ${Math.round(share * 100)}% of stems (${top[1]}/${total})`);
  }
  if (total >= 20 && /^which statement best explains/.test(top[0]) && share > 0.10) {
    issues.push(`${label}: "Which statement best explains" is ${Math.round(share * 100)}% of stems`);
  }
}

for (const subjectKey of subjects) {
  const subject = sandbox.SUBJECTS[subjectKey];
  if (!subject) {
    issues.push(`${subjectKey}: subject not found`);
    continue;
  }
  const subjectQuestions = [];
  for (const bankId of subject.banks || []) {
    const bank = sandbox.BANKS[bankId];
    if (!bank) continue;
    const questions = bank.questions || [];
    inspect(`${subjectKey}/${bankId}/questions`, questions);
    inspect(`${subjectKey}/${bankId}/reforges`, questions.filter(q => q.reforge).map(q => q.reforge));
    subjectQuestions.push(...questions);
  }
  inspect(`${subjectKey}/questions`, subjectQuestions);
  inspect(`${subjectKey}/reforges`, subjectQuestions.filter(q => q.reforge).map(q => q.reforge));
}

for (const row of rows) {
  if (row.total >= 20) {
    console.log(`${row.label}\t${row.total}\ttop=${Math.round(row.share * 100)}%\t${row.top}`);
  }
}

if (issues.length) {
  console.log(`\nDiversity issues (${issues.length}):`);
  issues.forEach(issue => console.log(`FAIL  ${issue}`));
  process.exit(1);
}

console.log(`\nStem diversity validation passed for ${subjects.length} subject(s).`);
