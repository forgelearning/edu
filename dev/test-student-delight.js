#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const values=new Map();
const context={localStorage:{getItem:key=>values.get(key)||null}};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('scripts/forge-student-delight.js','utf8'),context);
const delight=context.ForgeStudentDelight;
const history=[
  {bank:'geo',question_id:'one',is_correct:true,created_at:'2026-09-01T09:00:00Z'},
  {bank:'geo',question_id:'two',is_correct:true,created_at:'2026-09-01T10:00:00Z'},
  {bank:'geo',question_id:'two-RF',is_correct:true,reforge_attempted:true,created_at:'2026-09-02T09:00:00Z'},
  {bank:'geo',question_id:'three',is_correct:false,created_at:'2026-09-02T10:00:00Z'},
  {bank:'geo',question_id:'four',is_correct:true,created_at:'2026-09-03T09:00:00Z'},
  {bank:'geo',question_id:'five',is_correct:true,created_at:'2026-09-04T09:00:00Z'},
  {bank:'econ',question_id:'other',is_correct:true,created_at:'2026-09-05T09:00:00Z'}
];
const progress=delight.topicProgress(history,'geo');
assert.equal(progress.marks,3,'three correct days fill three marks');
assert.equal(progress.visits,3,'same-day answers and repaired twins do not count as another visit');
assert.equal(progress.lastQuestionId,'five','detail names the latest correctly answered question');
assert.equal(delight.topicProgress(history,'econ').marks,1,'topics are independent');
assert.equal(delight.nextReturn('student','geo'),null,'no review date is invented');
values.set('forge-revision:student',JSON.stringify({reviews:{'geo|one':{dueAt:'2026-12-01T12:00:00Z'},'geo|two':{dueAt:'2026-11-01T12:00:00Z'},'econ|other':{dueAt:'2026-10-01T12:00:00Z'}}}));
assert.equal(delight.nextReturn('student','geo'),Date.parse('2026-11-01T12:00:00Z'),'earliest scheduled return is used for the topic');
assert(delight.motif('gcse-geo').includes('forge-subject-motif--geo'));
assert(delight.motif('gcse-econ').includes('forge-subject-motif--econ'));
console.log('Student delight tests passed (earned topic marks, factual return dates, subject motifs).');
