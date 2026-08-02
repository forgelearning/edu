#!/usr/bin/env node
// Build the browser-readable content contract from the canonical question and
// specification registries. Marketing pages consume this file; they do not
// infer readiness from hand-written copy.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const data = {};
vm.createContext(data);
vm.runInContext(fs.readFileSync(path.join(root, 'data/forge-data.js'), 'utf8') + '\nthis.SUBJECTS=SUBJECTS;this.BANKS=BANKS;', data);
const registry = {};
vm.createContext(registry);
vm.runInContext(fs.readFileSync(path.join(root, 'data/spec-registry.js'), 'utf8') + '\nthis.SPEC_REGISTRY=SPEC_REGISTRY;', registry);

const aliases = registry.SPEC_REGISTRY.aliases || {};
const points = registry.SPEC_REGISTRY.points || {};
const exclusions = registry.SPEC_REGISTRY.routeExclusions || {};
function resolve(id) { const pointId = aliases[id] || id; return points[pointId] ? pointId : null; }

const pages = {
  'economics.html':'econ', 'psychology.html':'psych', 'law.html':'law', 'politics.html':'pol', 'criminology.html':'crim',
  'a-level-sociology.html':'soc', 'a-level-geography.html':'geo', 'a-level-business.html':'bus', 'a-level-chemistry.html':'chem',
  'a-level-biology.html':'bio', 'a-level-history.html':'hist', 'a-level-physics.html':'phys', 'a-level-maths.html':'maths',
  'a-level-german.html':'german', 'a-level-french.html':'french', 'a-level-spanish.html':'span', 'a-level-mandarin.html':'mand',
  'a-level-media.html':'media', 'a-level-pe.html':'pe', 'a-level-religious-studies.html':'rs', 'a-level-health-social-care.html':'hsc',
  'a-level-computer-science.html':'cs', 'a-level-english-literature.html':'englit', 'a-level-english-language-literature.html':'engll',
  'gcse-geography.html':'gcse-geo', 'gcse-economics.html':'gcse-econ', 'gcse-psychology.html':'gcse-psych', 'gcse-history.html':'gcse-hist',
  'gcse-science.html':'gcse-science', 'gcse-maths.html':'gcse-maths', 'gcse-chemistry.html':'gcse-sep-chem', 'gcse-physics.html':'gcse-sep-phys',
  'gcse-biology.html':'gcse-sep-bio'
};

const subjects = {};
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
  const activePoints = Object.entries(points).filter(([id, point]) => point.subject === key && !exclusions[id]);
  const coverage = activePoints.length ? Math.min(100, Math.round(mappedPoints.size / activePoints.length * 100)) : 100;
  const tier = questions >= 200 && banks.length >= 2 && coverage >= 80 ? 'full' : questions >= 80 && coverage >= 50 ? 'developing' : questions ? 'pilot' : 'preview';
  subjects[key] = { tier, questions, banks: banks.length, coverage };
}

const output = { version: 1, generatedAt: new Date().toISOString(), pages, subjects };
fs.writeFileSync(path.join(root, 'data/content-status.json'), JSON.stringify(output, null, 2) + '\n');
console.log(`Wrote content status for ${Object.keys(subjects).length} subjects and ${Object.keys(pages).length} marketing pages.`);
