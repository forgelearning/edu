#!/usr/bin/env node
// Validate question-to-specification alignment.
//
// Usage:
//   node scripts/check-spec-coverage.js              # all registered subjects
//   node scripts/check-spec-coverage.js econ         # one subject

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const dataSandbox = {};
vm.createContext(dataSandbox);
vm.runInContext(
  fs.readFileSync(path.join(root, 'data/forge-data.js'), 'utf8') +
    '\nthis.SUBJECTS = SUBJECTS; this.BANKS = BANKS;',
  dataSandbox
);

const registrySandbox = {};
vm.createContext(registrySandbox);
vm.runInContext(
  fs.readFileSync(path.join(root, 'data/spec-registry.js'), 'utf8') +
    '\nthis.SPEC_REGISTRY = SPEC_REGISTRY;',
  registrySandbox
);

const { SUBJECTS, BANKS } = dataSandbox;
const { SPEC_REGISTRY } = registrySandbox;
const requested = process.argv.slice(2);
const errors = [];
const warnings = [];
const counts = new Map();

function fail(where, message) {
  errors.push(`${where}: ${message}`);
}

function warn(where, message) {
  warnings.push(`${where}: ${message}`);
}

function resolve(alias) {
  if (!alias) return null;
  const pointId = SPEC_REGISTRY.aliases[alias] || alias;
  return SPEC_REGISTRY.points[pointId] ? { id: pointId, point: SPEC_REGISTRY.points[pointId] } : null;
}

const registeredSubjects = new Set(Object.values(SPEC_REGISTRY.points).map(point => point.subject));
const subjects = requested.length ? requested : [...registeredSubjects];

for (const subjectKey of subjects) {
  const subject = SUBJECTS[subjectKey];
  if (!subject) {
    fail(subjectKey, 'subject is not defined in data/forge-data.js');
    continue;
  }

  if (!registeredSubjects.has(subjectKey)) {
    warn(subjectKey, 'no specification points are registered yet');
    continue;
  }

  for (const bankId of subject.banks || []) {
    const bank = BANKS[bankId];
    if (!bank) {
      fail(`${subjectKey}/${bankId}`, 'bank is missing');
      continue;
    }

    const bankResolution = resolve(bankId);
    if (!bankResolution) {
      fail(`${subjectKey}/${bankId}`, 'bank id has no registered specification point');
    } else if (bankResolution.point.subject !== subjectKey) {
      fail(`${subjectKey}/${bankId}`, `registry point belongs to ${bankResolution.point.subject}`);
    }

    for (const question of bank.questions || []) {
      const location = `${subjectKey}/${bankId}/${question.id || 'unnamed-question'}`;
      // Older Economics questions sometimes omit `spec` because their bank
      // already carried the topic identity. Resolve those through the bank
      // during the migration period, then report the point as covered.
      const rawSpec = question.specPointId || question.spec || bankId;
      const resolution = resolve(rawSpec);
      if (!resolution) {
        fail(location, `unknown specification reference "${rawSpec || ''}"`);
        continue;
      }
      if (resolution.point.subject !== subjectKey) {
        fail(location, `specification point belongs to ${resolution.point.subject}`);
      }
      if (resolution.id !== bankResolution?.id) {
        fail(location, `question resolves to ${resolution.id}, but bank resolves to ${bankResolution?.id || 'none'}`);
      }
      counts.set(resolution.id, (counts.get(resolution.id) || 0) + 1);
    }
  }
}

for (const [pointId, point] of Object.entries(SPEC_REGISTRY.points)) {
  if (!subjects.includes(point.subject)) continue;
  const count = counts.get(pointId) || 0;
  if (!count) warn(pointId, `${point.code} ${point.title} has no mapped questions`);
  console.log(`${point.subject}\t${point.paper}\t${point.code}\t${point.title}\t${count} questions`);
}

console.log(`\nChecked ${subjects.length} subject(s) against ${Object.keys(SPEC_REGISTRY.points).length} registered specification points.`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach(message => console.log(`WARN  ${message}`));
}

if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.slice(0, 100).forEach(message => console.log(`FAIL  ${message}`));
  if (errors.length > 100) console.log(`FAIL  ...and ${errors.length - 100} more`);
  process.exit(1);
}

console.log('\nSpecification coverage validation passed.');
