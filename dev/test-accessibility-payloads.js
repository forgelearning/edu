#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const quiz = fs.readFileSync('pages/app/forge-quiz.html', 'utf8');
const teacher = fs.readFileSync('pages/app/teacher.html', 'utf8');
const school = fs.readFileSync('pages/app/school-overview.html', 'utf8');
const components = fs.readFileSync('css/components.css', 'utf8');
const tokens = fs.readFileSync('css/tokens.css', 'utf8');

assert(quiz.includes('data/forge-catalog.js') && quiz.includes('scripts/forge-data-loader.js'), 'Forge must start from the lightweight catalogue and lazy loader');
assert(!quiz.includes('src="data/forge-data.js'), 'Forge must not download the monolithic question bank at startup');
assert(quiz.includes('ForgeData.loadSubject(state.subject)'), 'Forge must load only the chosen subject payload');
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
assert(fs.statSync('data/forge-catalog.js').size < fs.statSync('data/forge-data.js').size / 20, 'catalogue should be at least 20× smaller than the monolith');

console.log('Accessibility and lazy-payload tests passed.');
