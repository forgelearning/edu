/* Shared application layer for authenticated Forge surfaces. */
(function () {
  var session = {
    defaultQuestionCount: 8,
    estimatedMinutesPerQuestion: 0.75,
    minEstimatedMinutes: 4,
    questionsFor: function (available) {
      return Math.min(this.defaultQuestionCount, available || this.defaultQuestionCount);
    },
    estimatedMinutesFor: function (count) {
      return Math.max(this.minEstimatedMinutes, Math.round(count * this.estimatedMinutesPerQuestion));
    }
  };

  function navigate(href) { window.location.href = href; }

  function dashboardCard(options) {
    options = options || {};
    var eyebrow = options.eyebrow ? '<span class="card-title">' + esc(options.eyebrow) + '</span>' : '';
    var title = options.title ? '<h2>' + esc(options.title) + '</h2>' : '';
    var body = options.body ? '<p>' + esc(options.body) + '</p>' : '';
    return '<section class="card forge-dashboard-card ' + esc(options.className || '') + '">' + eyebrow + title + body + (options.content || '') + '</section>';
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }

  function contentStatus(key) {
    return window.ForgeContentConfidence && window.ForgeContentConfidence.statusFor
      ? window.ForgeContentConfidence.statusFor(key)
      : { tier: 'full' };
  }

  window.ForgeApp = {
    session: session,
    state: window.ForgeState || null,
    navigate: navigate,
    dashboardCard: dashboardCard,
    contentStatus: contentStatus
  };
}());
