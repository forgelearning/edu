/* Subject badge: a round badge in the subject's colour (SUBJECTS[key].color in
   data/forge-data.js) with an icon for the subject, used for classes on the
   teacher dashboard. Languages show their language code instead of an icon.
   Variants of one subject (A Level, GCSE, the separate sciences) share an
   icon. A subject with no entry here falls back to its initials, so a new
   subject still gets a sensible badge. */
(function (root) {
  'use strict';

  var ICONS = {
    economics: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    business: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    psychology: '<path d="M12 5a3 3 0 0 0-5.6 1.5A3 3 0 0 0 4 9.5a3 3 0 0 0 1 4.6A3.5 3.5 0 0 0 9 19a3 3 0 0 0 3-1.5"/><path d="M12 5a3 3 0 0 1 5.6 1.5A3 3 0 0 1 20 9.5a3 3 0 0 1-1 4.6A3.5 3.5 0 0 1 15 19a3 3 0 0 1-3-1.5V5z"/>',
    sociology: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5 5.3"/>',
    geography: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    chemistry: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>',
    biology: '<path d="M5 19C5 11 11 5 20 5c0 9-6 15-14 15"/><path d="M5 19l8-8"/>',
    physics: '<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)"/>',
    criminology: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    law: '<path d="M12 4v16M8 20h8M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
    history: '<path d="M3 21h18M4 10h16M12 3l8 5H4z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
    politics: '<rect x="4" y="11" width="16" height="9" rx="1"/><path d="M8 11l3-7 6 3-2 4M8 15h8"/>',
    computing: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12"/>',
    maths: '<path d="M17 5H7l6 7-6 7h10"/>',
    rs: '<path d="M12 3c2 3 4 4.5 4 7.5a4 4 0 0 1-8 0C8 8 10 6 12 3z"/><path d="M12 14.5V21M9 21h6"/>',
    hsc: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>',
    media: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
    pe: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 3h6"/>',
    english: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>',
    science: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><circle cx="12" cy="16" r="1.2"/>'
  };

  // Subject key -> icon family, or a language code shown as text.
  var FAMILY = {
    econ: 'economics', 'gcse-econ': 'economics', bus: 'business',
    psych: 'psychology', 'gcse-psych': 'psychology', soc: 'sociology',
    geo: 'geography', 'gcse-geo': 'geography',
    chem: 'chemistry', 'gcse-sep-chem': 'chemistry',
    bio: 'biology', 'gcse-sep-bio': 'biology',
    phys: 'physics', 'gcse-sep-phys': 'physics', 'gcse-science': 'science',
    crim: 'criminology', law: 'law', hist: 'history', 'gcse-hist': 'history',
    pol: 'politics', cs: 'computing', maths: 'maths', 'gcse-maths': 'maths',
    rs: 'rs', hsc: 'hsc', media: 'media', pe: 'pe', englit: 'english', engll: 'english'
  };
  var LANGUAGE = { german: 'DE', french: 'FR', span: 'ES', mand: '中' };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function subjects() { return root.SUBJECTS || {}; }

  function initials(label) {
    var words = String(label || '').split(/\s+/).filter(function (w) { return /^[A-Za-z]/.test(w) && !/^(A|AS|GCSE|Level)$/i.test(w); });
    if (!words.length) return '?';
    return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
  }

  function color(key) {
    var s = subjects()[key];
    return s && /^#[0-9a-f]{3,8}$/i.test(s.color || '') ? s.color : '#4b5563';
  }

  /* html(subjectKey, { size: 'lg' | 'md' | 'sm', label: 'accessible name' }) */
  function html(key, options) {
    options = options || {};
    var size = options.size || 'md';
    var s = subjects()[key];
    var name = options.label || (s && s.label) || 'Subject';
    var inner;
    if (LANGUAGE[key]) inner = '<span class="forge-subject-badge__text">' + esc(LANGUAGE[key]) + '</span>';
    else if (ICONS[FAMILY[key]]) inner = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[FAMILY[key]] + '</svg>';
    else inner = '<span class="forge-subject-badge__text">' + esc(initials(name)) + '</span>';
    return '<span class="forge-subject-badge forge-subject-badge--' + esc(size) + '" style="--subject-color:' + color(key) + '" role="img" aria-label="' + esc(name) + '">' + inner + '</span>';
  }

  root.ForgeSubjectBadge = { html: html, family: function (key) { return FAMILY[key] || null; }, ICONS: ICONS };
}(typeof window !== 'undefined' ? window : globalThis));
