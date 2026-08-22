#!/usr/bin/env node
/*
 * Destructive class deletion.
 *
 * Deleting a class cascades to its students, access codes, assignments and
 * every response they hold, so the guards around it matter more than the
 * happy path. Two failure modes are specifically covered:
 *
 *   - PostgREST answers 204 No Content for a DELETE that matched zero rows,
 *     so an RLS-filtered delete used to look exactly like a successful one.
 *     ForgeAPI.remove must reject instead.
 *   - The confirmation panel is built by string concatenation. A stray
 *     closing tag shipped once already, so the markup is balance-checked.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const teacher = fs.readFileSync(path.join(root, 'pages', 'app', 'teacher.html'), 'utf8');

/* ---------- ForgeAPI.remove: the silent-success guard ---------- */

function loadForgeAPI(fetchImpl) {
  const sandbox = { window: {}, fetch: fetchImpl, setTimeout, clearTimeout, console, AbortController };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'scripts', 'forge-api.js'), 'utf8'), sandbox);
  return sandbox.window.ForgeAPI;
}
const respond = (body, status) => () => Promise.resolve({
  ok: status < 400, status: status || 200, text: () => Promise.resolve(JSON.stringify(body))
});

(async function run() {
  // RLS filtered the row out: PostgREST returns an empty array, not an error.
  const noRows = loadForgeAPI(respond([], 200));
  let rejected = null;
  await noRows.remove('classes', 'some-id').then(
    () => { throw new Error('remove() resolved on a zero-row delete'); },
    (error) => { rejected = error; }
  );
  assert.strictEqual(rejected.code, 'DELETE_NO_ROWS', 'a zero-row delete must reject with DELETE_NO_ROWS');
  assert.strictEqual(rejected.status, 403, 'a zero-row delete should read as a permission failure');
  console.log('  ok   zero-row delete rejects instead of reporting success');

  // A permitted delete returns the removed rows.
  const deleted = loadForgeAPI(respond([{ id: 'some-id' }], 200));
  const rows = await deleted.remove('classes', 'some-id');
  assert.strictEqual(rows.length, 1, 'a permitted delete should resolve with the removed rows');
  console.log('  ok   permitted delete resolves with the removed rows');

  // The representation is what makes the zero-row case detectable at all.
  let sentHeaders = null;
  const spy = loadForgeAPI((url, options) => { sentHeaders = options.headers; return respond([{ id: 'x' }], 200)(); });
  await spy.remove('classes', 'x');
  assert.strictEqual(sentHeaders.Prefer, 'return=representation', 'remove() must ask for the deleted rows back');
  console.log('  ok   remove() requests return=representation');

  /* ---------- the confirmation panel ---------- */

  const panelStart = teacher.indexOf("id=\"delete-class-panel\"");
  assert(panelStart > -1, 'teacher dashboard should render a delete-class panel host');

  const handler = teacher.slice(teacher.indexOf('deleteClassBtn.onclick'), teacher.indexOf('var migrateBtn'));
  assert(handler.length > 0, 'delete handler should be present');

  // Cancel must clear the panel, not just hide it.
  assert(/delete-class-cancel/.test(handler), 'panel should offer a cancel control');
  assert(/deletePanel\.hidden = true; deletePanel\.innerHTML = '';/.test(handler),
    'cancel should hide AND clear the panel so a stale confirm box cannot be reused');
  console.log('  ok   cancel hides and clears the panel');

  // The typed code gates the button, case-insensitively.
  assert(/confirmBtn\.disabled = input\.value\.trim\(\)\.toUpperCase\(\) !== String\(dashState\.classCode \|\| ''\)\.toUpperCase\(\)/.test(handler),
    'confirm button must stay disabled until the typed code matches the class code');
  assert(/id="delete-class-confirm-btn" disabled/.test(handler), 'confirm button must start disabled');
  console.log('  ok   wrong code leaves the confirm button disabled');

  // An RLS no-op must surface as a permission message, not a generic retry.
  assert(/error && error\.code === 'DELETE_NO_ROWS'/.test(handler),
    'handler should distinguish a permission failure from a connection failure');
  assert(/You can only delete classes you created/.test(handler), 'permission failure needs its own message');
  assert(/stateHost\.innerHTML = '';/.test(handler), 'repeated failures must not stack error states');
  console.log('  ok   RLS no-op surfaces as a permission error, not a retry prompt');

  // A successful delete drops the class locally and leaves the dashboard.
  assert(/getJoinedClasses\(\)\.filter/.test(handler), 'successful delete should drop the class from the local list');
  assert(/dashState\.classId = null;/.test(handler), 'successful delete should close the open class');
  assert(/renderTeacherHome\(\)/.test(handler), 'successful delete should return to the class list');
  console.log('  ok   successful delete clears local state and returns home');

  // Native dialogs are unreliable in the Capacitor shells this repo builds.
  assert(!/window\.confirm|window\.prompt|window\.alert/.test(handler),
    'the delete flow must not depend on native dialogs');
  console.log('  ok   delete flow uses no native dialogs');

  /* ---------- markup balance ---------- */

  const literals = handler.match(/'(?:[^'\\]|\\.)*'/g) || [];
  const markup = literals.join('');
  for (const tag of ['b', 'p', 'div', 'h3', 'code']) {
    const open = (markup.match(new RegExp('<' + tag + '(?=[ >])', 'g')) || []).length;
    const close = (markup.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    assert.strictEqual(close, open, `delete panel <${tag}> tags are unbalanced (${open} open, ${close} close)`);
  }
  console.log('  ok   delete panel markup is balanced');

  console.log('\nClass deletion tests passed (9 cases).');
}()).catch((error) => { console.error('\nClass deletion tests FAILED:\n  ' + error.message); process.exit(1); });
