#!/usr/bin/env node
// Validates the canonical Forge question bank for structural mistakes that
// are hard to spot by hand: duplicate IDs, broken subject bank references,
// and malformed question shapes.
//
// Run: node scripts/check-question-bank.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const dataFile = path.join(root, 'data/forge-data.js');

const sandbox = {};
vm.createContext(sandbox);
const dataSrc = fs.readFileSync(dataFile, 'utf8');
vm.runInContext(dataSrc + '\nthis.SUBJECTS = SUBJECTS; this.BANKS = BANKS;', sandbox);

const { SUBJECTS, BANKS } = sandbox;
const VALID_OPTIONS = ['A', 'B', 'C', 'D'];

const errors = [];
const warnings = [];
const advisories = {
  missingSpec: 0,
  missingTag: 0,
};
const questionIds = new Map();
const referencedBanks = new Set();
const stats = {
  banks: 0,
  questions: 0,
  types: {},
  correct: { A: 0, B: 0, C: 0, D: 0 },
};

function location(subjectKey, bankKey, questionId) {
  return [subjectKey, bankKey, questionId].filter(Boolean).join(' / ');
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function fail(where, message) {
  errors.push(`${where}: ${message}`);
}

function warn(where, message) {
  warnings.push(`${where}: ${message}`);
}

function validateOptions(where, options, correct) {
  if (!isObject(options)) {
    fail(where, 'missing options object');
    return;
  }

  for (const key of VALID_OPTIONS) {
    if (!isNonEmptyString(options[key])) fail(where, `missing option ${key}`);
  }

  if (!VALID_OPTIONS.includes(correct)) {
    fail(where, `invalid correct option "${correct}"`);
  }
}

function validateReforge(where, reforge) {
  if (reforge == null) return;
  if (!isObject(reforge)) {
    fail(where, 'reforge must be an object when present');
    return;
  }
  if (!isNonEmptyString(reforge.stem)) fail(where, 'reforge missing stem');
  validateOptions(where, reforge.options, reforge.correct);
}

function validateQuestion(subjectKey, bankKey, question, index) {
  const questionId = question && question.id;
  const where = location(subjectKey, bankKey, questionId || `question #${index + 1}`);

  if (!isObject(question)) {
    fail(where, 'question must be an object');
    return;
  }

  if (!isNonEmptyString(questionId)) {
    fail(where, 'missing id');
  } else {
    const seen = questionIds.get(questionId) || [];
    seen.push(location(subjectKey, bankKey));
    questionIds.set(questionId, seen);
  }

  if (!isNonEmptyString(question.stem)) fail(where, 'missing stem');
  if (!isNonEmptyString(question.scaffold)) fail(where, 'missing scaffold');
  if (!question.spec && !question.specPointId) advisories.missingSpec += 1;
  if (!question.tag) advisories.missingTag += 1;

  const type = question.type || 'mcq';
  stats.questions += 1;
  stats.types[type] = (stats.types[type] || 0) + 1;

  if (type === 'mcq') {
    validateOptions(where, question.options, question.correct);
    if (VALID_OPTIONS.includes(question.correct)) stats.correct[question.correct] += 1;
  } else if (type === 'short_answer') {
    if (!isNonEmptyString(question.model_answer)) fail(where, 'short_answer missing model_answer');
  } else if (type === 'extended_answer') {
    if (!question.model_answer_outline) fail(where, 'extended_answer missing model_answer_outline');
  } else if (type === 'fill_blank') {
    if (!isNonEmptyString(question.template)) fail(where, 'fill_blank missing template');
    if (!Array.isArray(question.blanks) || question.blanks.length === 0) fail(where, 'fill_blank missing blanks');
    if (!Array.isArray(question.bank) || question.bank.length === 0) fail(where, 'fill_blank missing word bank');
    if (Array.isArray(question.blanks) && Array.isArray(question.bank)) {
      for (const blank of question.blanks) {
        if (!question.bank.includes(blank)) fail(where, `blank "${blank}" missing from word bank`);
      }
    }
  } else {
    fail(where, `unknown question type "${type}"`);
  }

  validateReforge(where, question.reforge);
}

if (!isObject(SUBJECTS)) fail('SUBJECTS', 'missing or invalid object');
if (!isObject(BANKS)) fail('BANKS', 'missing or invalid object');

if (isObject(SUBJECTS) && isObject(BANKS)) {
  for (const [subjectKey, subject] of Object.entries(SUBJECTS)) {
    const where = location(subjectKey);
    if (!isObject(subject)) {
      fail(where, 'subject must be an object');
      continue;
    }
    if (!isNonEmptyString(subject.label)) warn(where, 'missing label');
    if (!Array.isArray(subject.banks)) {
      fail(where, 'subject missing banks array');
      continue;
    }

    for (const bankKey of subject.banks) {
      referencedBanks.add(bankKey);
      if (!BANKS[bankKey]) fail(where, `references missing bank "${bankKey}"`);
    }
  }

  for (const [bankKey, bank] of Object.entries(BANKS)) {
    stats.banks += 1;
    if (!referencedBanks.has(bankKey)) warn(bankKey, 'bank is not referenced by any subject');
    if (!isObject(bank)) {
      fail(bankKey, 'bank must be an object');
      continue;
    }
    if (!isNonEmptyString(bank.label)) warn(bankKey, 'missing label');
    if (!Array.isArray(bank.questions)) {
      fail(bankKey, 'missing questions array');
      continue;
    }
    bank.questions.forEach((question, index) => validateQuestion('BANKS', bankKey, question, index));
  }
}

for (const [questionId, locations] of questionIds.entries()) {
  if (locations.length > 1) {
    fail(questionId, `duplicate question id used in ${locations.join(', ')}`);
  }
}

console.log(`Checked ${stats.questions} questions across ${stats.banks} banks.`);
console.log(`Question types: ${Object.entries(stats.types).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}`);
console.log(`MCQ answer distribution: ${VALID_OPTIONS.map((k) => `${k}=${stats.correct[k]}`).join(', ')}`);

const advisoryMessages = [];
if (advisories.missingSpec) advisoryMessages.push(`${advisories.missingSpec} questions are missing spec metadata`);
if (advisories.missingTag) advisoryMessages.push(`${advisories.missingTag} questions are missing misconception tags`);

if (advisoryMessages.length) {
  console.log(`Advisories: ${advisoryMessages.join('; ')}.`);
}

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.slice(0, 40).forEach((message) => console.log(`WARN  ${message}`));
  if (warnings.length > 40) console.log(`WARN  ...and ${warnings.length - 40} more`);
}

if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.slice(0, 80).forEach((message) => console.log(`FAIL  ${message}`));
  if (errors.length > 80) console.log(`FAIL  ...and ${errors.length - 80} more`);
  process.exit(1);
}

console.log('\nQuestion bank validation passed.');
