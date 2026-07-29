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
    if (list().some(function (c) { return c.classId === session.classId; })) return list();
    return add({
      classId:     session.classId,
      classCode:   session.classCode   || null,
      className:   session.className   || null,
      subject:     session.classSubject || null,
      studentId:   session.studentId   || null,
      studentName: session.studentName || null
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
      return fetch(supabaseUrl + '/rest/v1/rpc/get_class_by_code', {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': 'Bearer ' + supabaseKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_code: c.classCode })
      }).then(function (r) { return r.json(); }).then(function (rows) {
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
      return fetch(supabaseUrl + '/rest/v1/rpc/get_student_own_responses', {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': 'Bearer ' + supabaseKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_student_id: c.studentId, p_code: c.classCode, p_name: c.studentName || fallbackName })
      }).then(function (r) { return r.json(); }).then(function (rows) {
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
    return fetch(supabaseUrl + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { 'apikey': supabaseKey, 'Authorization': 'Bearer ' + supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  /* Replace this student's cached classes with the server's view. `anchor` is
   * the row they signed in with: {studentId, classCode, studentName}. Its own
   * code is the only one we know, so it is re-attached to its entry; the
   * others keep whatever code this device had cached, which is nothing on a
   * device they haven't used before. That's fine — responses come back
   * through get_linked_responses, which needs no per-class code. */
  function syncFromServer(supabaseUrl, supabaseKey, anchor, done) {
    if (!anchor || !anchor.studentId || !anchor.classCode || !anchor.studentName) { done && done(list()); return; }
    use(anchor.studentName);

    rpc(supabaseUrl, supabaseKey, 'get_linked_classes', {
      p_student_id: anchor.studentId, p_code: anchor.classCode, p_name: anchor.studentName
    }).then(function (rows) {
      if (!Array.isArray(rows) || !rows.length) { done && done(list()); return; }

      var known = {};
      load().forEach(function (c) { if (c.classId) known[c.classId] = c; });

      var mine = rows.map(function (r) {
        var cached = known[r.class_id] || {};
        return {
          classId:     r.class_id,
          classCode:   r.student_id === anchor.studentId ? anchor.classCode : (cached.classCode || null),
          className:   r.class_name || cached.className || null,
          subject:     r.subject || cached.subject || null,
          studentId:   r.student_id,
          studentName: anchor.studentName
        };
      });

      /* Keep other students' entries on this device untouched. */
      var others = load().filter(function (c) { return norm(c.studentName) !== norm(anchor.studentName); });
      save(others.concat(mine));
      done && done(list());
    }).catch(function () { done && done(list()); });
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

  /* Responses across every linked class, oldest first — one call, no
   * per-class codes needed. Falls back to the per-class route when the
   * student has no server link yet. */
  function fetchLinkedResponses(supabaseUrl, supabaseKey, anchor, done) {
    if (!anchor || !anchor.studentId || !anchor.classCode || !anchor.studentName) {
      fetchAllResponses(supabaseUrl, supabaseKey, anchor && anchor.studentName, done);
      return;
    }
    rpc(supabaseUrl, supabaseKey, 'get_linked_responses', {
      p_student_id: anchor.studentId, p_code: anchor.classCode, p_name: anchor.studentName
    }).then(function (rows) {
      if (!Array.isArray(rows)) { fetchAllResponses(supabaseUrl, supabaseKey, anchor.studentName, done); return; }
      done(rows.map(function (r) {
        r._studentId = r.link_student_id;
        r._classId   = r.link_class_id;
        r._subject   = r.link_subject;
        return r;
      }));
    }).catch(function () { fetchAllResponses(supabaseUrl, supabaseKey, anchor.studentName, done); });
  }

  global.ForgeClasses = {
    use: use, list: list, load: load, save: save,
    add: add, remove: remove, clear: clear,
    forSubject: forSubject, subjects: subjects, adopt: adopt,
    backfillSubjects: backfillSubjects, fetchAllResponses: fetchAllResponses,
    syncFromServer: syncFromServer, linkToServer: linkToServer,
    fetchLinkedResponses: fetchLinkedResponses
  };
})(window);
