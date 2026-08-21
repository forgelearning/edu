#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = { console, Math, Date };
vm.createContext(context);
vm.runInContext(fs.readFileSync('data/forge-data.js', 'utf8') + '\nthis.BANKS=BANKS;', context);

const questions = Object.values(context.BANKS).flatMap(bank => bank.questions || []);
const demand = questions.find(question => question.id === 'TH1-DEM-10');
assert(demand, 'TH1-DEM-10 must remain in the Economics bank');
assert.strictEqual(demand.options[demand.correct], 'A rise in household incomes');
const distractors = Object.entries(demand.options).filter(([letter]) => letter !== demand.correct).map(([, option]) => option);
assert(distractors.includes('A rise in the price of a complement'), 'the complement distractor must unambiguously shift demand left');
assert(!distractors.some(option => /fall in the price of a complement/i.test(option)), 'a demand-increasing complement-price fall cannot be marked wrong');

console.log('Semantic content tests passed (curated Economics ambiguity guardrails).');
