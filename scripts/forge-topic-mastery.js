/* One readiness measure per topic, shown the same way wherever a topic is
   listed. Students used to see five different numbers (XP, accuracy,
   mistakes cleared, a memory ledger and two topic percentages) and none said
   how ready they were for a topic.

   Built only from saved answers, which every page that lists topics already
   has; revision-card ratings live on one device, so including them would
   colour the same topic differently on different pages or devices.

     none   Not started    no first-attempt answers yet
     red    Needs work     under 50% of the latest ten first attempts
     amber  Getting there  50% or more, or would be secure but has fewer than
                           eight answers or an unrepaired mistake in the topic
     green  Secure         80% or more over at least eight, nothing to repair

   A hinted correct answer is not credited, as everywhere else. */
(function (root) {
  var WINDOW = 10, MIN_ANSWERS = 8;
  var LABELS = { none: 'Not started', red: 'Needs work', amber: 'Getting there', green: 'Secure' };

  function firstAttempt(row) {
    var id = String(row && row.question_id || '');
    return row && !row.reforge_attempted && !/-ANVIL$|-CRU$/.test(id);
  }
  function openTags(responses) {
    var M = root.ForgeMisconceptions;
    if (!M || !M.summarize) return {};
    var out = {};
    (M.summarize(responses || []).active || []).forEach(function (item) { out[item && item.tag || item] = true; });
    return out;
  }

  function status(responses, bank, open) {
    var rows = (responses || []).filter(function (r) { return firstAttempt(r) && r.bank === bank; })
      .sort(function (a, b) { return String(a.created_at || '').localeCompare(String(b.created_at || '')); });
    if (!rows.length) return { key: 'none', label: LABELS.none, answered: 0, percent: null, open: 0 };
    var recent = rows.slice(-WINDOW);
    var correct = recent.filter(function (r) { return r.is_correct && !r.hint_used; }).length;
    var percent = Math.round(correct / recent.length * 100);
    open = open || openTags(responses);
    var openInTopic = {};
    rows.forEach(function (r) { if (!r.is_correct && r.misconception_tag && open[r.misconception_tag]) openInTopic[r.misconception_tag] = true; });
    var openCount = Object.keys(openInTopic).length;
    var key = percent < 50 ? 'red'
      : (percent >= 80 && rows.length >= MIN_ANSWERS && !openCount) ? 'green'
      : 'amber';
    return { key: key, label: LABELS[key], answered: rows.length, percent: percent, open: openCount };
  }

  function detail(s) {
    if (s.key === 'none') return 'No answers yet';
    var parts = [s.percent + '% of your latest ' + Math.min(s.answered, WINDOW)];
    if (s.open) parts.push(s.open + ' to repair');
    else if (s.key === 'amber' && s.percent >= 80) parts.push('answer ' + (MIN_ANSWERS - s.answered) + ' more to confirm');
    return parts.join(' · ');
  }

  function ringHtml(s, withLabel) {
    return '<span class="forge-ring forge-ring--' + s.key + '" title="' + s.label + ' · ' + detail(s) + '">'
      + '<span class="forge-ring__dot" aria-hidden="true"></span>'
      + (withLabel ? '<span class="forge-ring__label">' + s.label + '</span>' : '<span class="forge-visually-hidden">' + s.label + '</span>')
      + '</span>';
  }

  root.ForgeTopicMastery = { status: status, detail: detail, ringHtml: ringHtml, openTags: openTags, LABELS: LABELS, WINDOW: WINDOW, MIN_ANSWERS: MIN_ANSWERS };
})(typeof window !== 'undefined' ? window : globalThis);
