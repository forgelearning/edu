#!/usr/bin/env node
/*
 * End-to-end test against the DEPLOYED Supabase policies.
 *
 * The rest of the suite mocks ForgeAPI, which is why three separate silent
 * data-loss bugs shipped: Crucible and Anvil wrote straight into `responses`
 * (rejected by RLS), the student read paths dropped the access code and fell
 * through to an RPC that is disabled for coded classes, and every analytics
 * event 401'd on an upsert the anon role may not perform. None of those are
 * reachable without talking to the real policies.
 *
 * Needs a service-role key to seed and tear down its own disposable class;
 * everything the student does uses the anon key, exactly as the browser would.
 * Local runs without the key remain an explicit skip, while CI and
 * `FORGE_E2E_REQUIRED=1` fail closed so the release gate cannot silently omit
 * this policy-level regression check.
 *
 *   FORGE_SERVICE_ROLE_KEY=... node dev/test-coded-student-e2e.js
 *
 * Creates one class, one student, one access code and four responses, all
 * prefixed ZZ-E2E, and deletes them in a finally block.
 */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const apiSource = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'forge-api.js'), 'utf8');
function literal(name) {
  const m = apiSource.match(new RegExp(name + "\\s*[:=]\\s*'([^']+)'"));
  if (!m) throw new Error('Could not read ' + name + ' from scripts/forge-api.js');
  return m[1];
}
const SUPABASE_URL = process.env.SUPABASE_URL || literal('url');
const ANON_KEY = process.env.SUPABASE_ANON_KEY || literal('config.key') || literal('key');
const SERVICE_KEY = process.env.FORGE_SERVICE_ROLE_KEY || '';

if (!SERVICE_KEY) {
  console.log('SKIP: coded-student e2e needs FORGE_SERVICE_ROLE_KEY to seed a disposable class.');
  console.log('      Set it to run this check against the deployed RLS policies.');
  if (process.env.CI === 'true' || process.env.FORGE_E2E_REQUIRED === '1') process.exit(1);
  process.exit(0);
}

let failures = 0;
function check(name, condition, detail) {
  if (condition) { console.log('  ok   ' + name); return true; }
  failures++;
  console.log('  FAIL ' + name + (detail ? ' — ' + detail : ''));
  return false;
}

function req(pathname, { method = 'GET', key = ANON_KEY, body, prefer } = {}) {
  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  if (prefer) headers.Prefer = prefer;
  return fetch(SUPABASE_URL + pathname, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
    .then(async (res) => {
      const text = await res.text();
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = text; }
      return { status: res.status, ok: res.ok, body: parsed };
    });
}
const rpc = (name, payload, key) => req('/rest/v1/rpc/' + name, { method: 'POST', key, body: payload || {} });

const stamp = Date.now().toString(36).toUpperCase();
const CLASS_CODE = 'ZZE2E-' + stamp.slice(-4);
const STUDENT_CODE = crypto.randomBytes(5).toString('hex').toUpperCase();
const CODE_HASH = crypto.createHash('sha256').update(STUDENT_CODE, 'utf8').digest('hex');
const TEACHER_EMAIL = 'zz-e2e-' + stamp.toLowerCase() + '@forge-e2e.invalid';
const TEACHER_PASSWORD = 'ZZ-e2e-' + crypto.randomBytes(12).toString('hex') + '!';

let classId = null;
let studentId = null;
let assignmentId = null;
let teacherUserId = null;

