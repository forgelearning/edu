#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
const dashboard = fs.readFileSync('pages/app/student-dashboard.html', 'utf8');
const assignments = fs.readFileSync('pages/app/assignments.html', 'utf8');
const anvil = fs.readFileSync('pages/app/anvil.html', 'utf8');
const crucible = fs.readFileSync('pages/app/crucible.html', 'utf8');
const profile = fs.readFileSync('pages/app/profile.html', 'utf8');
const teacherDashboard = fs.readFileSync('pages/app/teacher.html', 'utf8');
const schoolOverview = fs.readFileSync('pages/app/school-overview.html', 'utf8');
const home = fs.readFileSync('pages/marketing/index.html', 'utf8');
const teacher = fs.readFileSync('pages/app/teacher.html', 'utf8');
const school = fs.readFileSync('pages/app/school-overview.html', 'utf8');
const components = fs.readFileSync('css/components.css', 'utf8');
const tokens = fs.readFileSync('css/tokens.css', 'utf8');

assert(quiz.includes('data/forge-catalog.js') && quiz.includes('scripts/forge-data-loader.js'), 'Forge must start from the lightweight catalogue and lazy loader');
assert(!quiz.includes('src="data/forge-data.js'), 'Forge must not download the monolithic question bank at startup');
assert(quiz.includes('ForgeData.loadSubject(state.subject)'), 'Forge must load only the chosen subject payload');
for (const [name, page] of Object.entries({dashboard, assignments, anvil, crucible, profile, teacherDashboard, schoolOverview, home})) {
  assert(!page.includes('src="data/forge-data.js'), `${name} must not download the monolithic question bank at startup`);
  assert(page.includes('data/forge-catalog.js'), `${name} must start from the lightweight catalogue`);
}
for (const [name, page] of Object.entries({teacherDashboard, schoolOverview})) {
  assert(page.includes('data/forge-question-index.js'), `${name} must use the compact response-attribution index`);
}
for (const [name, page] of Object.entries({assignments, anvil, crucible})) {
  assert(page.includes('scripts/forge-data-loader.js'), `${name} must lazy-load question payloads when needed`);
}
assert(teacher.includes('role="tab"') && teacher.includes('role="tabpanel"'), 'teacher tabs need complete tab semantics');
assert(school.includes('role="tablist" aria-label="School detail views"'), 'SLT detail navigation needs tablist semantics');
assert(components.includes("content:'✓ Correct'") && components.includes("content:'✗ Review'"), 'answer feedback must include a non-colour status label');
assert(components.includes('min-height:44px'), 'shared interactive controls need 44px touch targets');
assert(tokens.includes('--ember:#B83E00') && tokens.includes('--bad:#B42323'), 'light-theme semantic colours must use the higher-contrast palette');

const catalogContext = { window: {} };
vm.createContext(catalogContext);
vm.runInContext(fs.readFileSync('data/forge-catalog.js', 'utf8'), catalogContext);
assert(Object.keys(catalogContext.window.BANKS).length > 150, 'catalogue must retain all bank metadata');
assert(Object.values(catalogContext.window.BANKS).every(bank => bank.questions.length === 0 && bank.questionCount > 0), 'catalogue must not embed question payloads');
assert(Object.values(catalogContext.window.BANKS).every(bank => bank.subject && bank.assignableQuestionCount >= 0 && bank.crucibleQuestionCount >= 0), 'catalogue must retain routing and activity counts');
assert(fs.statSync('data/forge-catalog.js').size < fs.statSync('data/forge-data.js').size / 20, 'catalogue should be at least 20× smaller than the monolith');
assert(fs.existsSync('data/question-payloads/retired.js'), 'retired Anvil questions need their own lazy payload');
const questionIndexContext = { window: {} };
vm.createContext(questionIndexContext);
vm.runInContext(fs.readFileSync('data/forge-question-index.js', 'utf8'), questionIndexContext);
assert(Object.keys(questionIndexContext.window.FORGE_QUESTION_INDEX.subjects).length > 7500, 'question index must retain subject attribution for every active question');
assert(Object.keys(questionIndexContext.window.FORGE_QUESTION_INDEX.misconceptionSubjects).length > 1000, 'question index must retain misconception attribution without question bodies');

async function testLoader() {
  const context = {
    console,
    CustomEvent: function CustomEvent(type, options) { this.type = type; this.detail = options && options.detail; },
    setTimeout,
    clearTimeout
  };
  context.window = context;
  context.document = {
    dispatchEvent() {},
    createElement() { return {}; },
    head: {
      appendChild(script) {
        setTimeout(() => {
          const file = script.src.replace(/^data\//, 'data/');
          try {
            vm.runInContext(fs.readFileSync(file, 'utf8'), context);
            script.onload();
          } catch (error) {
            script.onerror(error);
          }
        }, 0);
      }
    }
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('data/forge-catalog.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('scripts/forge-data-loader.js', 'utf8'), context);
  const subject = Object.keys(context.SUBJECTS)[0];
  const bank = context.SUBJECTS[subject].banks[0];
  await context.ForgeData.loadBanks([bank]);
  assert(context.ForgeData.isLoaded(subject), 'loadBanks must resolve a bank to its subject payload');
  assert(context.BANKS[bank].questions.length > 0, 'lazy subject payload must hydrate catalogue bank shells');
  await context.ForgeData.loadRetired();
  assert(Object.keys(context.RETIRED_BANKS).length > 0, 'retired payload must remain available to Anvil repairs');
}

testLoader().then(() => console.log('Accessibility and lazy-payload tests passed.')).catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
