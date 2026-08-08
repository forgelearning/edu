// Shared role/session coordinator for the authenticated Forge surfaces.
// Student and teacher credentials intentionally remain separate; this file
// only records which role is currently driving the app shell and prevents a
// stale session from opening the other role's pages.
(function () {
  var ROLE_KEY = 'forge-active-role';
  var STUDENT_KEY = 'forge-student';
  var PAID_STUDENT_KEY = 'forge-paid-student';
  var FREE_STUDENT_KEY = 'forge-free-session';
  var TEACHER_KEY = 'forge-teacher-session';

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }

  window.ForgeRole = {
    get: function () {
      try {
        var role = localStorage.getItem(ROLE_KEY);
        return role === 'student' || role === 'teacher' ? role : null;
      } catch (e) { return null; }
    },
    set: function (role) {
      if (role !== 'student' && role !== 'teacher') return;
      try { localStorage.setItem(ROLE_KEY, role); } catch (e) {}
    },
    clear: function (role) {
      try {
        if (!role || localStorage.getItem(ROLE_KEY) === role) localStorage.removeItem(ROLE_KEY);
      } catch (e) {}
    },
    hasStudentSession: function () {
      return !!(read(STUDENT_KEY) || read(PAID_STUDENT_KEY) || read(FREE_STUDENT_KEY));
    },
    hasTeacherSession: function () {
      var session = read(TEACHER_KEY);
      return !!(session && session.access_token);
    },
    require: function (role, redirect) {
      var hasSession = role === 'student' ? this.hasStudentSession() : this.hasTeacherSession();
      if (!hasSession) {
        window.location.replace(redirect || (role === 'student' ? 'student-dashboard.html' : 'teacher.html'));
        return false;
      }
      return this.guard(role, redirect);
    },
    guard: function (role, redirect) {
      var active = this.get();
      var conflicting = role === 'student'
        ? active === 'teacher' && this.hasTeacherSession()
        : active === 'student' && this.hasStudentSession();
      if (conflicting) {
        window.location.replace(redirect || (role === 'student' ? 'teacher.html' : 'student-dashboard.html'));
        return false;
      }
      this.set(role);
      return true;
    }
  };
}());
