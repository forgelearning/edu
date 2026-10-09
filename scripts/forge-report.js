/* "Report a problem with this question", after an answer.

   A short form: what looks wrong, and an optional note. Saved by the
   report_question RPC (supabase/migrations/20261009184149_question_reports.sql)
   with the credential the student's other calls use: the account's sign-in,
   a class session's codes, or a free session's token. One report per
   question per student; sending again replaces it.

   The page passes a context: { studentId, classCode, studentCode,
   studentName, freeToken, question, bank, selected }. */
(function (root) {
  'use strict';

  var REASONS = [
    ['wrong_answer', 'The answer marked right looks wrong'],
    ['two_answers', 'More than one answer is right'],
    ['unclear', 'The question is unclear'],
    ['typo', 'There’s a typo or missing word'],
    ['other', 'Something else']
  ];
  var serial = 0;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function payload(ctx, reason, note) {
    var q = ctx.question || {};
    return {
      p_student_id: String(ctx.studentId || ''), p_class_code: ctx.classCode || null, p_student_code: ctx.studentCode || null,
      p_name: ctx.studentName || null, p_free_token: ctx.freeToken || null,
      // The base question: a similar question is reported against the one it twins.
      p_question_id: String(q.id || '').replace(/-(RF|ANVIL|CHK|CRU\d*)$/, ''), p_bank: ctx.bank || null,
      p_reason: reason, p_note: String(note || '').trim().slice(0, 500) || null,
      p_selected_option: ctx.selected && /^[A-H]$/.test(ctx.selected) ? ctx.selected : null
    };
  }

  function send(ctx, reason, note) {
    var api = root.ForgeAPI;
    if (!api || !ctx.studentId) return Promise.reject(new Error('No student session'));
    var token = root.ForgeAuth && root.ForgeAuth.accessToken && root.ForgeAuth.accessToken();
    return api.rpc('report_question', payload(ctx, reason, note), { token: token || api.config.key });
  }

  function formHtml(id) {
    return '<form class="forge-report__form" data-forge-report-form>'
      + '<fieldset><legend>What looks wrong?</legend>'
      + REASONS.map(function (r, i) {
        return '<label><input type="radio" name="' + id + '-reason" value="' + r[0] + '"' + (i ? '' : ' required') + '> ' + esc(r[1]) + '</label>';
      }).join('')
      + '</fieldset>'
      + '<label class="forge-report__note" for="' + id + '-note">Anything to add? <span>(optional, don’t include your name)</span></label>'
      + '<textarea id="' + id + '-note" maxlength="500" rows="2"></textarea>'
      + '<div class="forge-report__actions"><button type="submit" class="forge-button forge-button--primary">Send report</button>'
      + '<button type="button" class="forge-button forge-button--secondary" data-forge-report-cancel>Cancel</button></div>'
      + '<p class="forge-report__status" role="status" aria-live="polite"></p></form>';
  }

  // Add the link to a feedback box. ctx is read when the report is sent, so
  // a context function can return the latest session.
  function attach(feedback, ctx) {
    if (!feedback || !root.document || feedback.querySelector('.forge-report')) return;
    var id = 'forge-report-' + (++serial);
    var box = root.document.createElement('div');
    box.className = 'forge-report';
    box.innerHTML = '<button type="button" class="forge-report__toggle" aria-expanded="false" aria-controls="' + id + '">Report a problem with this question</button>'
      + '<div id="' + id + '" hidden>' + formHtml(id) + '</div>';
    feedback.appendChild(box);
    var toggle = box.querySelector('.forge-report__toggle'), panel = box.querySelector('#' + id), form = box.querySelector('form');
    var status = box.querySelector('.forge-report__status');
    function open(show) {
      panel.hidden = !show;
      toggle.setAttribute('aria-expanded', show ? 'true' : 'false');
      if (show) { var first = panel.querySelector('input'); if (first) first.focus(); } else toggle.focus();
    }
    toggle.addEventListener('click', function () { open(panel.hidden); });
    box.querySelector('[data-forge-report-cancel]').addEventListener('click', function () { open(false); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var chosen = form.querySelector('input[type=radio]:checked');
      if (!chosen) { status.textContent = 'Choose what looks wrong.'; return; }
      var button = form.querySelector('button[type=submit]');
      button.disabled = true;
      status.textContent = 'Sending…';
      var context = typeof ctx === 'function' ? ctx() : ctx;
      send(context || {}, chosen.value, form.querySelector('textarea').value).then(function () {
        box.innerHTML = '<p class="forge-report__done" role="status">Thanks. We’ll check this question.</p>';
      }).catch(function (err) {
        button.disabled = false;
        var limit = err && /daily_limit/.test(String(err.message || ''));
        status.textContent = limit ? 'You’ve sent a lot of reports today. Try again tomorrow.' : 'We couldn’t send that. Check your connection and try again.';
      });
    });
  }

  root.ForgeReport = { REASONS: REASONS, payload: payload, send: send, attach: attach };
}(typeof window !== 'undefined' ? window : globalThis));
