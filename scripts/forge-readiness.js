/* Readiness: one number for "how ready am I?" in a subject.

   Students saw five progress numbers (XP, accuracy, topic marks, mastery
   bars, mistakes cleared) and none answered that question
   (docs/product/student-ux-review.md). Up Learn answers it with one score
   and a coloured ring per section; this does the same from what Forge
   already measures, so the topic rings (scripts/forge-topic-mastery.js) and
   the number always agree.

   Topic score, 0-100:
     - recent accuracy: right first answers, without a hint, in the latest ten
     - scaled down until there are eight answers, so two lucky answers are not 100
     - minus 10 for each mistake in the topic still to repair (at most 30)
     - fades after three weeks without practice in the topic (x0.85), more
       after six (x0.7): memory fades, and the way back is a short set
     - plus 5 for each idea in the topic fixed for good (at most 10)
   Subject score: the average over every topic in the course. Topics not yet
   started count as 0, so the number means the whole exam; the card says how
   many topics are started and the average in those ("4 of 15 topics started
   · 84% in those"), so a low score early in a course reads fairly.

   Bands: 0-39 Getting started, 40-69 Building, 70-89 Strong, 90+ Exam-ready.

   Built only from saved answers, like the badges, so it reads the same on
   every page and device. */
(function (root) {
  'use strict';

  var DAY = 86400000;
  var BANDS = [
    { min: 90, key: 'ready', label: 'Exam-ready' },
    { min: 70, key: 'strong', label: 'Strong' },
    { min: 40, key: 'building', label: 'Building' },
    { min: 0, key: 'starting', label: 'Getting started' }
  ];
  var AIM = 90;
  var TM = function () { return root.ForgeTopicMastery; };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function band(score) {
    for (var i = 0; i < BANDS.length; i++) if (score >= BANDS[i].min) return BANDS[i];
    return BANDS[BANDS.length - 1];
  }
  function isFirstAttempt(r) {
    var id = String(r && r.question_id || '');
    return r && !r.reforge_attempted && !/-ANVIL$|-CRU$/.test(id);
  }

  function topic(rows, bank, open, now, fixedByBank) {
    var status = TM().status(rows, bank, open);
    if (status.key === 'none') return { bank: bank, score: 0, status: status, fade: 1, started: false };
    var latest = 0;
    rows.forEach(function (r) {
      if (r.bank !== bank || !isFirstAttempt(r)) return;
      var t = Date.parse(r.created_at || '') || 0;
      if (t > latest) latest = t;
    });
    var age = latest ? (now - latest) / DAY : 0;
    var fade = age > 42 ? .7 : age > 21 ? .85 : 1;
    var score = status.percent * Math.min(1, status.answered / TM().MIN_ANSWERS);
    score -= Math.min(30, status.open * 10);
    score *= fade;
    score += Math.min(10, (fixedByBank[bank] || 0) * 5);
    return { bank: bank, score: Math.max(0, Math.min(100, Math.round(score))), status: status, fade: fade, started: true, daysSince: Math.floor(age) };
  }

  // rows: saved answers; banks: the subject's topic keys, in course order.
  function subject(rows, banks, now) {
    rows = rows || [];
    now = now instanceof Date ? now.getTime() : (Number(now) || Date.now());
    var open = TM().openTags(rows);
    // Ideas fixed for good, per topic: a right "Did it stick?" check.
    var fixedTags = {};
    rows.forEach(function (r) {
      if (r && r.is_correct && /-CHK$/.test(String(r.question_id || '')) && r.misconception_tag && r.bank) {
        (fixedTags[r.bank] = fixedTags[r.bank] || {})[r.misconception_tag] = true;
      }
    });
    var fixedByBank = {};
    Object.keys(fixedTags).forEach(function (b) { fixedByBank[b] = Object.keys(fixedTags[b]).length; });
    var topics = (banks || []).map(function (b) { return topic(rows, b, open, now, fixedByBank); });
    var score = topics.length ? Math.round(topics.reduce(function (n, t) { return n + t.score; }, 0) / topics.length) : 0;
    var started = topics.filter(function (t) { return t.started; });
    // The quickest way to raise the score: the weakest topic already
    // started, while one is under 70; then a topic not yet started.
    var weak = started.filter(function (t) { return t.score < 70; }).sort(function (a, b) { return a.score - b.score; })[0];
    var fresh = topics.filter(function (t) { return !t.started; })[0];
    var next = weak ? { bank: weak.bank, score: weak.score, why: weak.fade < 1 ? 'faded' : weak.status.open ? 'repair' : 'weak' }
      : fresh ? { bank: fresh.bank, score: 0, why: 'start' }
      : started.length ? { bank: started.slice().sort(function (a, b) { return a.score - b.score; })[0].bank, why: 'top-up' } : null;
    if (next && next.why === 'top-up') next.score = topics.filter(function (t) { return t.bank === next.bank; })[0].score;
    // The average over started topics only. Not the score (that would call a
    // student who has done four topics well "ready"), but said beside it, so a
    // low score early in a course is explained by coverage, not by the work.
    var startedAvg = started.length ? Math.round(started.reduce(function (n, t) { return n + t.score; }, 0) / started.length) : null;
    return { score: score, band: band(score), topics: topics, started: started.length, startedAvg: startedAvg, total: topics.length, next: next, aim: AIM };
  }

  function ringSvg(score, size, key) {
    var r = 15.5, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, score)) / 100);
    return '<svg class="forge-readiness-ring forge-readiness-ring--' + key + '" viewBox="0 0 36 36" width="' + size + '" height="' + size + '" aria-hidden="true">'
      + '<circle cx="18" cy="18" r="' + r + '" class="forge-readiness-ring__track"/>'
      + '<circle cx="18" cy="18" r="' + r + '" class="forge-readiness-ring__fill" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/></svg>';
  }

  var WHY = {
    faded: 'You haven’t practised it for a while.',
    repair: 'It has a mistake to repair.',
    weak: 'It’s your weakest topic so far.',
    start: 'You haven’t started it yet.',
    'top-up': 'Every topic is strong. Keep this one topped up.'
  };

  function howHtml() {
    return '<details class="forge-readiness__how"><summary>How it’s worked out</summary><ul>'
      + '<li>Each topic scores up to 100 from your latest ten answers, once you have answered eight.</li>'
      + '<li>A mistake you haven’t repaired takes 10 off its topic.</li>'
      + '<li>A topic fades a little after three weeks without practice.</li>'
      + '<li>Ideas you’ve fixed for good add a little.</li>'
      + '<li>Your score is the average over every topic in the course, including ones not started yet.</li></ul></details>';
  }

  // opts: { subjectName, label(bank), href(bank) }
  function cardHtml(summary, opts) {
    opts = opts || {};
    var s = summary, label = opts.label || function (b) { return b; }, href = opts.href || function (b) { return 'forge-quiz.html?bank=' + encodeURIComponent(b); };
    var h = '<section class="forge-readiness forge-readiness--' + s.band.key + '" aria-labelledby="forge-readiness-title">'
      + '<div class="forge-readiness__top"><div class="forge-readiness__ring">' + ringSvg(s.score, 72, s.band.key)
      + '<span class="forge-readiness__num">' + s.score + '<small>%</small></span></div>'
      + '<div><h2 id="forge-readiness-title">Readiness' + (opts.subjectName ? ' · ' + esc(opts.subjectName) : '') + '</h2>'
      + '<p class="forge-readiness__band">' + esc(s.band.label) + '<span> · aim for ' + s.aim + '%</span></p>'
      + '<p class="forge-readiness__topics">' + s.started + ' of ' + s.total + ' topics started'
      + (s.startedAvg != null && s.started < s.total ? ' · ' + s.startedAvg + '% in those' : '') + '</p></div></div>';
    if (s.next) {
      h += '<a class="forge-readiness__next" href="' + esc(href(s.next.bank)) + '"><span><small>Raise it next</small><strong>' + esc(label(s.next.bank))
        + (s.next.why === 'start' ? '' : ' · ' + s.next.score + '%') + '</strong><span>' + esc(WHY[s.next.why]) + '</span></span><span aria-hidden="true">→</span></a>';
    }
    return h + howHtml() + '</section>';
  }

  root.ForgeReadiness = { BANDS: BANDS, AIM: AIM, band: band, subject: subject, ringSvg: ringSvg, cardHtml: cardHtml, howHtml: howHtml };
}(typeof window !== 'undefined' ? window : globalThis));
