/* Shared state language for every Forge surface. */
(function () {
  var defaults = {
    loading: { label: 'Loading', body: 'Getting the latest information ready.' },
    error: { label: 'We couldn’t load this', body: 'Check your connection and try again.' },
    empty: { label: 'Nothing here yet', body: 'There is no information to show yet.' },
    success: { label: 'All set', body: 'Your changes have been saved.' }
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function html(kind, options) {
    options = options || {};
    var base = defaults[kind] || defaults.empty;
    var action = options.action
      ? '<a class="forge-state__action forge-button forge-button--' + (options.actionTone || 'primary') + '" href="' + esc(options.action.href || '#') + '">' + esc(options.action.label) + '</a>'
      : '';
    var retry = kind === 'error'
      ? '<button type="button" class="forge-state__action forge-button forge-button--secondary" data-forge-state-retry>' + esc(options.retryLabel || 'Try again') + '</button>'
      : '';
    return '<section class="forge-state forge-state--' + esc(kind) + '" role="' + (kind === 'error' ? 'alert' : 'status') + '" aria-live="polite">' +
      '<div class="forge-state__icon" aria-hidden="true">' + (kind === 'loading' ? '…' : kind === 'error' ? '!' : kind === 'success' ? '✓' : '—') + '</div>' +
      '<div class="forge-state__content"><h3>' + esc(options.label || base.label) + '</h3><p>' + esc(options.body || base.body) + '</p>' +
      (action || retry ? '<div class="forge-state__actions">' + action + retry + '</div>' : '') + '</div></section>';
  }

  function render(target, kind, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return null;
    el.innerHTML = html(kind, options);
    return el.querySelector('[data-forge-state-retry]');
  }

  window.ForgeState = {
    html: html,
    render: render,
    loading: function (target, options) { return render(target, 'loading', options); },
    error: function (target, options) { return render(target, 'error', options); },
    empty: function (target, options) { return render(target, 'empty', options); },
    success: function (target, options) { return render(target, 'success', options); }
  };
}());
