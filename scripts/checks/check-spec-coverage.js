#!/usr/bin/env node
// Validate question-to-specification alignment.
//
// Usage:
//   node scripts/checks/check-spec-coverage.js              # all registered subjects
//   node scripts/checks/check-spec-coverage.js econ         # one subject

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..', '..');
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
    const bankHasSubjectPoint = (bank.questions || []).some(question => {
      const rawSpecs = [
        ...(Array.isArray(question.specPointIds) ? question.specPointIds : []),
        question.specPointId || question.spec || bankId
      ];
      return rawSpecs.map(resolve).some(item => item && item.point.subject === subjectKey);
    });
    if (!bankResolution && !bankHasSubjectPoint) {
      fail(`${subjectKey}/${bankId}`, 'bank id has no registered specification point');
    } else if (bankResolution && bankResolution.point.subject !== subjectKey && !bankHasSubjectPoint) {
      fail(`${subjectKey}/${bankId}`, `registry point belongs to ${bankResolution.point.subject}`);
    }

    for (const question of bank.questions || []) {
      const location = `${subjectKey}/${bankId}/${question.id || 'unnamed-question'}`;
      // Older Economics questions sometimes omit `spec` because their bank
      // already carried the topic identity. Resolve those through the bank
      // during the migration period, then report the point as covered.
      const rawSpecs = [
        ...(Array.isArray(question.specPointIds) ? question.specPointIds : []),
        question.specPointId || question.spec || bankId
      ];
      const resolutions = rawSpecs.map(resolve).filter(Boolean);
      const resolution = resolutions.find(item => item.point.subject === subjectKey) || resolutions[0];
      const hasSubjectResolution = resolutions.some(item => item.point.subject === subjectKey);
      if (!resolution) {
        fail(location, `unknown specification reference "${rawSpecs.join(', ')}"`);
        continue;
      }
      if (resolution.point.subject !== subjectKey) {
        fail(location, `specification point belongs to ${resolution.point.subject}`);
      }
      const isGeographyKeyIdea = subjectKey === 'geo' &&
        resolution.id.startsWith('edexcel-a-geo-') &&
        bankResolution?.id.startsWith('edexcel-a-geo-topic-');
      const isHistorySection = subjectKey === 'hist' &&
        resolution.id.startsWith('aqa-a-hist-') &&
        bankResolution?.id.startsWith('aqa-a-hist-');
      const isBusinessSection = subjectKey === 'bus' &&
        resolution.id.startsWith('edexcel-a-bus-') &&
        bankResolution?.id.startsWith('edexcel-a-bus-');
      const isChemistrySection = subjectKey === 'chem' &&
        resolution.id.startsWith('aqa-a-chem-') &&
        bankResolution?.id.startsWith('aqa-a-chem-');
      const isBiologySection = subjectKey === 'bio' &&
        resolution.id.startsWith('ocr-a-bio-') &&
        bankResolution?.id.startsWith('ocr-a-bio-');
      const isPhysicsSection = subjectKey === 'phys' &&
        resolution.id.startsWith('aqa-a-phys-') &&
        bankResolution?.id.startsWith('aqa-a-phys-');
      const isComputerScienceSection = subjectKey === 'cs' &&
        resolution.id.startsWith('eduqas-a-cs-') &&
        bankResolution?.id.startsWith('eduqas-a-cs-');
      const isMathematicsSection = subjectKey === 'maths' &&
        resolution.id.startsWith('edexcel-a-maths-') &&
        bankResolution?.id.startsWith('edexcel-a-maths-');
      const isFrenchSection = subjectKey === 'french' &&
        resolution.id.startsWith('edexcel-a-french-') &&
        bankResolution?.id.startsWith('edexcel-a-french-');
      const isGermanSection = subjectKey === 'german' &&
        resolution.id.startsWith('edexcel-a-german-') &&
        bankResolution?.id.startsWith('edexcel-a-german-');
      const isSpanishSection = subjectKey === 'span' &&
        resolution.id.startsWith('edexcel-a-spanish-') &&
        bankResolution?.id.startsWith('edexcel-a-spanish-');
      const isLawSection = subjectKey === 'law' &&
        resolution.id.startsWith('ocr-a-law-') &&
        bankResolution?.id.startsWith('ocr-a-law-');
      if (resolution.id !== bankResolution?.id && !hasSubjectResolution && !isGeographyKeyIdea && !isHistorySection && !isBusinessSection && !isChemistrySection && !isBiologySection && !isPhysicsSection && !isComputerScienceSection && !isMathematicsSection && !isFrenchSection && !isGermanSection && !isSpanishSection && !isLawSection) {
        fail(location, `question resolves to ${resolution.id}, but bank resolves to ${bankResolution?.id || 'none'}`);
      }
      counts.set(resolution.id, (counts.get(resolution.id) || 0) + 1);
    }
  }
}

for (const [pointId, point] of Object.entries(SPEC_REGISTRY.points)) {
  if (!subjects.includes(point.subject)) continue;
  // Geography keeps broad legacy topic aliases for bank-level navigation,
  // while questions now resolve to the numbered Edexcel key ideas. Do not
  // report those compatibility aliases as uncovered specification points.
  if (point.subject === 'geo' && pointId.includes('-topic-')) continue;
  const count = counts.get(pointId) || 0;
  const exclusion = SPEC_REGISTRY.routeExclusions?.[pointId];
  if (!count && exclusion) {
    console.log(`${point.subject}\t${point.paper}\t${point.code}\t${point.title}\t0 questions\tROUTE EXCLUDED — ${exclusion.reason}`);
    continue;
  }
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
