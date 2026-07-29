/* Linked classes — the set of classes a student has joined on this device.
 *
 * Students have no account of their own: teachers hand out one class code per
 * class, and joining each code creates its own row in `students` (keyed to
 * that class). Keeping the rows separate is what lets each teacher see their
 * own subject's data, so this list stores the student row id alongside each
 * class rather than trying to collapse them into one identity.
 *
 * Shared by forge-quiz.html and crucible.html so a class joined in one shows
 * up in the other. */
(function (global) {
  var KEY = 'forge-classes';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; }
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
    return list;
  }

  /* Re-joining a class updates its entry in place rather than duplicating it
     or shuffling the subject order the student is used to seeing. */
  function add(entry) {
    if (!entry || !entry.classId) return load();
    var list = load();
    var at = list.findIndex(function (c) { return c.classId === entry.classId; });
    if (at === -1) list.push(entry); else list[at] = entry;
    return save(list);
  }

  function remove(classId) {
    return save(load().filter(function (c) { return c.classId !== classId; }));
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  function forSubject(subject) {
    return load().filter(function (c) { return c.subject === subject; })[0] || null;
  }

  /* Subjects in join order, de-duplicated. Pass the SUBJECTS map to drop
     classes whose subject has no question bank yet. */
  function subjects(known) {
    var seen = {}, out = [];
    load().forEach(function (c) {
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
    if (!session || !session.classId) return load();
    if (load().some(function (c) { return c.classId === session.classId; })) return load();
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
    var list = load();
    var stale = list.filter(function (c) { return c.classCode && !c.subject; });
    if (!stale.length) { done && done(list); return; }

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
      done && done(save(list));
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
    var list = load().filter(function (c) { return c.studentId && c.classCode; });
    if (!list.length) { done([]); return; }

    Promise.all(list.map(function (c) {
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

  global.ForgeClasses = {
    load: load, save: save, add: add, remove: remove, clear: clear,
    forSubject: forSubject, subjects: subjects, adopt: adopt,
    backfillSubjects: backfillSubjects, fetchAllResponses: fetchAllResponses
  };
})(window);
