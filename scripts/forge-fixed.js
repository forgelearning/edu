/* "Fixed for good": a fresh check, about a week later, that a repaired
   mistake has stayed repaired.

   A repair is a right answer to the similar question after a mistake, or a
   right answer in Repair mistakes. Both rows carry the misconception tag. A
   week after the latest repair of an idea, its check is due: one fresh
   question on that idea, asked from Home or Repair mistakes. Right, and the
   idea is fixed for good. Wrong, and it is open again, exactly like any other
   mistake (scripts/forge-misconception-state.js counts the wrong answer as a
   fire), so it goes back to Repair mistakes.

   Check answers are saved as ordinary answers with the question id suffixed
   "-CHK" and the misconception tag set whether right or wrong, so this can be
   worked out from saved answers alone, on any page, without loading the
   question banks. Like the badges it feeds, it cannot be set from the
   browser. They earn ordinary XP: the league's server rules and
   ForgeRewards.quizXpFromResponses both treat an unrecognised suffix as a
   normal answer. */
(function (root) {
  'use strict';
  var DAY = 86400000;
  var WAIT = 7 * DAY;
  var MAX_SET = 5;

  function id(r) { return String(r && r.question_id || ''); }
  function isRepair(r) { return /-ANVIL$/.test(id(r)) ? !!r.is_correct : !!(r && r.reforge_attempted && r.reforge_correct); }
  function isCheck(r) { return /-CHK$/.test(id(r)); }
  function baseId(value) { return String(value || '').replace(/-(RF|ANVIL|CHK|CRU\d*)$/, ''); }

  // Per idea: 'waiting' (repaired, not yet a week), 'due', 'fixed' (passed a
  // check since its latest repair) or 'slipped' (failed one; it is a mistake
  // to repair again). fixed: ideas that have ever passed a check.
  function summarize(rows, now) {
    now = Number(now) || Date.now();
    var ideas = {};
    (rows || []).map(function (r, i) { return { r: r, i: i, t: Date.parse(r && r.created_at || '') || 0 }; })
      .sort(function (a, b) { return a.t - b.t || a.i - b.i; })
      .forEach(function (item) {
        var r = item.r, tag = r && r.misconception_tag;
        if (!tag) return;
        var s = ideas[tag] || (ideas[tag] = { tag: tag, status: null, repairedAt: 0, checkedAt: 0, everFixed: false, repairedIds: {} });
        if (isRepair(r)) {
          s.repairedAt = item.t; s.status = 'waiting';
          if (r.subject && r.subject !== 'anvil' && r.subject !== 'crucible') s.subject = r.subject;
          s.repairedIds[baseId(r.question_id)] = true;
        } else if (isCheck(r) && s.status === 'waiting') {
          s.checkedAt = item.t;
          s.status = r.is_correct ? 'fixed' : 'slipped';
          if (r.is_correct) s.everFixed = true;
        }
      });
    var due = [], waiting = [], fixed = [], slipped = [], nextDueAt = null;
    Object.keys(ideas).forEach(function (tag) {
      var s = ideas[tag];
      if (s.status === 'waiting') {
        if (now - s.repairedAt >= WAIT) { s.status = 'due'; due.push(s); }
        else { waiting.push(s); if (nextDueAt == null || s.repairedAt + WAIT < nextDueAt) nextDueAt = s.repairedAt + WAIT; }
      }
      if (s.status === 'slipped') slipped.push(s);
      if (s.everFixed) fixed.push(s);
    });
    // Oldest repairs first: they have waited longest.
    due.sort(function (a, b) { return a.repairedAt - b.repairedAt; });
    return { ideas: ideas, due: due, waiting: waiting, fixed: fixed, slipped: slipped, nextDueAt: nextDueAt };
  }

  // The questions for a check set: one fresh question for each due idea (up
  // to five), from the given banks. Fresh means not the question that was
  // got wrong or repaired, and not one answered before, where possible.
  // banks: BANKS-like object with full questions loaded.
  function pickQuestions(due, banks, rows, opts) {
    opts = opts || {};
    var limit = opts.limit || MAX_SET;
    var answered = {};
    (rows || []).forEach(function (r) { answered[baseId(r.question_id)] = true; });
    var tagOf = function (q) { return Array.isArray(q.tag) ? q.tag[0] : q.tag; };
    var byTag = {};
    Object.keys(banks || {}).forEach(function (bank) {
      ((banks[bank] && banks[bank].questions) || []).forEach(function (q) {
        if (!q.id || !q.options || !q.correct || (q.type && q.type !== 'mcq')) return;
        var tag = tagOf(q);
        if (tag) (byTag[tag] = byTag[tag] || []).push({ bank: bank, question: q });
      });
    });
    var out = [];
    (due || []).forEach(function (idea) {
      if (out.length >= limit) return;
      var pool = (byTag[idea.tag] || []).filter(function (c) { return !idea.repairedIds[c.question.id]; });
      if (!pool.length) return;
      var fresh = pool.filter(function (c) { return !answered[c.question.id]; });
      var list = fresh.length ? fresh : pool;
      // Stable choice, so reopening the page offers the same question.
      var seed = 0;
      for (var i = 0; i < idea.tag.length; i++) seed = (seed * 31 + idea.tag.charCodeAt(i)) >>> 0;
      out.push({ tag: idea.tag, bank: list[seed % list.length].bank, question: list[seed % list.length].question });
    });
    return out;
  }

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  // Where a check set starts: the subject of the idea that has waited
  // longest. A set stays within one subject, since it loads that subject's
  // questions; ideas from another subject wait for the next set.
  function href(summary, fallbackSubject) {
    var first = summary && summary.due[0];
    var subject = first && first.subject || fallbackSubject;
    return 'forge-quiz.html?check=1' + (subject ? '&subject=' + encodeURIComponent(subject) : '');
  }

  // A card for Repair mistakes when checks are due.
  function cardHtml(summary, href) {
    var n = summary && summary.due.length || 0;
    if (!n) return '';
    var shown = Math.min(n, MAX_SET);
    return '<section class="forge-fixed-card" aria-labelledby="forge-fixed-title">'
      + '<div><span class="forge-fixed-card__kicker">Did it stick?</span>'
      + '<h2 id="forge-fixed-title">' + plural(n, 'fix is', 'fixes are') + ' ready to check</h2>'
      + '<p>' + (shown === 1 ? 'One fresh question' : shown + ' fresh questions') + ' on ideas you repaired a week or more ago. Get one right and it’s fixed for good.</p></div>'
      + '<a class="forge-button forge-button--primary" href="' + href + '">Check ' + (shown === 1 ? 'it' : 'them') + ' →</a></section>';
  }

  root.ForgeFixed = { WAIT: WAIT, MAX_SET: MAX_SET, isCheck: isCheck, isRepair: isRepair, baseId: baseId, summarize: summarize, pickQuestions: pickQuestions, href: href, cardHtml: cardHtml };
}(typeof window !== 'undefined' ? window : globalThis));
