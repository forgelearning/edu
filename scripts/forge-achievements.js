/* Achievement badges on the profile.

   XP rewards volume, including volume of easy questions. These reward the
   things that actually help: repairing mistakes, coming back day after day,
   practising under exam conditions, spreading across topics and getting a
   topic secure.

   Built only from saved answers (and the misconception summary derived from
   them), so a badge reads the same on every device and cannot be earned by
   editing local storage. Every measure only ever grows -- the longest streak
   ever, not the current one; a topic that has ever been sharp, not whether it
   is today -- so a badge, once shown, does not disappear.

   Tiers reuse the avatar frame colours in css/components.css. */
(function (root) {
  'use strict';

  var TIERS = [
    { key: 'bronze', name: 'Bronze' },
    { key: 'silver', name: 'Silver' },
    { key: 'gold', name: 'Gold' }
  ];

  // Same reading of a response as the XP rules and topic mastery.
  function id(r) { return String(r && r.question_id || ''); }
  function isRepairMode(r) { return /-ANVIL$/.test(id(r)); }
  function isTimed(r) { return /-CRU$/.test(id(r)); }
  function isFirstAttempt(r) { return r && !r.reforge_attempted && !isRepairMode(r) && !isTimed(r); }

  function byTime(a, b) { return String(a.created_at || '').localeCompare(String(b.created_at || '')); }

  // Longest run of practice days ever, with the same one-day freeze as
  // scripts/forge-streak.js: a gap of one missed day continues a run.
  function longestStreak(responses) {
    var dayOf = root.ForgeStreak && root.ForgeStreak.localDay;
    if (!dayOf) return 0;
    var seen = {};
    responses.forEach(function (r) { var d = dayOf(r.created_at); if (d != null) seen[d] = true; });
    var days = Object.keys(seen).map(Number).sort(function (a, b) { return a - b; });
    var best = 0, run = 0;
    days.forEach(function (d, i) { run = i && d - days[i - 1] <= 2 ? run + 1 : 1; if (run > best) best = run; });
    return best;
  }

  // Topics where, at some point, 8 of the latest 10 first attempts were right
  // without a hint. Topic mastery's "Secure" also needs nothing left to
  // repair, which cannot be replayed from history, so this is the part of it
  // that can be earned for good.
  function sharpenedTopics(firstAttempts, inSubject) {
    var byBank = {};
    firstAttempts.forEach(function (r) { if (r.bank && inSubject(r.bank)) (byBank[r.bank] = byBank[r.bank] || []).push(r); });
    return Object.keys(byBank).filter(function (bank) {
      var rows = byBank[bank].slice().sort(byTime);
      for (var end = 10; end <= rows.length; end++) {
        var right = rows.slice(end - 10, end).filter(function (r) { return r.is_correct && !r.hint_used; }).length;
        if (right >= 8) return true;
      }
      return false;
    }).length;
  }

  var BADGES = [
    { key: 'answers', name: 'Questions answered', icon: 'answers', unit: 'questions', tiers: [10, 100, 500],
      about: 'Answer questions in any practice.' },
    { key: 'repairs', name: 'Mistakes repaired', icon: 'repair', unit: 'repairs', tiers: [5, 25, 100],
      about: 'Get the similar question right after a mistake, or clear one in Repair mistakes.' },
    { key: 'streak', name: 'Longest streak', icon: 'streak', unit: 'days', tiers: [3, 7, 21],
      about: 'Practise on more days in a row. One missed day does not break it.' },
    { key: 'timed', name: 'Timed practice', icon: 'timed', unit: 'correct answers', tiers: [10, 50, 200],
      about: 'Answer correctly in Timed practice, under exam conditions.' },
    // The two topic badges scale with the subject: courses range from 3
    // topics (A-level Chemistry) to 22 (GCSE Economics), so fixed counts made
    // Gold impossible in some subjects and easy in others. tiersFor() turns
    // these shares into counts; `tiers` is the fallback when the page does
    // not know the subject's topic list.
    { key: 'topics', name: 'Topics explored', icon: 'topics', unit: 'topics', tiers: [3, 10, 25], shares: [0.25, 0.5, 1],
      about: 'Answer at least five questions in each topic of your course.' },
    { key: 'sharpened', name: 'Topics sharpened', icon: 'target', unit: 'topics', tiers: [1, 5, 15], shares: [0, 0.5, 1],
      about: 'In a topic, get 8 out of 10 questions in a row right, without hints. Do it in every topic for Gold.' },
    { key: 'cleared', name: 'Misconceptions cleared', icon: 'cleared', unit: 'cleared', tiers: [1, 10, 30],
      about: 'Answer correctly the ideas you used to get wrong until they clear.' }
  ];

  // The subject's topics, when the page knows them. Answers in other banks
  // (another subject, or a bank since retired) then do not count towards the
  // topic badges.
  function subjectBanks(opts) {
    var list = opts && Array.isArray(opts.topicBanks) ? opts.topicBanks.filter(Boolean) : [];
    var set = {};
    list.forEach(function (b) { set[b] = true; });
    return Object.keys(set);
  }

  // A share of 0 means "one topic". Every goal is at least one, so a course
  // with very few topics can still earn each tier, sometimes several at once.
  function tiersFor(badge, topicCount) {
    if (!badge.shares || !topicCount) return badge.tiers;
    return badge.shares.map(function (share) { return Math.max(1, Math.ceil(share * topicCount)); });
  }

  // opts.resolved: misconceptions cleared, as the profile already counts it.
  // opts.topicBanks: the bank keys of the student's subject.
  function measure(responses, opts) {
    responses = Array.isArray(responses) ? responses.filter(Boolean) : [];
    opts = opts || {};
    var banks = subjectBanks(opts), known = {};
    banks.forEach(function (b) { known[b] = true; });
    var inSubject = banks.length ? function (b) { return !!known[b]; } : function () { return true; };
    var first = responses.filter(isFirstAttempt);
    var perBank = {};
    first.forEach(function (r) { if (r.bank && inSubject(r.bank)) perBank[r.bank] = (perBank[r.bank] || 0) + 1; });
    return {
      answers: first.length,
      repairs: responses.filter(function (r) { return (r.reforge_attempted && r.reforge_correct) || (isRepairMode(r) && r.is_correct); }).length,
      streak: longestStreak(responses),
      timed: responses.filter(function (r) { return isTimed(r) && r.is_correct; }).length,
      topics: Object.keys(perBank).filter(function (b) { return perBank[b] >= 5; }).length,
      sharpened: sharpenedTopics(first, inSubject),
      cleared: Math.max(0, Number(opts.resolved) || 0)
    };
  }

  function compute(responses, opts) {
    var values = measure(responses, opts);
    var topicCount = subjectBanks(opts).length;
    return BADGES.map(function (badge) {
      var value = values[badge.key];
      var tiers = tiersFor(badge, topicCount);
      var earned = -1;
      tiers.forEach(function (goal, i) { if (value >= goal) earned = i; });
      var next = earned + 1 < tiers.length ? earned + 1 : null;
      return {
        key: badge.key, name: badge.name, icon: badge.icon, about: badge.about, unit: badge.unit, value: value,
        tier: earned >= 0 ? TIERS[earned] : null,
        next: next == null ? null : { tier: TIERS[next], goal: tiers[next] }
      };
    });
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Stroke icons in the style of the league's trophy.
  var ICONS = {
    answers: '<path d="M5 4h11l3 3v13H5z"/><path d="M8.5 12.5l2.2 2.2 4.8-5"/>',
    repair: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    streak: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.4 1.2-3.8 2.4-5 .2 1.6.9 2.6 2.1 3.2C11 8.6 11.3 5.8 12 3z"/>',
    timed: '<circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.5 2.5M10 3h4"/>',
    topics: '<circle cx="12" cy="12" r="8"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',
    cleared: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4.5"/>'
  };

  // The medal on its own: the badge icon inside a ring in the tier's colours.
  // Used by the badge list and by scripts/forge-celebrate.js.
  function medalHtml(icon, tierKey, size) {
    return '<span class="forge-badge__medal' + (size === 'lg' ? ' forge-badge__medal--lg' : '') + (tierKey ? ' forge-frame--' + tierKey : '') + '" aria-hidden="true">'
      + '<svg viewBox="0 0 24 24">' + (ICONS[icon] || '') + '</svg></span>';
  }

  // The profile's topic list for this student: the subject of their first
  // saved answer, as the "Your topics" card has always chosen it. Shared so the
  // dashboard's celebration and the profile's badges use the same targets.
  function subjectTopics(responses, subjects) {
    var first = (responses || [])[0];
    var key = first && first.subject;
    var subject = key && subjects && subjects[key];
    return subject && Array.isArray(subject.banks) ? subject.banks : [];
  }

  function badgeHtml(b) {
    var status, progress = '';
    if (b.next) {
      var pct = Math.max(0, Math.min(100, Math.round(b.value / b.next.goal * 100)));
      status = b.value.toLocaleString() + ' / ' + b.next.goal.toLocaleString() + ' ' + b.unit + ' for ' + b.next.tier.name;
      progress = '<span class="forge-badge__meter" aria-hidden="true"><span class="forge-frame--' + b.next.tier.key + '" style="width:' + pct + '%"></span></span>';
    } else {
      status = b.value.toLocaleString() + ' ' + b.unit + ' · every tier earned';
    }
    var tierText = b.tier ? b.tier.name : 'Not yet earned';
    // An earned badge can be shared again later (scripts/forge-celebrate.js).
    var share = b.tier && root.ForgeCelebrate
      ? '<button type="button" class="forge-badge__share" data-forge-share="badge" data-badge="' + esc(b.key) + '" data-tier="' + esc(b.tier.key) + '" aria-label="Share ' + esc(b.tier.name + ': ' + b.name) + '">Share</button>'
      : '';
    return '<li class="forge-badge' + (b.tier ? ' forge-frame--' + b.tier.key : ' is-locked') + '">'
      + medalHtml(b.icon)
      + '<span class="forge-badge__text"><strong>' + esc(b.name) + '</strong>'
      + '<span class="forge-badge__tier">' + esc(tierText) + '</span>'
      + '<small>' + esc(status) + '</small>' + progress
      + '<span class="forge-badge__about">' + esc(b.about) + '</span>' + share + '</span></li>';
  }

  function html(list) {
    var earned = list.filter(function (b) { return b.tier; }).length;
    return '<section class="forge-badges" aria-labelledby="forge-badges-title">'
      + '<div class="forge-badges__head"><h2 id="forge-badges-title">Achievements</h2><span>' + earned + ' of ' + list.length + ' earned</span></div>'
      + '<ul class="forge-badges__grid">' + list.map(badgeHtml).join('') + '</ul></section>';
  }

  // The badges closest to their next tier, for Home. Only badges the student
  // has started (value above 0) count: "0 / 3 days" is not almost there.
  // Ordered by share of the way to the next tier, then by fewest still to go.
  function almost(list, limit) {
    return (list || []).filter(function (b) { return b.next && b.value > 0 && b.value < b.next.goal; })
      .map(function (b) { return { badge: b, share: b.value / b.next.goal, left: b.next.goal - b.value }; })
      .sort(function (a, b) { return b.share - a.share || a.left - b.left; })
      .slice(0, limit == null ? 3 : limit)
      .map(function (x) { return x.badge; });
  }

  function almostHtml(list, opts) {
    var near = almost(list, opts && opts.limit);
    if (!near.length) return '';
    var h = '<section class="forge-badges forge-badges--almost" aria-labelledby="forge-almost-title">'
      + '<div class="forge-badges__head"><h2 id="forge-almost-title">Almost there</h2><a href="profile.html">All achievements</a></div><ul class="forge-badges__almost">';
    near.forEach(function (b) {
      var left = b.next.goal - b.value;
      var pct = Math.max(0, Math.min(100, Math.round(b.value / b.next.goal * 100)));
      // The medal shows the tier already held (grey if none); only the meter
      // takes the colour of the tier being worked towards.
      h += '<li class="forge-badge' + (b.tier ? '' : ' is-locked') + '">' + medalHtml(b.icon, b.tier && b.tier.key)
        + '<span class="forge-badge__text"><strong>' + esc(b.name) + '</strong>'
        + '<small>' + esc(left.toLocaleString() + ' more ' + (left === 1 ? b.unit.replace(/s$/, '') : b.unit) + ' for ' + b.next.tier.name) + '</small>'
        + '<span class="forge-badge__meter" role="progressbar" aria-label="' + esc(b.name + ' progress towards ' + b.next.tier.name) + '" aria-valuemin="0" aria-valuemax="' + b.next.goal + '" aria-valuenow="' + b.value + '"><span class="forge-frame--' + b.next.tier.key + '" style="width:' + pct + '%"></span></span>'
        + '</span></li>';
    });
    return h + '</ul></section>';
  }

  root.ForgeAchievements = { BADGES: BADGES, TIERS: TIERS, ICONS: ICONS, tiersFor: tiersFor, measure: measure, compute: compute, subjectTopics: subjectTopics, medalHtml: medalHtml, html: html, almost: almost, almostHtml: almostHtml };
}(typeof window !== 'undefined' ? window : globalThis));