async function main() {
  console.log('Coded-student end-to-end (deployed RLS)\n');

  // ── seed ────────────────────────────────────────────────────────────────
  // A class now needs an owner with a teacher_profiles row: the
  // classes_apply_teacher_school trigger refuses the insert otherwise, and
  // fills school/school_key from that profile rather than from the body.
  // (20260821200100_bind_teachers_to_invited_school.sql.) The trigger applies
  // to the service role too, so the test seeds a real teacher rather than an
  // ownerless class.
  const teacher = await req('/auth/v1/admin/users', {
    method: 'POST', key: SERVICE_KEY,
    body: { email: TEACHER_EMAIL, password: TEACHER_PASSWORD, email_confirm: true }
  });
  teacherUserId = teacher.body && teacher.body.id;
  if (!check('seed: disposable teacher created', !!teacherUserId, JSON.stringify(teacher.body))) return;

  const profile = await req('/rest/v1/teacher_profiles', {
    method: 'POST', key: SERVICE_KEY, prefer: 'return=representation',
    body: { user_id: teacherUserId, school_key: 'zz e2e school', school_name: 'ZZ E2E School', invite_code: 'ZZ-E2E' }
  });
  if (!check('seed: teacher provisioned to a school', profile.status === 201, JSON.stringify(profile.body))) return;

  const created = await req('/rest/v1/classes', {
    method: 'POST', key: SERVICE_KEY, prefer: 'return=representation',
    body: { code: CLASS_CODE, name: 'ZZ-E2E Disposable', subject: 'econ', teacher_name: 'ZZ E2E', teacher_user_id: teacherUserId }
  });
  classId = created.body && created.body[0] && created.body[0].id;
  if (!check('seed: disposable class created', !!classId, JSON.stringify(created.body))) return;

  const assignment = await req('/rest/v1/assignments', {
    method: 'POST', key: SERVICE_KEY, prefer: 'return=representation',
    body: { class_id: classId, title: 'ZZ-E2E Assignment', banks: ['ECON-1.1'], due_date: '2099-01-01' }
  });
  assignmentId = assignment.body && assignment.body[0] && assignment.body[0].id;
  if (!check('seed: disposable assignment created', !!assignmentId, JSON.stringify(assignment.body))) return;

  const code = await req('/rest/v1/student_access_codes', {
    method: 'POST', key: SERVICE_KEY, prefer: 'return=representation',
    body: { class_id: classId, code_hash: CODE_HASH }
  });
  if (!check('seed: access code created', code.status === 201, JSON.stringify(code.body))) return;

  // ── join, as the browser does, with the anon key only ───────────────────
  const joined = await rpc('join_class_with_student_code', {
    p_class_code: CLASS_CODE, p_student_code: STUDENT_CODE, p_name: 'ZZ E2E Student'
  });
  studentId = Array.isArray(joined.body) && joined.body[0] && joined.body[0].student_id;
  if (!check('student joins with class code + student code', !!studentId, JSON.stringify(joined.body))) return;

  // ── writes: one per surface that records a response ─────────────────────
  const write = (row) => rpc('record_student_response_with_code', Object.assign({
    p_student_id: studentId, p_class_code: CLASS_CODE, p_student_code: STUDENT_CODE,
    p_misconception_tag: null, p_spec_point: null, p_reforge_attempted: false, p_reforge_correct: null,
    p_assignment_id: null
  }, row));

  const forgeWrong = await write({
    p_question_id: 'ZZ-E2E-Q1', p_bank: 'ECON-1.1', p_subject: 'econ',
    p_selected_option: 'A', p_is_correct: false, p_misconception_tag: 'MC-E2E-TAG', p_spec_point: '1.1', p_assignment_id: assignmentId
  });
  check('Forge: wrong answer accepted', forgeWrong.body && forgeWrong.body.allowed === true, JSON.stringify(forgeWrong.body));

  const forgeReforge = await write({
    p_question_id: 'ZZ-E2E-Q1-RF', p_bank: 'ECON-1.1', p_subject: 'econ',
    p_selected_option: 'B', p_is_correct: true, p_reforge_attempted: true, p_reforge_correct: true
  });
  check('Forge: reforge accepted', forgeReforge.body && forgeReforge.body.allowed === true, JSON.stringify(forgeReforge.body));

  // Regression guard for the Crucible bug: this row shape used to go through a
  // direct insert and be rejected by RLS while the UI reported success.
  const crucible = await write({
    p_question_id: 'ZZ-E2E-Q2-CRU', p_bank: 'ECON-MIX', p_subject: 'econ',
    p_selected_option: 'C', p_is_correct: false, p_misconception_tag: 'MC-E2E-TAG'
  });
  check('Crucible: timed answer accepted', crucible.body && crucible.body.allowed === true, JSON.stringify(crucible.body));

  // Regression guard for the Anvil bug: same shape as a repair-session answer.
  const anvil = await write({
    p_question_id: 'ZZ-E2E-Q3-ANVIL', p_bank: 'MC-E2E-TAG', p_subject: 'anvil',
    p_selected_option: 'D', p_is_correct: true, p_misconception_tag: 'MC-E2E-TAG',
    p_reforge_attempted: true, p_reforge_correct: true
  });
  check('Anvil: repair answer accepted', anvil.body && anvil.body.allowed === true, JSON.stringify(anvil.body));

  // ── the guard that made the old code path fail silently ─────────────────
  const direct = await req('/rest/v1/responses', {
    method: 'POST', prefer: 'return=minimal',
    body: { student_id: studentId, class_id: classId, question_id: 'ZZ-E2E-DIRECT', bank: 'ECON-1.1', subject: 'econ', selected_option: 'A', is_correct: false }
  });
  check('direct anon insert into responses is still rejected', direct.status === 401 || direct.status === 403,
    'got ' + direct.status + ' — if this now succeeds the RLS guard has been weakened');

  // ── reads: the credential must be carried, or nothing comes back ────────
  const withCode = await rpc('get_student_own_responses_with_code', {
    p_student_id: studentId, p_class_code: CLASS_CODE, p_student_code: STUDENT_CODE
  });
  const rows = Array.isArray(withCode.body) ? withCode.body : [];
  check('read with student code returns all four responses', rows.length === 4, 'got ' + rows.length);
  check('misconception tag survives the round trip', rows.some((r) => r && r.misconception_tag === 'MC-E2E-TAG'));
  check('assignment id survives the response round trip', rows.some((r) => r && r.assignment_id === assignmentId));

  const legacy = await rpc('get_student_own_responses', {
    p_student_id: studentId, p_code: CLASS_CODE, p_name: 'ZZ E2E Student'
  });
  const legacyRows = Array.isArray(legacy.body) ? legacy.body : [];
  check('legacy read path is a dead end for coded classes (returns 0)', legacyRows.length === 0,
    'got ' + legacyRows.length + ' — this is the fallback that made the Anvil look empty');

  // ── analytics ingestion ─────────────────────────────────────────────────
  const evt = () => ({
    client_event_id: 'zz-e2e-' + crypto.randomBytes(12).toString('hex'),
    event_name: 'zz_e2e_probe', occurred_at: new Date().toISOString(),
    anonymous_id: 'zz-e2e-anon-0001', details: {}
  });
  const plain = await req('/rest/v1/product_events', { method: 'POST', prefer: 'return=minimal', body: evt() });
  check('analytics: plain insert is accepted', plain.status === 201, 'got ' + plain.status + ' ' + JSON.stringify(plain.body));

  const upsert = await req('/rest/v1/product_events', {
    method: 'POST', prefer: 'resolution=ignore-duplicates,return=minimal', body: evt()
  });
  check('analytics: ignore-duplicates still needs SELECT and must not be reintroduced', upsert.status === 401,
    'got ' + upsert.status + ' — if this now succeeds, grants changed; revisit forge-product-analytics.js');

  return;
}

