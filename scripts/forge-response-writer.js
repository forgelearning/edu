/* Single owner of "how a response reaches the server".
 *
 * There are four different write paths depending on who the student is, and
 * picking the wrong one fails silently: `anon` may INSERT into `responses` but
 * every insert is checked against an RLS policy, so a coded student writing
 * directly gets 401 "new row violates row-level security policy" — which the
 * callers used to swallow. Forge, Crucible and Anvil each grew their own copy
 * of this decision; only Forge was updated when student access codes landed, so
 * Crucible and Anvil discarded every answer they ever took.
 *
 * Keep the policy here, once. A caller must not decide how to write a row, and
 * must not tell the student their work was saved until this resolves ok:true.
 */
(function (root) {
  root.ForgePersistenceErrors = root.ForgePersistenceErrors || [];

  function detailFor(error, row, source) {
    return {
      source: source || 'response',
      status: (error && error.status) || null,
      message: (error && error.message) || String(error || 'Unknown persistence error'),
      student_id: row && row.student_id,
      class_id: row && row.class_id,
      bank: row && row.bank,
      question_id: row && row.question_id
    };
  }

  function fail(error, row, source) {
    var detail = detailFor(error, row, source);
    root.ForgePersistenceErrors.push(detail);
    console.error('Forge response persistence failed:', detail);
    return { ok: false, detail: detail };
  }

  function ok(result) { return { ok: true, result: result || null }; }

  /* session fields: isPaid, isTrial, studentId, classId, classCode,
     studentCode, freeToken. Only studentId is mandatory. */
  function save(session, row) {
    session = session || {};
    if (!session.studentId) return Promise.resolve({ ok: false, detail: detailFor(new Error('No student session'), row, 'no-session') });
    if (!root.ForgeAPI || !root.ForgeAPI.config) return Promise.resolve(fail(new Error('ForgeAPI unavailable'), row, 'no-api'));

    var token = (session.isPaid || session.isTrial) && root.ForgeAuth && root.ForgeAuth.accessToken
      ? root.ForgeAuth.accessToken()
      : null;

    if (token) {
      return root.ForgeAPI.response(root.ForgeAPI.config.url + '/rest/v1/responses', {
        method: 'POST',
        headers: {
          'apikey': root.ForgeAPI.config.key,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(row)
      }).then(function () { return ok(); })
        .catch(function (e) { return fail(e, row, 'authenticated-response'); });
    }

    /* Class-code students are anonymous, but their student/class pair is the
       ownership boundary for the write. This branch must stay explicit: if it
       silently fell through to a direct insert the row would be rejected. */
    if (session.classId && session.studentCode && root.ForgeStudentCode) {
      return root.ForgeStudentCode
        .recordResponse(session.studentId, session.classCode, session.studentCode, row)
        .then(function (result) { return ok(result); })
        .catch(function (e) { return fail(e, row, 'class-response'); });
    }

    /* Legacy class students predate access codes and still write directly. */
    if (session.classId) {
      return root.ForgeAPI.insert('responses', row, { headers: { 'Prefer': 'return=minimal' } })
        .then(function () { return ok(); })
        .catch(function (e) { return fail(e, row, 'legacy-class-response'); });
    }

    /* Free students write through the token-gated RPC, which also enforces the
       daily quota server-side. `allowed:false` is a refusal, not an error. */
    if (session.freeToken) {
      return root.ForgeAPI.rpc('record_free_response', {
        p_student_id: session.studentId,
        p_free_token: session.freeToken,
        p_question_id: row.question_id,
        p_bank: row.bank,
        p_subject: row.subject,
        p_selected_option: row.selected_option,
        p_is_correct: row.is_correct,
        p_misconception_tag: row.misconception_tag,
        p_reforge_attempted: row.reforge_attempted,
        p_reforge_correct: row.reforge_correct,
        p_assignment_id: row.assignment_id || null
      }).then(function (result) {
        if (result && result.allowed === false) return { ok: false, refused: true, result: result };
        return ok(result);
      }).catch(function (e) { return fail(e, row, 'free-response-rpc'); });
    }

    return Promise.resolve(fail(new Error('No usable write path for this session'), row, 'unroutable'));
  }

  /* Read the coded-class session the student pages cache on join. Returning the
     student code alongside the ids is the whole point: every reader that
     rebuilt this object by hand dropped the code and silently fell back to the
     legacy RPC, which is disabled for coded classes and answers []. */
  function classSession() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('forge-student') || 'null'); } catch (e) { saved = null; }
    if (!saved || !saved.studentId) return null;
    return {
      studentId: saved.studentId,
      classId: saved.classId || null,
      classCode: saved.classCode || null,
      studentCode: saved.studentCode || null,
      studentName: saved.studentName || null,
      classSubject: saved.classSubject || null
    };
  }

  root.ForgeResponseWriter = { save: save, classSession: classSession };
}(window));
