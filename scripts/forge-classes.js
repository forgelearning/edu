/* Linked classes — the set of classes a student has joined on this device.
 *
 * Students have no account of their own: teachers hand out one class code per
 * class, and joining each code creates its own row in `students` (keyed to
 * that class). Keeping the rows separate is what lets each teacher see their
 * own subject's data, so this list stores the student row id alongside each
 * class rather than trying to collapse them into one identity.
 *
 * Shared by forge-quiz.html and crucible.html so a class joined in one shows
 * up in the other.
 *
 * Entries are scoped to the student who joined them. Signing out must not
 * discard them — a student signing back in with any one of their codes
 * expects the rest of their classes to still be there — so instead of
 * wiping the list, every read is filtered to the student currently signed
 * in. Call use() as soon as their name is known. */
(function (global) {
  var KEY = 'forge-classes';
  var activeName = null;
  var repairTried = {};

  function norm(n) { return String(n == null ? '' : n).trim().toLowerCase(); }

  /* Every entry on this device, whoever joined it. Internal — callers
     wanting "this student's classes" want list(). */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; }
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
    return list;
  }

  /* Name the student whose classes should be visible. */
  function use(name) {
    activeName = norm(name) || null;
    return list();
  }

  /* This student's classes. Entries predating name scoping have no
     studentName and are shown to whoever is signed in — they can only have
     come from this device's previous single-class session. */
  function list() {
    var all = load();
    if (!activeName) return all;
    return all.filter(function (c) { return !c.studentName || norm(c.studentName) === activeName; });
  }

  /* Re-joining a class updates its entry in place rather than duplicating it
     or shuffling the subject order the student is used to seeing. Entries are
     keyed by class *and* student, so two students sharing a device each keep
     their own row for the same class. */
  function add(entry) {
    if (!entry || !entry.classId) return list();
    /* Joining identifies the student, so a different name here means a
       different student has taken over the device. */
    if (entry.studentName) activeName = norm(entry.studentName);
    var all = load();
    var at = all.findIndex(function (c) {
      return c.classId === entry.classId && norm(c.studentName) === norm(entry.studentName);
    });
    if (at === -1) all.push(entry); else all[at] = entry;
    save(all);
    return list();
  }

  function remove(classId) {
    save(load().filter(function (c) {
      return !(c.classId === classId && (!activeName || norm(c.studentName) === activeName));
    }));
    return list();
  }

  /* Wipe every student's classes on this device. Sign-out deliberately does
     not call this — see the note at the top of the file. */
  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  function forSubject(subject) {
    return list().filter(function (c) { return c.subject === subject; })[0] || null;
  }

  /* Subjects in join order, de-duplicated. Pass the SUBJECTS map to drop
     classes whose subject has no question bank yet. */
  function subjects(known) {
    var seen = {}, out = [];
    list().forEach(function (c) {
      if (!c.subject || seen[c.subject]) return;
      if (known && !known[c.subject]) return;
      seen[c.subject] = true;
      out.push(c.subject);
    });
    return out;
  }

  /* Pull a pre-existing single-class session (the older `forge-student` key)
     into the list, so students who joined before this existed don't have to
     re-enter their first code. */
  function adopt(session) {
    if (!session || !session.classId) return list();
    if (session.studentName) use(session.studentName);
    var existing = list().filter(function (c) { return c.classId === session.classId; })[0];
    if (existing) {
      existing.classCode = existing.classCode || session.classCode || null;
      existing.className = existing.className || session.className || null;
      existing.subject = existing.subject || session.classSubject || null;
      existing.studentCode = existing.studentCode || session.studentCode || null;
      save(list());
      return list();
    }
    return add({
      classId:     session.classId,
      classCode:   session.classCode   || null,
      className:   session.className   || null,
      subject:     session.classSubject || null,
      studentId:   session.studentId   || null,
      studentName: session.studentName || null,
      studentCode: session.studentCode || null
    });
  }

  /* Entries can be missing their subject if they were stored before the class
     had one assigned. get_class_by_code is the only anon-readable route to a
     class record (the table itself has no anon SELECT policy). */
  function backfillSubjects(supabaseUrl, supabaseKey, done) {
    var all = load();
    var stale = all.filter(function (c) { return c.classCode && !c.subject; });
    if (!stale.length) { done && done(list()); return; }

    Promise.all(stale.map(function (c) {
      return rpc(supabaseUrl, supabaseKey, 'get_class_by_code', { p_code: c.classCode }).then(function (rows) {
        var cls = Array.isArray(rows) && rows[0];
        if (cls) {
          c.subject   = cls.subject || null;
          c.className = c.className || cls.name || null;
        }
      }).catch(function () {});
    })).then(function () {
      save(all);
      done && done(list());
    });
  }

  /* Every response across every class joined, oldest first.
   *
   * `responses` has no anon SELECT policy, so each class's rows have to come
   * back through get_student_own_responses — one call per class, since it
   * authorises on that class's student row. Rows are tagged with the class
   * they came from (_studentId/_classId/_subject) so a view acting on one
   * (Anvil re-forging a misconception, say) can write back against the right
   * student row and keep the data with the teacher who owns it. */
  function fetchAllResponses(supabaseUrl, supabaseKey, fallbackName, done) {
    if (fallbackName) use(fallbackName);
    var mine = list().filter(function (c) { return c.studentId && c.classCode; });
    if (!mine.length) { done([]); return; }

    Promise.all(mine.map(function (c) {
      var responsePromise = c.studentCode && global.ForgeStudentCode
        ? global.ForgeStudentCode.responses(c.studentId, c.classCode, c.studentCode)
        : rpc(supabaseUrl, supabaseKey, 'get_student_own_responses', { p_student_id: c.studentId, p_code: c.classCode, p_name: c.studentName || fallbackName });
      return responsePromise.then(function (rows) {
        return (Array.isArray(rows) ? rows : []).map(function (row) {
          row._studentId = c.studentId;
          row._classId   = c.classId;
          row._subject   = c.subject || null;
          return row;
        });
      }).catch(function () { return []; });
    })).then(function (sets) {
      var all = [], seen = {};
      sets.forEach(function (rows) {
        rows.forEach(function (r) {
          var key = r.id || (r._studentId + '|' + r.question_id + '|' + r.created_at);
          if (seen[key]) return;
          seen[key] = true;
          all.push(r);
        });
      });
      /* Chronological — Anvil replays these in order to work out which
         misconceptions are still live. */
      all.sort(function (a, b) { return (a.created_at || '') < (b.created_at || '') ? -1 : 1; });
      done(all);
    });
  }

  /* ── Server-side linking ──────────────────────────────────────────────
   *
   * The local list only knows about classes joined on this device, so a
   * student signing in elsewhere would start empty. students.link_group ties
   * their rows together server-side; these calls read and extend it.
   *
   * Every call is authorised by a (name, code) pair the caller already holds
   * — the same pair they signed in with. Linking needs two such pairs, so
   * only someone holding both codes can merge two groups, which is what
   * keeps students who share a name apart. */
  function rpc(supabaseUrl, supabaseKey, fn, body) {
    if (global.ForgeAPI && global.ForgeAPI.rpc) return global.ForgeAPI.rpc(fn, body, { token: supabaseKey });
    return Promise.reject(new Error('ForgeAPI is unavailable'));
  }

  /* Make the signed-in class the only active class context.
   *
   * Class rows and responses are intentionally isolated. A student may join
   * several classes, but a teacher must only ever see the student row and
   * responses created through that teacher's class code. Do not restore or
   * merge linked rows here: doing so leaks history from another class into
   * the current class dashboard. */
  function syncFromServer(supabaseUrl, supabaseKey, anchor, done) {
    if (!anchor || !anchor.studentId || !anchor.classCode || !anchor.studentName) { done && done(list()); return; }
    use(anchor.studentName);
    var previous = list().filter(function (c) {
      return c.classId === anchor.classId || c.classCode === anchor.classCode;
    })[0] || {};
    var others = load().filter(function (c) { return norm(c.studentName) !== norm(anchor.studentName); });
    save(others.concat([{
      classId: anchor.classId || null,
      classCode: anchor.classCode,
      className: anchor.className || previous.className || null,
      subject: anchor.subject || previous.subject || null,
      studentId: anchor.studentId,
      studentName: anchor.studentName,
      studentCode: anchor.studentCode || previous.studentCode || null
    }]));
    done && done(list());
  }

  /* Record that the same person holds both codes. */
  function linkToServer(supabaseUrl, supabaseKey, anchor, joined, done) {
    if (!anchor || !anchor.studentId || !anchor.classCode ||
        !joined || !joined.studentId || !joined.classCode ||
        anchor.studentId === joined.studentId) { done && done(false); return; }
    rpc(supabaseUrl, supabaseKey, 'link_student_rows', {
      p_name: anchor.studentName,
      p_student_id: anchor.studentId, p_code: anchor.classCode,
      p_other_student_id: joined.studentId, p_other_code: joined.classCode
    }).then(function (res) {
      done && done(!(res && res.code));
    }).catch(function () { done && done(false); });
  }

  /* Responses for the active class only. Never use the cross-class linked
   * response RPC: a teacher's dashboard must not receive another class's
   * history. */
  function fetchLinkedResponses(supabaseUrl, supabaseKey, anchor, done) {
    if (!anchor || !anchor.studentId || !anchor.classCode || !anchor.studentName) {
      fetchAllResponses(supabaseUrl, supabaseKey, anchor && anchor.studentName, done);
      return;
    }
    rpc(supabaseUrl, supabaseKey, 'get_student_own_responses', {
      p_student_id: anchor.studentId, p_code: anchor.classCode, p_name: anchor.studentName
    }).then(function (rows) {
      var mapped = (Array.isArray(rows) ? rows : []).map(function (r) {
        r._studentId = anchor.studentId;
        r._classId   = anchor.classId || null;
        r._subject   = anchor.subject || null;
        return r;
      });
      /* Chronological, same as fetchAllResponses. get_student_own_responses
         returns newest first, and the Anvil replays these in order to work out
         which misconceptions are still live — unsorted, it counts a streak
         backwards and reads a repaired misconception as unrepaired. */
      mapped.sort(function (a, b) { return (a.created_at || '') < (b.created_at || '') ? -1 : 1; });
      done(mapped);
    }).catch(function () { done([]); });
  }

  /* Responses for a free, no-account student.
   *
   * Free students have no class and no class code, so get_student_own_responses
   * can never match them — its EXISTS clause joins students to classes. And a
   * direct read of the responses table is worse than useless: anon has no
   * SELECT policy, so it returns 200 with [], which every caller here would
   * otherwise render as "you have answered nothing".
   *
   * The device's free token is the credential. Sessions created before the
   * token was persisted cannot prove ownership; they resolve to null so the
   * caller can say so rather than claim the student has no history.
   */
  function fetchFreeResponses(supabaseUrl, supabaseKey, freeSession, done) {
    if (!freeSession || !freeSession.studentId || !freeSession.freeToken) { done(null); return; }
    rpc(supabaseUrl, supabaseKey, 'get_free_student_responses', {
      p_student_id: freeSession.studentId,
      p_free_token: freeSession.freeToken
    }).then(function (rows) {
      done(Array.isArray(rows) ? rows : []);
    }).catch(function () { done(null); });
  }

  global.ForgeClasses = {
    use: use, list: list, load: load, save: save,
    add: add, remove: remove, clear: clear,
    forSubject: forSubject, subjects: subjects, adopt: adopt,
    backfillSubjects: backfillSubjects, fetchAllResponses: fetchAllResponses,
    syncFromServer: syncFromServer, linkToServer: linkToServer,
    fetchLinkedResponses: fetchLinkedResponses,
    fetchFreeResponses: fetchFreeResponses
  };
})(window);
