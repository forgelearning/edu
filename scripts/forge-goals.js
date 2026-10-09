/* Daily XP goal.

   A student picks a daily target (50, 100 or 150 XP) and sees today's XP
   against it on Home and in practice, plus how many days this week they met
   it. Asked for by a student, after Up Learn's daily XP goal.

   Deliberately gentler than a goal streak: the week shows "met on 3 of 7
   days" rather than a count that drops to zero after one missed day, and the
   practice streak (scripts/forge-streak.js) already rewards turning up.

   XP is worked out from saved answers with the same rules as everywhere else
   (ForgeRewards.quizXpFromResponses), so progress cannot be set from the
   browser. Match-pairs XP is not counted: the server keeps only its total,
   not when it was earned. Repairs earn two to three times a plain answer, so
   fixing mistakes is the quickest way to the goal, which the card says.

   The chosen level is kept per student on this device, like the colour
   theme. Days and weeks are local calendar days, weeks Monday to Sunday. */
(function (root) {
  'use strict';

  var PREFIX = 'forge-goal:';
  var MET = 'forge-goal-met:';
  var LEVELS = [
    { key: 'light', name: 'Light', xp: 50, about: 'About 5 right answers' },
    { key: 'steady', name: 'Steady', xp: 100, about: 'About a practice set and a repair' },
    { key: 'strong', name: 'Strong', xp: 150, about: 'Two sets, or one set and some repairs' }
  ];
  var DEFAULT = 'light';
  var DAY = 86400000;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function level(key) {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].key === key) return LEVELS[i];
    return null;
  }
  function get(studentId) {
    var key = null;
    try { key = root.localStorage.getItem(PREFIX + (studentId || 'anonymous')); } catch (e) {}
    return level(key) || level(DEFAULT);
  }
  function set(studentId, key) {
    if (!level(key)) return false;
    try { root.localStorage.setItem(PREFIX + (studentId || 'anonymous'), key); return true; } catch (e) { return false; }
  }

  // Local calendar day number, as the streak counts them.
  function dayOf(value) {
    if (root.ForgeStreak && root.ForgeStreak.localDay) return root.ForgeStreak.localDay(value);
    var t = value instanceof Date ? value.getTime() : Date.parse(value || '');
    if (!Number.isFinite(t)) return null;
    var d = new Date(t);
    return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
  }
  function xpOf(rows) {
    if (root.ForgeRewards && root.ForgeRewards.quizXpFromResponses) return root.ForgeRewards.quizXpFromResponses(rows);
    return (rows || []).reduce(function (xp, r) {
      var id = String(r.question_id || '');
      if (/-ANVIL$|-CRU$/.test(id)) return xp + (r.is_correct ? 30 : 0);
      if (r.reforge_attempted) return xp + (r.reforge_correct ? 20 : 0);
      return xp + (r.is_correct ? (r.hint_used ? 5 : 10) : 0);
    }, 0);
  }

  // Today's XP, this week's days (Monday first) and how many met the goal.
  // extraToday: XP earned on this page not yet in rows (the quiz's own
  // answers since it loaded the history).
  function progress(rows, goalXp, now, extraToday) {
    now = now || new Date();
    var today = dayOf(now);
    var weekday = (new Date(now).getDay() + 6) % 7;
    var monday = today - weekday;
    var byDay = {};
    (rows || []).forEach(function (r) {
      var d = dayOf(r && r.created_at);
      if (d == null || d < monday || d > today) return;
      (byDay[d] = byDay[d] || []).push(r);
    });
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = monday + i;
      var xp = byDay[d] ? xpOf(byDay[d]) : 0;
      if (d === today) xp += Math.max(0, Number(extraToday) || 0);
      days.push({ day: d, xp: xp, met: xp >= goalXp, today: d === today, future: d > today });
    }
    var todayXp = days[weekday].xp;
    return {
      goal: goalXp, today: todayXp, pct: Math.min(100, Math.round(todayXp / goalXp * 100)),
      met: todayXp >= goalXp, toGo: Math.max(0, goalXp - todayXp),
      days: days, metDays: days.filter(function (x) { return x.met; }).length,
      weekXp: days.reduce(function (n, x) { return n + x.xp; }, 0)
    };
  }

  // Once per day per student: has today's goal already been celebrated?
  function claimCelebration(studentId, now) {
    var key = MET + (studentId || 'anonymous'), today = String(dayOf(now || new Date()));
    try {
      if (root.localStorage.getItem(key) === today) return false;
      root.localStorage.setItem(key, today);
    } catch (e) { return false; }
    return true;
  }

  function ringSvg(pct, size) {
    var r = 15.5, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return '<svg class="forge-goal-ring" viewBox="0 0 36 36" width="' + size + '" height="' + size + '" aria-hidden="true">'
      + '<circle cx="18" cy="18" r="' + r + '" class="forge-goal-ring__track"/>'
      + '<circle cx="18" cy="18" r="' + r + '" class="forge-goal-ring__fill" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/></svg>';
  }

  var DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // The Home card: ring, today's XP, the week, and a way to change the goal.
  function cardHtml(studentId, rows, now) {
    var lv = get(studentId), p = progress(rows, lv.xp, now);
    var h = '<section class="forge-goal' + (p.met ? ' is-met' : '') + '" aria-labelledby="forge-goal-title">'
      + '<div class="forge-goal__top"><div class="forge-goal__ring">' + ringSvg(p.pct, 64)
      + '<span class="forge-goal__ring-text">' + (p.met ? '✓' : p.pct + '%') + '</span></div>'
      + '<div class="forge-goal__text"><h2 id="forge-goal-title">Daily goal</h2>'
      + '<p class="forge-goal__xp"><strong>' + p.today.toLocaleString('en-GB') + '</strong> of ' + lv.xp + ' XP today</p>'
      + '<p class="forge-goal__next">' + (p.met ? 'Goal met. Anything more is a bonus.' : p.toGo + ' XP to go. Repairing a mistake earns 20–30 XP.') + '</p></div></div>'
      + '<div class="forge-goal__week"><p>Goal met on <strong>' + p.metDays + ' of 7</strong> days this week · ' + p.weekXp.toLocaleString('en-GB') + ' XP</p><ol class="forge-goal__days">';
    p.days.forEach(function (d, i) {
      var state = d.met ? 'met' : d.future ? 'future' : d.today ? 'today' : 'missed';
      h += '<li class="is-' + state + '" title="' + DAY_NAMES[i] + ': ' + d.xp + ' XP"><span aria-hidden="true">' + DAY_LETTERS[i] + '</span>'
        + '<span class="forge-visually-hidden">' + DAY_NAMES[i] + ', ' + (d.future ? 'still to come' : d.met ? 'goal met' : d.xp + ' XP') + '</span></li>';
    });
    h += '</ol></div><details class="forge-goal__change"><summary>Change goal</summary><div class="forge-goal__levels" role="group" aria-label="Daily goal">';
    LEVELS.forEach(function (l) {
      var current = l.key === lv.key;
      h += '<button type="button" class="forge-goal__level' + (current ? ' is-current' : '') + '" data-forge-goal="' + l.key + '" aria-pressed="' + current + '">'
        + '<strong>' + esc(l.name) + ' · ' + l.xp + ' XP</strong><small>' + esc(l.about) + '</small></button>';
    });
    return h + '</div></details></section>';
  }

  // The quiz's small "today" chip.
  function chipHtml(p) {
    return '<span class="forge-goal-chip' + (p.met ? ' is-met' : '') + '" id="forge-goal-chip" title="Daily goal">' + ringSvg(p.pct, 18)
      + '<span>' + (p.met ? 'Goal met · ' : '') + p.today + '/' + p.goal + ' XP today</span></span>';
  }

  // Pages call this once: clicking a level saves it and asks the page to redraw.
  function bind(getStudentId, onChange) {
    if (!root.document || bind.done) return;
    bind.done = true;
    root.document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-forge-goal]');
      if (!btn) return;
      if (set(getStudentId(), btn.getAttribute('data-forge-goal')) && onChange) onChange();
    });
  }

  root.ForgeGoals = { LEVELS: LEVELS, get: get, set: set, progress: progress, claimCelebration: claimCelebration, cardHtml: cardHtml, chipHtml: chipHtml, bind: bind, xpOf: xpOf };
}(typeof window !== 'undefined' ? window : globalThis));
