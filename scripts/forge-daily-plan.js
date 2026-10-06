/* Today's plan on Home: up to three steps, ticked off from what the student
   has actually done today. Replaces a single "Today" card that named one
   activity and said nothing once it was done.

   Order: assigned work, a mistake to repair, due revision cards, then a
   practice set to fill any spare place. A step is ticked from saved answers
   (practice and repair) or today's card ratings (revision). */
(function (root) {
  var SET_SIZE = 8;
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isToday(value, now) {
    var t = Date.parse(value || '');
    return Number.isFinite(t) && new Date(t).toDateString() === now.toDateString();
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  function build(input) {
    var setSize = Number(input.practiceSetSize) || SET_SIZE;
    var now = input.now || new Date();
    var rows = (input.responses || []).filter(function (r) { return r && isToday(r.created_at, now); });
    var practised = rows.filter(function (r) {
      var id = String(r.question_id || '');
      return !r.reforge_attempted && !/-ANVIL$|-CRU$/.test(id);
    }).length;
    var repairedToday = rows.filter(function (r) {
      return /-ANVIL$/.test(String(r.question_id || '')) ? !!r.is_correct : !!(r.reforge_attempted && r.reforge_correct);
    }).length;
    var steps = [];

    var a = input.assignment;
    if (a) steps.push({
      key: 'assignment', title: a.title || 'Assigned work', detail: a.when || 'Set by your teacher',
      href: 'assignments.html', cta: a.cta || 'Open assignment', done: false
    });

    var mistakes = input.activeMistakes || 0;
    if (mistakes || repairedToday) steps.push({
      key: 'repair', title: 'Work on a mistake',
      detail: mistakes ? plural(mistakes, 'idea', 'ideas') + ' to repair' : 'All repaired',
      href: 'anvil.html', cta: 'Repair mistakes', done: repairedToday > 0
    });

    var due = input.revisionDue || 0, reviewed = input.reviewedToday || 0;
    if (due || reviewed) steps.push({
      key: 'revision', title: 'Review due cards',
      detail: due ? plural(due, 'card', 'cards') + ' due' : plural(reviewed, 'card', 'cards') + ' reviewed today',
      href: input.revisionHref || 'revision.html', cta: 'Review cards', done: !due && reviewed > 0
    });

    if (steps.length < 3) steps.push({
      key: 'practice', title: input.practiceTitle || 'Practise a topic',
      detail: practised >= setSize ? plural(practised, 'question', 'questions') + ' answered today' : 'A short set of ' + setSize + ' questions',
      href: input.practiceHref || 'forge-quiz.html', cta: 'Start practice', done: practised >= setSize
    });

    steps = steps.slice(0, 3);
    return { steps: steps, done: steps.length > 0 && steps.every(function (s) { return s.done; }) };
  }

  function html(plan) {
    var next = plan.steps.filter(function (s) { return !s.done; })[0] || null;
    var h = '<section class="dashboard-plan" aria-labelledby="dashboard-plan-title">';
    h += '<div class="dashboard-plan__head"><h2 id="dashboard-plan-title">Today’s plan</h2>';
    h += '<span>' + plan.steps.filter(function (s) { return s.done; }).length + ' of ' + plan.steps.length + ' done</span></div>';
    if (plan.done) h += '<p class="dashboard-plan__done" role="status">Today’s plan is done. Come back tomorrow, or keep going if you like.</p>';
    h += '<ol class="dashboard-plan__steps">';
    plan.steps.forEach(function (s, i) {
      var current = next && s.key === next.key;
      h += '<li class="dashboard-plan__step' + (s.done ? ' is-done' : '') + (current ? ' is-next' : '') + '">';
      h += '<span class="dashboard-plan__mark" aria-hidden="true">' + (s.done ? '✓' : (i + 1)) + '</span>';
      h += '<div><strong>' + esc(s.title) + '</strong><small>' + esc(s.detail) + (s.done ? '<span class="forge-visually-hidden"> (done)</span>' : '') + '</small></div>';
      h += '<a class="forge-button ' + (current ? 'forge-button--primary' : 'forge-button--secondary') + '" href="' + esc(s.href) + '" data-plan-step="' + esc(s.key) + '">' + esc(s.done ? 'Do more' : s.cta) + (current ? ' →' : '') + '</a>';
      h += '</li>';
    });
    return h + '</ol></section>';
  }

  root.ForgeDailyPlan = { build: build, html: html, SET_SIZE: SET_SIZE };
})(typeof window !== 'undefined' ? window : globalThis);
