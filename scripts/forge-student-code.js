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
    }
  };
}(window));
