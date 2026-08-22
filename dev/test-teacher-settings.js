#!/usr/bin/env node
/* Regression checks for the teacher settings page (P4).
 *
 * It used to be a theme picker and a sign-out button. A school buying this
 * asks for the account controls and, under UK GDPR, for a way to get the data
 * out and to have it erased — so those four controls need to stay present and
 * stay guarded. */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const settings = fs.readFileSync(path.join(root, 'pages', 'app', 'teacher-settings.html'), 'utf8');

// ── the controls exist ───────────────────────────────────────────────────────
assert(/id="settings-display-name"/.test(settings), 'settings needs a display-name field');
assert(/id="settings-password"/.test(settings) && /id="settings-password-confirm"/.test(settings),
  'password change needs a new password and a confirmation');
assert(/id="settings-export"/.test(settings), 'settings needs a data export control');
assert(/id="settings-erase"/.test(settings), 'settings needs a data erasure control');
console.log('  ok   account and data controls are present');

// ── the display name reaches the place students see it ───────────────────────
assert(/ForgeAPI\.patch\('classes'/.test(settings),
  'saving a display name must update the teacher_name on their classes, not only the auth user');
console.log('  ok   display name propagates to owned classes');

// ── password rules are enforced before the request ───────────────────────────
assert(/next\.length < 8/.test(settings), 'a short password must be refused client-side');
assert(/next !== confirmValue/.test(settings), 'a mismatched confirmation must be refused');
console.log('  ok   password change validates before calling the API');

// ── erasure is typed-confirmation gated, and scoped to the caller ────────────
assert(/id="settings-erase-confirm-btn" disabled/.test(settings), 'the erase button must start disabled');
assert(/toUpperCase\(\) !== 'ERASE'/.test(settings), 'erase must require the word ERASE to be typed');
assert(/teacher_user_id=eq\.'\s*\+\s*encodeURIComponent\(owner\)/.test(settings),
  'erase must only ever select the signed-in teacher’s own classes');
console.log('  ok   erasure requires a typed confirmation and is scoped to the owner');

// Native dialogs are unreliable in the Capacitor shells this repo builds, and
// the rest of the teacher app has already moved off them.
assert(!/window\.(confirm|prompt|alert)\(/.test(settings), 'settings must not depend on native dialogs');
console.log('  ok   settings uses no native dialogs');

console.log('\nTeacher settings tests passed (5 cases).');
