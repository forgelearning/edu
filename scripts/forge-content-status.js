(function () {
  var page = location.pathname.split('/').pop() || 'index.html';
  fetch('data/content-status.json').then(function (response) {
    if (!response.ok) throw new Error('Content status unavailable');
    return response.json();
  }).then(function (contract) {
    var key = (contract.pages || {})[page];
    var status = key && (contract.subjects || {})[key];
    var meta = document.querySelector('.subject-meta-row > div');
    if (!status || !meta) return;
    var labels = { full: 'Full bank', developing: 'Developing bank', pilot: 'Pilot bank', preview: 'Preview only' };
    var notes = {
      full: 'Coverage is live across the current published bank.',
      developing: 'The current bank is live and expanding across the specification.',
      pilot: 'Pilot bank — use it for targeted practice while coverage expands.',
      preview: 'Preview only — no live student bank is available yet.'
    };
    var existing = meta.querySelector('.pill');
    if (existing) {
      existing.className = 'pill ' + (status.tier === 'full' ? 'good' : 'muted') + ' reveal';
      existing.textContent = labels[status.tier];
    }
    var pill = document.createElement('span');
    pill.className = 'coverage-pill coverage-pill--' + status.tier;
    pill.textContent = labels[status.tier];
    pill.setAttribute('aria-label', 'Content coverage: ' + labels[status.tier]);
    meta.appendChild(pill);
    var stat = document.querySelector('.subject-stat-line');
    var number = document.querySelector('.subj-stat-n');
    if (number) number.textContent = status.questions.toLocaleString('en-GB');
    if (stat) {
      stat.querySelectorAll('.subject-bank-count').forEach(function (el) { el.remove(); });
      Array.prototype.slice.call(stat.childNodes).forEach(function (node) {
        if (node !== number) node.remove();
      });
      var bankCount = document.createElement('span');
      bankCount.className = 'subject-bank-count';
      bankCount.textContent = ' questions · ' + status.banks + ' bank' + (status.banks === 1 ? '' : 's') + ' live';
      stat.appendChild(bankCount);
    }
    if (stat && status.tier !== 'full') {
      var noteEl = document.createElement('p');
      noteEl.className = 'content-status-note';
      noteEl.textContent = notes[status.tier] + ' (' + status.coverage + '% of active specification points mapped.)';
      stat.insertAdjacentElement('afterend', noteEl);
    }
    document.querySelectorAll('.rank-badge').forEach(function (badge) {
      if (status.tier !== 'full' && badge.textContent.trim().toLowerCase() === 'live') {
        badge.textContent = status.tier === 'preview' ? 'Preview' : 'Building';
        badge.classList.remove('ui-badge-good');
      }
    });
    var primary = document.querySelector('.subject-actions .btn-hot');
    if (primary && status.tier === 'preview') {
      primary.textContent = 'See the launch plan';
      primary.href = 'index.html#waitlist';
    } else if (primary && status.tier !== 'full') primary.textContent = 'Try the current bank — free';
    var waitCopy = document.querySelector('.wait .sect-lede');
    if (waitCopy && status.tier !== 'full') waitCopy.textContent = 'Coverage is expanding topic by topic. Join the waitlist for updates as new banks go live.';
  }).catch(function () {
    var meta = document.querySelector('.subject-meta-row > div');
    if (meta) {
      var fallback = document.createElement('span');
      fallback.className = 'coverage-pill coverage-pill--unknown';
      fallback.textContent = 'Coverage status unavailable';
      meta.appendChild(fallback);
    }
  });
}());
