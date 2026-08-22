/* Private class-student code helpers. Codes are credentials, not display
   labels: keep them in the session only and validate them server-side. */
(function (root) {
  function clean(value) {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
  function rpc(name, body) {
    return root.ForgeAPI.rpc(name, body, { token: root.SUPABASE_KEY || root.ForgeAPI.config.key });
  }
  root.ForgeStudentCode = {
    clean: clean,
    join: function (classCode, studentCode, name) {
      return rpc('join_class_with_student_code', {
        p_class_code: String(classCode || '').trim().toUpperCase(),
        p_student_code: clean(studentCode),
        p_name: String(name || '').trim()
      }).then(function (rows) {
        if (!Array.isArray(rows) || !rows[0]) throw new Error('Student code or class code not recognised.');
        return rows[0];
      });
    },
    responses: function (studentId, classCode, studentCode) {
      return rpc('get_student_own_responses_with_code', {
        p_student_id: studentId,
        p_class_code: String(classCode || '').trim().toUpperCase(),
        p_student_code: clean(studentCode)
      });
    },
    assignments: function (studentId, classCode, studentCode, name) {
      return rpc('get_student_assignments', {
        p_student_id: studentId,
        p_class_code: String(classCode || '').trim().toUpperCase(),
        p_student_code: clean(studentCode),
        p_name: String(name || '').trim()
      });
    },
    recordResponse: function (studentId, classCode, studentCode, row) {
      row = row || {};
      function payload(assignmentId) {
        return {
          p_student_id: studentId,
          p_class_code: String(classCode || '').trim().toUpperCase(),
          p_student_code: clean(studentCode),
          p_question_id: row.question_id,
          p_bank: row.bank,
          p_subject: row.subject,
          p_selected_option: row.selected_option,
          p_is_correct: !!row.is_correct,
          p_misconception_tag: row.misconception_tag || null,
          p_spec_point: row.spec_point || null,
          p_reforge_attempted: !!row.reforge_attempted,
          p_reforge_correct: row.reforge_correct == null ? null : !!row.reforge_correct,
          p_assignment_id: assignmentId || null
        };
      }

      return rpc('record_student_response_with_code', payload(row.assignment_id)).then(function (result) {
        // The RPC refuses an assignment id that does not belong to this class.
        // A stale link must not cost the student their answer, so record it
        // again unattributed rather than failing the write.
        if (result && result.allowed === false && result.reason === 'invalid_assignment' && row.assignment_id) {
          return rpc('record_student_response_with_code', payload(null));
        }
        return result;
      }).then(function (result) {
        if (!result || result.allowed !== true) throw new Error('Student response session is not valid.');
        return result;
      });
    }
  };
}(window));
