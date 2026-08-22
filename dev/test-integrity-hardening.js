#!/usr/bin/env node
'use strict';

const fs = require('fs');
const assert = require('assert');

const crucible = fs.readFileSync('pages/app/crucible.html', 'utf8');
const anvil = fs.readFileSync('pages/app/anvil.html', 'utf8');
const dashboard = fs.readFileSync('pages/app/student-dashboard.html', 'utf8');
const profile = fs.readFileSync('pages/app/profile.html', 'utf8');
const writer = fs.readFileSync('scripts/forge-response-writer.js', 'utf8');

assert(crucible.includes("return !!(state.classId||state.isPaid||state.isTrial)"), 'Crucible must require class, Pro, or trial access');
assert(crucible.includes("state.phase = 'locked';"), 'free sessions must reach the Crucible access wall');
assert(!crucible.includes("id=\"j-skip\""), 'Crucible must not offer anonymous free entry');
assert(crucible.includes('id="c-next" disabled>Saving…</button>'), 'students must not advance before an answer is saved');
assert(crucible.includes('id="c-retry-save" hidden>Retry save</button>'), 'failed Crucible writes must be retryable');
assert(crucible.includes('if(state.pendingSave){'), 'the timer must wait for an in-flight answer write before rendering results');
assert(crucible.includes('var unsaved=state.answers.filter(function(a){return !a.saved;}).length;'), 'results must account for every unsaved answer');
assert(crucible.includes('if(!unsaved) clearCrucibleRun();'), 'an incomplete Crucible run must remain recoverable locally');
assert(writer.includes('var token = root.ForgeAuth && root.ForgeAuth.accessToken'), 'authenticated class access must use the student auth token');

assert(!anvil.includes("subject:'anvil'"), 'new Anvil rows must not create a synthetic subject');
assert(anvil.includes("subject:m.subject||anvilState.classSubject||null"), 'Anvil rows must retain their curriculum subject');
assert(dashboard.includes("subj==='anvil'||subj==='crucible'"), 'legacy activity subjects must be excluded from strongest-subject ranking');
assert(profile.includes("if((r.subject==='anvil'||r.subject==='crucible')&&!(cid&&classes[cid])) return;"), 'unscoped legacy activity subjects must be excluded from predicted grades');

console.log('Integrity hardening tests passed (Crucible persistence/access and Anvil subject attribution).');
