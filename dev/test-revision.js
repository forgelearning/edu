#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const stored = {};
const window = {
  SUBJECTS: {
    'gcse-geo': { label: 'GCSE Geography', banks: ['GCSE-GEO-HAZ', 'GCSE-GEO-BIOSPHERE', 'GCSE-GEO-DEV'] },
    'alevel-econ': { label: 'A Level Economics', banks: ['ECON-1.1'] }
  },
  BANKS: {
    'GCSE-GEO-HAZ': { questionCount: 12, questions: [] },
    'GCSE-GEO-BIOSPHERE': { questionCount: 10, questions: [] },
    'GCSE-GEO-DEV': { questionCount: 9, questions: [] },
    'ECON-1.1': { label: 'Supply and Demand', questionCount: 20, questions: [] }
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
assert.strictEqual(revision.assignmentProgress(assignment, { assignments: { 'r-1': { answered: Array.from({length:10}, (_,i) => 'card-'+i), complete: false } }, reviews: {} }).complete, true);

const saved = { reviews: {}, assignments: { 'r-1': { answered: ['a', 'b'], complete: false } } };
window.localStorage.setItem('forge-revision:student-1', JSON.stringify(saved));
assert.strictEqual(revision.readState({ studentId: 'student-1' }).assignments['r-1'].answered.length, 2);
assert.deepStrictEqual(Array.from(revision.readState({ studentId: 'student-1' }).personalCards), []);

const own = revision.cleanPersonalCard({ front: '  What causes earthquakes? ', back: ' Plates move. ', bank: 'GCSE-GEO-HAZ', source: 'Forge question 1' });
assert.strictEqual(own.front, 'What causes earthquakes?');
assert.strictEqual(own.back, 'Plates move.');
assert.strictEqual(revision.personalAsReview(own).key, 'personal|' + own.id);
assert.strictEqual(revision.personalAsReview(own).question.options.answer, 'Plates move.');
assert(!revision.hintHtml({scaffold:'The correct answer is plates move.'}).includes('plates move'),'pre-answer help does not expose the full explanation');
assert.strictEqual(revision.hintHtml({hint:'Think about plate boundaries.',scaffold:'Full explanation.'}),'Think about plate boundaries.');
// Help me start is built from the card's own answer, never the whole of it.
const longHint = revision.hintHtml({options:{A:'Ice cores — trapped air and dust record past conditions'},correct:'A'});
assert(longHint.includes('I__  c____  —  t______  a__  a__  …'),'a long answer shows the letter shape of its first six words: '+longHint);
assert(!/Ice|cores|trapped/.test(longHint),'a long answer hint does not name the key term');
const shortHint = revision.hintHtml({options:{A:'Methane from livestock'},correct:'A'});
assert(shortHint.includes('M______  f___  l________'),'a short answer shows first letters and lengths: '+shortHint);
assert(!/Methane|livestock/.test(shortHint),'a short answer hint does not reveal a word');
assert(/Start with one fact/.test(revision.hintHtml({options:{A:'9/8'},correct:'A'})),'numeric answers keep the general prompt');
assert(/Start with one fact/.test(revision.hintHtml({options:{A:'了'},correct:'A'})),'character answers keep the general prompt');
assert(!revision.hintHtml({options:{A:'<b>Plate</b> tectonics'},correct:'A'}).includes('<b>'),'answer text is escaped');
assert.throws(() => revision.cleanPersonalCard({front:'',back:'answer'}), /Add a question/);
assert.throws(() => revision.cleanPersonalCard({front:'x',back:'a'.repeat(2001)}), /2,000/);
const edited = revision.cleanPersonalCard({front:'New front',back:'New back',bank:'GCSE-GEO-HAZ'}, own);
assert.strictEqual(edited.id, own.id);
assert.strictEqual(edited.source, 'Forge question 1');

const teacherPanel = revision.teacherPanelHtml('gcse-geo');
assert(teacherPanel.includes('GCSE Geography'));
assert(teacherPanel.includes('Shared progress appears in the Revision tab'));
assert(revision.teacherPanelHtml('alevel-econ').includes('Supply and Demand'));
assert.strictEqual(revision.teacherPanelHtml('unknown'), '');

const scheduled = [
  {id:'scheduled-1',front:'First saved question?',back:'First answer',bank:'ECON-1.1'},
  {id:'scheduled-2',front:'Second saved question?',back:'Second answer',bank:'ECON-1.1'}
];
window.localStorage.setItem('forge-revision:scheduled-student', JSON.stringify({
  assignments:{},personalCards:scheduled,reviews:Object.fromEntries(scheduled.map(card => [
    'personal|'+card.id,{lastRating:'got-it',dueAt:'2099-01-01T00:00:00.000Z',secureReviews:1}
  ]))
}));
const listeners = {};
const app = {
  innerHTML:'',
  querySelector(){return null;},
  addEventListener(name,handler){listeners[name]=handler;}
};
revision.mountStudent({root:app,context:{studentId:'scheduled-student'},subject:'alevel-econ',assignments:[]});
assert(app.innerHTML.includes('2 saved</span><span>0 ready today'));
assert(app.innerHTML.includes('data-revision-action="my-cards">Review my cards</button>'));
listeners.click({target:{closest(selector){return selector==='[data-revision-action]'?{getAttribute(){return 'my-cards';}}:null;}}});
assert(app.innerHTML.includes('Card 1 of 2'));
assert(app.innerHTML.includes('First saved question?') || app.innerHTML.includes('Second saved question?'));

console.log('All-subject revision and personal card tests passed.');
