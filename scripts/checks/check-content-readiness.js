#!/usr/bin/env node
// Content readiness guardrail for marketing pages and the canonical bank.
// This deliberately reports honest coverage tiers; it never treats a page
// with a single bank or a sample-only page as a full product surface.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { repoRoot, listPageFiles, pageFile } = require('../support/page-files');

const root = repoRoot;
const statusPath = path.join(root, 'data/content-status.json');
const data = {};
vm.createContext(data);
vm.runInContext(fs.readFileSync(path.join(root, 'data/forge-data.js'), 'utf8') + '\nthis.SUBJECTS=SUBJECTS;this.BANKS=BANKS;', data);
const registry = {};
vm.createContext(registry);
vm.runInContext(fs.readFileSync(path.join(root, 'data/spec-registry.js'), 'utf8') + '\nthis.SPEC_REGISTRY=SPEC_REGISTRY;', registry);

const subjectPages = listPageFiles().filter(file => /^(a-level-|gcse-|economics|psychology|law|politics|criminology)/.test(path.basename(file)));
const missing = subjectPages.filter(file => {
  const html = fs.readFileSync(file, 'utf8');
  return !html.includes('css/content-status.css') || !html.includes('scripts/forge-content-status.js');
});
if (missing.length) {
  console.error(`Missing content-status rollout on: ${missing.join(', ')}`);
  process.exit(1);
}

const aliases = registry.SPEC_REGISTRY.aliases || {};
const points = registry.SPEC_REGISTRY.points || {};
function resolve(id) { const pointId = aliases[id] || id; return points[pointId] ? pointId : null; }

let totalQuestions = 0;
let totalBanks = 0;
const tiers = { full: 0, developing: 0, pilot: 0, preview: 0 };
for (const [key, subject] of Object.entries(data.SUBJECTS)) {
  const banks = (subject.banks || []).map(id => data.BANKS[id]).filter(Boolean);
  const questions = banks.reduce((sum, bank) => sum + (bank.questions || []).length, 0);
  const mappedPoints = new Set();
  (subject.banks || []).forEach(bankId => {
    const bank = data.BANKS[bankId];
    (bank.questions || []).forEach(question => {
    const refs = [...(question.specPointIds || []), question.specPointId || question.spec || bankId];
    refs.map(resolve).filter(Boolean).forEach(id => mappedPoints.add(id));
    });
  });
  const activePoints = Object.entries(points).filter(([id, point]) => point.subject === key && !(registry.SPEC_REGISTRY.routeExclusions || {})[id]);
  const coverage = activePoints.length ? Math.min(100, Math.round(mappedPoints.size / activePoints.length * 100)) : 100;
  const tier = questions >= 200 && banks.length >= 2 && coverage >= 80 ? 'full' : questions >= 80 && coverage >= 50 ? 'developing' : questions ? 'pilot' : 'preview';
  tiers[tier]++;
  totalQuestions += questions;
  totalBanks += banks.length;
  console.log(`${key}\t${tier}\t${questions} questions\t${banks.length} banks\t${coverage}% mapped specification points`);
}
console.log(`\n${Object.keys(data.SUBJECTS).length} canonical subjects; ${totalQuestions} questions across ${totalBanks} banks.`);
console.log(`Coverage tiers: ${JSON.stringify(tiers)}`);
console.log(`Marketing rollout checked: ${subjectPages.length} pages.`);

if (!fs.existsSync(statusPath)) {
  console.error('Missing data/content-status.json. Run node scripts/build/build-content-status.js.');
  process.exit(1);
}
const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
for (const [page, key] of Object.entries(status.pages || {})) {
  try { pageFile(page); } catch {
    console.error(`Content status references missing marketing page: ${page}`);
    process.exit(1);
  }
  if (!status.subjects[key]) {
    console.error(`Content status page mapping references missing subject: ${key}`);
    process.exit(1);
  }
}
for (const [key, subject] of Object.entries(status.subjects || {})) {
  if (!data.SUBJECTS[key]) {
    console.error(`Content status references missing canonical subject: ${key}`);
    process.exit(1);
  }
  const banks = (data.SUBJECTS[key].banks || []).map(id => data.BANKS[id]).filter(Boolean);
  const questions = banks.reduce((sum, bank) => sum + (bank.questions || []).length, 0);
  if (subject.questions !== questions || subject.banks !== banks.length) {
    console.error(`Stale content status for ${key}. Run node scripts/build/build-content-status.js.`);
    process.exit(1);
  }
}
console.log('Browser content status contract is current.');
