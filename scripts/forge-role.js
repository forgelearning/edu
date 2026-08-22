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
        // This used to redirect silently. On a shared classroom machine that
        // meant a student who had just joined a class landed on the teacher's
        // dashboard — showing the teacher's email and class codes — with no
        // explanation and no way back. Explain it and offer the way out.
        explainConflict(role, redirect);
        return false;
      }
      this.set(role);
      return true;
    }
  };

  // Deliberately built from DOM nodes rather than innerHTML: this runs before
  // a page's own styles and scripts have necessarily done anything, and it must
  // not depend on them.
  function explainConflict(role, redirect) {
    var target = redirect || (role === 'student' ? 'teacher.html' : 'student-dashboard.html');
    var wantsStudent = role === 'student';

    function build() {
      if (document.getElementById('forge-role-conflict')) return;
      var overlay = document.createElement('div');
      overlay.id = 'forge-role-conflict';
      overlay.setAttribute('role', 'alertdialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'forge-role-conflict-title');

      var card = document.createElement('div');
      card.className = 'forge-role-conflict__card';

      var title = document.createElement('h1');
      title.id = 'forge-role-conflict-title';
      title.textContent = wantsStudent
        ? 'A teacher is signed in on this device'
        : 'A student is signed in on this device';

      var body = document.createElement('p');
      body.textContent = wantsStudent
        ? 'Forge is open as a teacher here, so it can’t start a student session at the same time. Sign the teacher out to carry on as a student — your class join has already been saved.'
        : 'Forge is open as a student here. Sign the student out to carry on as a teacher.';

      var actions = document.createElement('div');
      actions.className = 'forge-role-conflict__actions';

      var signOut = document.createElement('button');
      signOut.type = 'button';
      signOut.className = 'forge-role-conflict__primary';
      signOut.textContent = wantsStudent ? 'Sign the teacher out' : 'Sign the student out';
      // addEventListener rather than .onclick: scripts/ is checked for inline
      // handler assignment by scripts/checks/check-ui-system.js.
      signOut.addEventListener('click', function () {
        try {
          if (wantsStudent) {
            localStorage.removeItem(TEACHER_KEY);
          } else {
            [STUDENT_KEY, PAID_STUDENT_KEY, FREE_STUDENT_KEY].forEach(function (key) {
              localStorage.removeItem(key);
            });
          }
          localStorage.removeItem(ROLE_KEY);
        } catch (e) {}
        window.location.reload();
      });

      var leave = document.createElement('a');
      leave.className = 'forge-role-conflict__secondary';
      leave.href = target;
      leave.textContent = wantsStudent ? 'Go to the teacher dashboard' : 'Go to the student dashboard';

      actions.appendChild(signOut);
      actions.appendChild(leave);
      card.appendChild(title);
      card.appendChild(body);
      card.appendChild(actions);
      overlay.appendChild(card);
      (document.body || document.documentElement).appendChild(overlay);
      signOut.focus();
    }

    if (document.body) build();
    else document.addEventListener('DOMContentLoaded', build);
  }
}());