async function cleanup() {
  if (studentId) {
    await req('/rest/v1/responses?student_id=eq.' + studentId, { method: 'DELETE', key: SERVICE_KEY });
  }
  if (classId) {
    await req('/rest/v1/student_access_codes?class_id=eq.' + classId, { method: 'DELETE', key: SERVICE_KEY });
    await req('/rest/v1/students?class_id=eq.' + classId, { method: 'DELETE', key: SERVICE_KEY });
    await req('/rest/v1/assignments?class_id=eq.' + classId, { method: 'DELETE', key: SERVICE_KEY });
    await req('/rest/v1/classes?id=eq.' + classId, { method: 'DELETE', key: SERVICE_KEY });
  }
  await req('/rest/v1/product_events?event_name=eq.zz_e2e_probe', { method: 'DELETE', key: SERVICE_KEY });
  if (teacherUserId) {
    await req('/rest/v1/teacher_profiles?user_id=eq.' + teacherUserId, { method: 'DELETE', key: SERVICE_KEY });
    await req('/auth/v1/admin/users/' + teacherUserId, { method: 'DELETE', key: SERVICE_KEY });
  }

  const left = await req('/rest/v1/classes?select=id&code=eq.' + CLASS_CODE, { key: SERVICE_KEY });
  check('cleanup: disposable class removed', Array.isArray(left.body) && left.body.length === 0, JSON.stringify(left.body));
}

main()
  .catch((error) => { failures++; console.log('  FAIL unexpected error — ' + (error && error.message)); })
  .then(cleanup)
  .catch((error) => { failures++; console.log('  FAIL cleanup — ' + (error && error.message)); })
  .then(() => {
    console.log('');
    if (failures) { console.error('Coded-student e2e FAILED (' + failures + ' check' + (failures === 1 ? '' : 's') + ').'); process.exit(1); }
    console.log('Coded-student e2e passed against deployed RLS policies.');
  });
