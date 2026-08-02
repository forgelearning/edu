/* Shared product language for marketing and authenticated Forge surfaces. */
(function () {
  var STATUS = {
    preview: { label: 'Preview', explanation: 'A guided look at the subject before its student bank is live.', cta: 'See the launch plan', experience: 'Students can explore the subject, but cannot start a live bank.' },
    pilot: { label: 'Pilot', explanation: 'A focused live bank being tested with early learners.', cta: 'Try the pilot bank', experience: 'Students get targeted practice while coverage expands.' },
    developing: { label: 'Developing', explanation: 'A live bank growing across the active specification.', cta: 'Practise the current bank', experience: 'Students can practise now and will see coverage expand over time.' },
    full: { label: 'Full', explanation: 'A complete live bank across the active specification.', cta: 'Start practising', experience: 'Students get the full Forge practice experience.' }
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]; });
  }

  function confidence(tier) { return STATUS[tier] || STATUS.preview; }

  function statusHtml(tier, extraClass) {
    var s = confidence(tier);
    return '<span class="forge-confidence forge-confidence--' + esc(tier) + ' ' + (extraClass || '') + '" title="' + esc(s.explanation) + '">' + esc(s.label) + '</span>';
  }

  function recommendation(options) {
    options = options || {};
    return '<section class="forge-recommendation" aria-labelledby="forge-recommendation-title">' +
      '<p class="forge-recommendation__eyebrow">' + esc(options.eyebrow || 'Recommended next') + '</p>' +
      '<h2 id="forge-recommendation-title" class="forge-recommendation__title">' + esc(options.title || '') + '</h2>' +
      (options.copy ? '<p class="forge-recommendation__copy">' + esc(options.copy) + '</p>' : '') +
      (options.action ? '<a class="forge-button forge-button--primary" href="' + esc(options.action.href || '#') + '">' + esc(options.action.label || 'Continue') + ' →</a>' : '') +
      '</section>';
  }

  window.ForgeShell = { status: STATUS, confidence: confidence, statusHtml: statusHtml, recommendation: recommendation };
}());
