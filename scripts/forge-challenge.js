/* Class Challenge: an assignment where every student answers the same fixed
   questions on their own, sees how the class answered after each one, and the
   teacher shows the results on the board next lesson.

   Shared by the teacher page (creating one), Practice (answering) and Class
   Mode (results). The database side is 20261004150000_class_challenge.sql. */
(function (root) {
  var SIZE = 10;
  var MIN_SHOWN = 5; // no breakdown until this many classmates have answered

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isChallenge(assignment) {
    var ids = assignment && assignment.challenge_question_ids;
    return Array.isArray(ids) && ids.length > 0;
  }

  // Ten multiple-choice questions from one topic, fixed when the teacher sets
  // it so everyone answers the same set. Tagged questions first: a wrong
  // answer then names a misconception the board can teach from.
  function pickQuestions(questions, size, random) {
    random = random || Math.random;
    var pool = (questions || []).filter(function (q) { return q && q.id && !q.type && q.options && q.correct; });
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(random() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    pool.sort(function (a, b) { return (b.tag ? 1 : 0) - (a.tag ? 1 : 0); });
    return pool.slice(0, size || SIZE).map(function (q) { return q.id; });
  }

  // Each student's first attempt at each challenge question, counted per
  // option. Used by Class Mode from responses the teacher can already read.
  function tally(responses, questionIds) {
    var out = {};
    (questionIds || []).forEach(function (id) { out[id] = { answered: 0, options: {}, tags: {} }; });
    var seen = {};
    (responses || []).slice().sort(function (a, b) { return String(a.created_at || '').localeCompare(String(b.created_at || '')); })
      .forEach(function (r) {
        if (!r || r.reforge_attempted || !out[r.question_id]) return;
        var key = r.student_id + '|' + r.question_id;
        if (seen[key]) return;
        seen[key] = true;
        var q = out[r.question_id];
        q.answered++;
        q.options[r.selected_option] = (q.options[r.selected_option] || 0) + 1;
        if (!r.is_correct && r.misconception_tag) q.tags[r.misconception_tag] = (q.tags[r.misconception_tag] || 0) + 1;
      });
    return out;
  }

  // Bars for each option. `counts` is {answered, options, hidden}; `chosen`
  // marks the student's own answer; `reveal` marks the correct one.
  function barsHtml(question, counts, opts) {
    opts = opts || {};
    var keys = Object.keys(question.options || {});
    var total = counts.answered || 0;
    var h = '<ol class="forge-class-bars">';
    keys.forEach(function (k) {
      var n = (counts.options || {})[k] || 0, pct = total ? Math.round(n / total * 100) : 0;
      var cls = (opts.reveal && k === question.correct ? ' is-correct' : '') + (k === opts.chosen ? ' is-chosen' : '');
      h += '<li class="forge-class-bar' + cls + '"><span class="forge-class-bar__key">' + esc(k) + '</span>'
        + '<span class="forge-class-bar__track"><span style="width:' + pct + '%"></span></span>'
        + '<span class="forge-class-bar__n">' + pct + '%<span class="forge-visually-hidden"> (' + n + ' of ' + total + ')</span></span></li>';
    });
    return h + '</ol>';
  }

  function classAnswersHtml(question, result, chosen) {
    var h = '<div class="forge-class-answers" role="status"><strong>How your class answered</strong>';
    if (!result || result.allowed === false) return h + '<p>Class answers are not available for this question.</p></div>';
    if (result.hidden) {
      var left = MIN_SHOWN - (result.answered || 0);
      return h + '<p>' + (result.answered || 0) + ' so far. You will see the class’s answers once ' + Math.max(1, left) + ' more ' + (left === 1 ? 'classmate has' : 'classmates have') + ' answered.</p></div>';
    }
    return h + '<p>' + result.answered + ' people in your class have answered.</p>' + barsHtml(question, result, { chosen: chosen, reveal: true }) + '</div>';
  }

  function fetchClassAnswers(context, assignmentId, questionId) {
    if (!root.ForgeAPI || !context || !context.studentId || !context.classCode) return Promise.resolve(null);
    return root.ForgeAPI.rpc('get_challenge_answers', {
      p_student_id: String(context.studentId),
      p_class_code: String(context.classCode || '').trim().toUpperCase(),
      p_student_code: context.studentCode || null,
      p_name: context.studentName || null,
      p_assignment_id: assignmentId,
      p_question_id: questionId
    }).catch(function () { return null; });
  }

  root.ForgeChallenge = { SIZE: SIZE, MIN_SHOWN: MIN_SHOWN, isChallenge: isChallenge, pickQuestions: pickQuestions, tally: tally, barsHtml: barsHtml, classAnswersHtml: classAnswersHtml, fetchClassAnswers: fetchClassAnswers };
})(typeof window !== 'undefined' ? window : globalThis);
