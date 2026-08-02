(function () {
  var labels = { full: 'Full', developing: 'Developing', pilot: 'Pilot', preview: 'Preview' };
  var explanations = {
    full: 'Complete live bank across the active specification.',
    developing: 'Live bank growing across the active specification.',
    pilot: 'Focused live bank being tested with early learners.',
    preview: 'Guided subject preview before the student bank is live.'
  };
  var ctas = { full: 'Start practising', developing: 'Practise the current bank', pilot: 'Try the pilot bank', preview: 'See the launch plan' };
  var experiences = {
    full: 'Students get the full Forge practice experience.',
    developing: 'Students can practise now while coverage expands.',
    pilot: 'Students get targeted practice while coverage expands.',
    preview: 'Students can explore the subject but cannot start a live bank.'
  };
  // The strings above are written about students, for teacher and marketing
  // surfaces. Anything a student reads directly uses these instead.
  var learnerExperiences = {
    full: 'You get the full Forge practice experience.',
    developing: 'You can practise now while coverage expands.',
    pilot: 'You get targeted practice while coverage expands.',
    preview: 'You can explore the subject, but the live bank is not ready yet.'
  };
  var page = location.pathname.split('/').pop() || 'index.html';
  fetch('data/content-status.json').then(function (response) {
    if (!response.ok) throw new Error('Content status unavailable');
    return response.json();
  }).then(function (contract) {
    var key = (contract.pages || {})[page];
    var status = key && (contract.subjects || {})[key];
    var meta = document.querySelector('.subject-meta-row > div');
    if (page === 'index.html') {
      document.querySelectorAll('.subj[data-subj]').forEach(function (card) {
        var cardStatus = (contract.subjects || {})[card.getAttribute('data-subj')];
        if (!cardStatus) return;
        var cardPill = card.querySelector('.subj-top .pill');
        if (cardPill && !card.hasAttribute('data-pill-fixed')) {
          cardPill.className = 'pill ' + (cardStatus.tier === 'full' ? 'good' : cardStatus.tier === 'pilot' ? 'hot' : 'early');
          cardPill.textContent = labels[cardStatus.tier];
          cardPill.title = explanations[cardStatus.tier] + ' ' + experiences[cardStatus.tier];
        }
        var confidenceNote = card.querySelector('.forge-content-confidence-note');
        if (!confidenceNote) {
          confidenceNote = document.createElement('span');
          confidenceNote.className = 'forge-content-confidence-note';
          var statLine = card.querySelector('.subj-stat');
          if (statLine) statLine.insertAdjacentElement('afterend', confidenceNote);
        }
        confidenceNote.textContent = explanations[cardStatus.tier] + ' ' + experiences[cardStatus.tier];
        var link = card.querySelector('.subj-link');
        if (link) link.textContent = ctas[cardStatus.tier] + ' →';
      });
    }
    if (!status || !meta) {
      window.ForgeContentConfidence = { subjects: contract.subjects || {}, labels: labels, explanations: explanations, ctas: ctas, experiences: experiences, learnerExperiences: learnerExperiences, statusFor: function (key) { return (contract.subjects || {})[key] || { tier: 'preview' }; }, badge: function (tier) { return '<span class="forge-confidence forge-confidence--' + tier + '">' + labels[tier] + '</span>'; }, note: function (tier) { return explanations[tier] + ' ' + experiences[tier]; } };
      document.dispatchEvent(new CustomEvent('forge-content-ready'));
      return;
    }
    var notes = {
      full: explanations.full,
      developing: explanations.developing,
      pilot: explanations.pilot,
      preview: explanations.preview
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
      primary.textContent = ctas.preview;
      primary.href = 'index.html#waitlist';
    } else if (primary) primary.textContent = ctas[status.tier];
    var waitCopy = document.querySelector('.wait .sect-lede');
    if (waitCopy && status.tier !== 'full') waitCopy.textContent = 'Coverage is expanding topic by topic. Join the waitlist for updates as new banks go live.';
    window.ForgeContentConfidence = {
      subjects: contract.subjects || {}, labels: labels, explanations: explanations, ctas: ctas, experiences: experiences, learnerExperiences: learnerExperiences,
      statusFor: function (key) { return (contract.subjects || {})[key] || { tier: 'preview', questions: 0, banks: 0, coverage: 0 }; },
      badge: function (tier) { return '<span class="forge-confidence forge-confidence--' + tier + '" title="' + explanations[tier] + '">' + labels[tier] + '</span>'; },
      note: function (tier) { return '<span class="forge-content-confidence-note">' + explanations[tier] + ' ' + experiences[tier] + '</span>'; }
    };
    document.dispatchEvent(new CustomEvent('forge-content-ready'));
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
