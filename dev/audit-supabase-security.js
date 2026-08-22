#!/usr/bin/env node
/* Read-only smoke tests for the public Supabase boundary. */
const fs = require('fs');

const apiSource = fs.readFileSync(require.resolve('../scripts/forge-api.js'), 'utf8');
const url = (apiSource.match(/url:\s*'([^']+)'/) || [])[1];
const key = (apiSource.match(/config\.key\s*=\s*'([^']+)'/) || [])[1];
if (!url || !key) throw new Error('Could not read ForgeAPI configuration');

const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function request(path, options = {}) {
  const response = await fetch(url + path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const text = await response.text();
  let body = text;
  try { body = text ? JSON.parse(text) : null; } catch (_) {}
  return { status: response.status, body };
}

function assertStatus(name, result, accepted) {
  if (!accepted.includes(result.status)) {
    throw new Error(`${name}: expected ${accepted.join('/')} but got ${result.status}: ${JSON.stringify(result.body)}`);
  }
  console.log(`✓ ${name} (${result.status})`);
}

(async () => {
  // This RPC must not be callable by an anonymous browser with no teacher JWT.
  assertStatus('school overview is not public', await request('/rest/v1/rpc/get_school_overview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }), [401, 403, 404]);

  // Invite codes are only reachable through validate_teacher_invite().
  assertStatus('invite-code table is not public', await request('/rest/v1/teacher_invite_codes?select=*'), [401, 403, 404]);

  // Code coverage is counts about a class, but it is reached through a definer
  // function over a table that has no RLS policies at all, so anonymous callers
  // must be refused outright. 404 also passes, for a checkout whose migration
  // has not been applied to this project yet.
  assertStatus('code-coverage RPC is not public', await request('/rest/v1/rpc/class_student_code_coverage', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ p_class_id: '00000000-0000-0000-0000-000000000000' })
  }), [401, 403, 404]);

  // The table behind it holds code hashes and is fail-closed by having no
  // policies. A 200 with rows here means one was added.
  const codeRows = await request('/rest/v1/student_access_codes?select=id&limit=1');
  assertStatus('student access codes are not readable anonymously', codeRows, [200, 401, 403, 404]);
  if (Array.isArray(codeRows.body) && codeRows.body.length !== 0) {
    throw new Error('student_access_codes rows are readable without a session');
  }

  // The free-history RPC may return an empty set for a fake bearer token, but
  // it must not return another student's rows or allow a missing token.
  const free = await request('/rest/v1/rpc/get_free_student_responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ p_student_id: '00000000-0000-0000-0000-000000000000', p_free_token: 'invalid-test-token' })
  });
  assertStatus('free-history RPC is present and fail-closed', free, [200]);
  if (Array.isArray(free.body) && free.body.length !== 0) {
    throw new Error('free-history RPC returned rows for an invalid token');
  }

  const quota = await request('/rest/v1/rpc/record_free_response', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      p_student_id: '00000000-0000-0000-0000-000000000000',
      p_free_token: 'invalid-test-token', p_question_id: 'SECURITY-SMOKE',
      p_bank: 'SECURITY', p_subject: 'security', p_selected_option: 'A',
      p_is_correct: false, p_misconception_tag: null,
      p_reforge_attempted: false, p_reforge_correct: null
    })
  });
  assertStatus('free quota RPC is present and fail-closed', quota, [200]);
  if (!quota.body || quota.body.allowed !== false) throw new Error('free quota RPC accepted an invalid session');

  // Free-tier students are the class_id-is-null rows. The teacher policies used
  // to grant every one of them to any authenticated account; they are now
  // scoped to the caller's own pupils. Anonymous reads must stay empty too — a
  // non-empty result here means a policy has been widened back.
  const unlinkedStudents = await request('/rest/v1/students?select=id&class_id=is.null&limit=1');
  assertStatus('unlinked students are not readable anonymously', unlinkedStudents, [200, 401, 403]);
  if (Array.isArray(unlinkedStudents.body) && unlinkedStudents.body.length !== 0) {
    throw new Error('free-tier student rows are readable without a teacher session');
  }

  const unlinkedResponses = await request('/rest/v1/responses?select=id&class_id=is.null&limit=1');
  assertStatus('unlinked responses are not readable anonymously', unlinkedResponses, [200, 401, 403]);
  if (Array.isArray(unlinkedResponses.body) && unlinkedResponses.body.length !== 0) {
    throw new Error('free-tier response rows are readable without a teacher session');
  }

  // Teacher provisioning: the profile that binds an account to a school is
  // written only by claim_teacher_invite(), never through the table API.
  assertStatus('teacher_profiles table is not public', await request('/rest/v1/teacher_profiles?select=*'), [401, 403, 404]);

  const claim = await request('/rest/v1/rpc/claim_teacher_invite', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ p_code: 'SECURITY-SMOKE' })
  });
  assertStatus('invite claim needs a teacher session', claim, [401, 403, 404]);

  console.log('Supabase security smoke tests passed.');
})().catch(error => { console.error(error.message); process.exit(1); });
