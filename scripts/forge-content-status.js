(function () {
  var stat = document.querySelector('.subject-stat-line');
  var meta = document.querySelector('.subject-meta-row > div');
  if (!meta) return;
  var text = stat ? stat.textContent : document.body.textContent;
  var match = text && text.match(/\d[\d,]*/);
  var count = match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
  var bankMatch = text && text.match(/(\d+)\s+banks?\s+live/i);
  var bankCount = bankMatch ? parseInt(bankMatch[1], 10) : 0;
  var bodyText = document.body.textContent;
  var explicitPreview = /no question bank live|not in the quiz app yet/i.test(bodyText) || (/sample questions?/i.test(bodyText) && /full bank in authoring/i.test(bodyText));
  var tier = explicitPreview || !count ? 'preview' : count >= 200 && bankCount >= 2 ? 'full' : count >= 80 ? 'developing' : 'pilot';
  var labels = { full: 'Full bank', developing: 'Developing bank', pilot: 'Pilot bank', preview: 'Preview only' };
  var note = {
    full: 'Coverage is live across the current published bank.',
    developing: 'The current bank is live and expanding across the specification.',
    pilot: 'Pilot bank — use it for targeted practice while coverage expands.',
    preview: 'Preview only — no live student bank is available yet.'
  }[tier];
  var pill = document.createElement('span');
  pill.className = 'coverage-pill coverage-pill--' + tier;
  pill.textContent = labels[tier];
  pill.setAttribute('aria-label', 'Content coverage: ' + labels[tier]);
  meta.appendChild(pill);
  if (stat && tier !== 'full') {
    var noteEl = document.createElement('p');
    noteEl.className = 'content-status-note';
    noteEl.textContent = note;
    stat.insertAdjacentElement('afterend', noteEl);
  }
  var primary = document.querySelector('.subject-actions .btn-hot');
  if (primary && tier === 'preview') {
    primary.textContent = 'See the launch plan';
    primary.href = 'index.html#waitlist';
  } else if (primary && tier !== 'full') {
    primary.textContent = 'Try the current bank — free';
  }
  var waitCopy = document.querySelector('.wait .sect-lede');
  if (waitCopy && tier !== 'full') waitCopy.textContent = 'Coverage is expanding topic by topic. Join the waitlist for updates as new banks go live.';
}());
