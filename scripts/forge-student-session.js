/* S6 — Keep a coded student's session from outliving their use of the device.
 *
 * A coded student's `forge-student` entry holds their class code and their
 * private student code in clear text, because the browser has to present both
 * on every write (record_student_response_with_code takes them as arguments).
 * That part is inherent to the model. What was avoidable is how long the entry
 * survived: it was written once and never expired, so on a shared classroom
 * machine the next person to open Forge inherited the previous student's
 * identity — and their code.
 *
 * This adds an idle lifetime to that entry, and lets a student say at join
 * time that the device is not theirs:
 *
 *   personal device   14 days idle  — the usual "it remembers me" behaviour
 *   shared device      1 hour idle  — about a lesson
 *
 * Expiry is idle-based rather than tied to page unload on purpose: every
 * in-app navigation is a fresh document, so clearing on unload would sign a
 * student out between the quiz and their Anvil. Each page load refreshes the
 * stamp instead, so an active session is never interrupted and an abandoned
 * one goes away on its own.
 *
 * Load this before the page's own script on any page that reads
 * `forge-student`. It is intentionally free of dependencies.
 */
(function (root) {
  var SESSION_KEY = 'forge-student';
  var STAMP_KEY = 'forge-student-last-seen';
  var SHARED_KEY = 'forge-student-shared-device';

  var IDLE_PERSONAL_MS = 14 * 24 * 60 * 60 * 1000;
  var IDLE_SHARED_MS = 60 * 60 * 1000;

  // Mirrors _clearDerivedStudentState() in forge-auth.js: the session entry is
  // not the only thing that identifies a student to the next person at the
  // keyboard, so an expiry that left these behind would only half-work.
  var DERIVED_KEYS = [
    'forge-free-session',
    'forge-paid-student',
    'forge-anvil-open',
    'forge-assigned-open-current'
  ];
  var DERIVED_PREFIXES = [/^forge-assigned-open:/, /^forge-assignment-seen:/, /^forge-notification-state:/];

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function drop(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function isShared() {
    return read(SHARED_KEY) === '1';
  }

  function idleLimit() {
    return isShared() ? IDLE_SHARED_MS : IDLE_PERSONAL_MS;
  }

  function clearSession() {
    drop(SESSION_KEY);
    drop(STAMP_KEY);
    DERIVED_KEYS.forEach(drop);
    try {
      var doomed = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && DERIVED_PREFIXES.some(function (re) { return re.test(key); })) doomed.push(key);
      }
      doomed.forEach(drop);
    } catch (e) {}
  }

  function touch() {
    if (!read(SESSION_KEY)) return;
    write(STAMP_KEY, String(Date.now()));
  }

  // Returns true when a stale session was found and removed.
  function sweep() {
    if (!read(SESSION_KEY)) {
      // Signed out elsewhere: the pages each clear `forge-student` directly.
      // Tidy the stamp and the shared-device flag so the next student starts
      // clean without every sign-out path needing to know about them.
      drop(STAMP_KEY);
      drop(SHARED_KEY);
      return false;
    }
    var stamp = parseInt(read(STAMP_KEY) || '', 10);
    if (!stamp) { touch(); return false; }   // pre-existing session: start the clock now
    if (Date.now() - stamp <= idleLimit()) return false;
    clearSession();
    drop(SHARED_KEY);
    return true;
  }

  root.ForgeStudentSession = {
    /* Call when a student joins. `shared` marks the device as not theirs. */
    begin: function (shared) {
      if (shared) write(SHARED_KEY, '1'); else drop(SHARED_KEY);
      touch();
    },
    isSharedDevice: isShared,
    touch: touch,
    sweep: sweep,
    /* Explicit sign-out, for the shell's Sign out control. */
    end: function () { clearSession(); drop(SHARED_KEY); }
  };

  sweep();
  touch();

  // Keep an in-use session alive without writing on every event.
  var lastTouch = Date.now();
  ['click', 'keydown', 'visibilitychange'].forEach(function (type) {
    root.addEventListener(type, function () {
      if (Date.now() - lastTouch < 60000) return;
      lastTouch = Date.now();
      touch();
    }, { passive: true });
  });
}(window));
