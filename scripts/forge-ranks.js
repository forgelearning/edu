/* Forge ranks and avatar frames.
   A student's rank comes from their lifetime XP, and each rank brings a frame
   for their avatar. The frame follows the rank rather than being a separate
   choice, so anyone who can see a student's total XP (the student themselves,
   and accepted friends via get_class_friends.xp_total) sees the same frame
   without any extra server state. Names and thresholds are the ones the
   profile has always shown, so no student's rank changes. */
(function (root) {
  'use strict';

  var RANKS = [
    { key: 'apprentice', name: 'Apprentice', min: 0, frame: 'iron', frameName: 'Iron' },
    { key: 'journeyman', name: 'Journeyman', min: 300, frame: 'bronze', frameName: 'Bronze' },
    { key: 'craftsman', name: 'Craftsman', min: 1500, frame: 'silver', frameName: 'Silver' },
    { key: 'forged', name: 'Forged', min: 5000, frame: 'gold', frameName: 'Gold' },
    { key: 'master', name: 'Master', min: 15000, frame: 'ember', frameName: 'Ember' }
  ];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function clampXp(xp) { xp = Number(xp); return Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0; }

  // The league returns a rank key ('apprentice' ... 'master') rather than
  // lifetime XP, since league classmates are not necessarily friends.
  function byKey(key) {
    for (var i = 0; i < RANKS.length; i++) if (RANKS[i].key === key) return RANKS[i];
    return null;
  }

  function rankFor(xp) {
    xp = clampXp(xp);
    for (var i = RANKS.length - 1; i >= 0; i--) if (xp >= RANKS[i].min) return RANKS[i];
    return RANKS[0];
  }

  function nextRank(xp) {
    var i = RANKS.indexOf(rankFor(xp));
    return RANKS[i + 1] || null;
  }

  // Share of the way from the current rank to the next, 0-100.
  function progress(xp) {
    xp = clampXp(xp);
    var rank = rankFor(xp), next = nextRank(xp);
    if (!next) return { rank: rank, next: null, pct: 100, toNext: 0 };
    return { rank: rank, next: next, pct: Math.round((xp - rank.min) / (next.min - rank.min) * 100), toNext: next.min - xp };
  }

  // "Amira K." -> "AK"; "jo" -> "J". League and friends names are first name
  // plus initial, so two letters is the most there ever is to show.
  function initials(name) {
    var words = String(name || '').trim().split(/\s+/).map(function (w) { return w.replace(/[^\p{L}\p{N}]/gu, ''); }).filter(Boolean);
    if (!words.length) return '?';
    var first = Array.from(words[0])[0] || '';
    var last = words.length > 1 ? (Array.from(words[words.length - 1])[0] || '') : '';
    return (first + last).toUpperCase() || '?';
  }

  // The avatar is decorative wherever the name is printed beside it, which is
  // everywhere it is used today; pass {label: true} for a standalone avatar.
  function avatarHtml(name, xp, opts) {
    opts = opts || {};
    var rank = opts.rank || rankFor(xp);
    var size = /^(sm|md|lg)$/.test(opts.size) ? opts.size : 'md';
    var a11y = opts.label ? ' role="img" aria-label="' + esc(name + ', ' + rank.name + ' (' + rank.frameName + ' frame)') + '"' : ' aria-hidden="true"';
    return '<span class="forge-avatar forge-avatar--' + size + ' forge-frame--' + rank.frame + (opts.locked ? ' is-locked' : '') + '"' + a11y + '>'
      + '<span class="forge-avatar__initials">' + esc(initials(name)) + '</span></span>';
  }

  function chipHtml(xp, rank) {
    rank = rank || rankFor(xp);
    return '<span class="forge-rank-chip forge-frame--' + rank.frame + '">' + esc(rank.name) + '</span>';
  }

  // Every rank, with the student's own initials in each frame so they can see
  // what they are working towards.
  function ladderHtml(name, xp) {
    xp = clampXp(xp);
    var current = rankFor(xp);
    var h = '<ol class="forge-rank-ladder">';
    RANKS.forEach(function (rank) {
      var earned = xp >= rank.min, isCurrent = rank === current;
      var state = isCurrent ? 'Your rank' : earned ? 'Earned' : (rank.min - xp).toLocaleString() + ' XP to go';
      h += '<li class="forge-rank-ladder__step' + (isCurrent ? ' is-current' : '') + (earned ? '' : ' is-locked') + '">'
        + avatarHtml(name, xp, { rank: rank, size: 'sm', locked: !earned })
        + '<span class="forge-rank-ladder__text"><strong>' + esc(rank.name) + '</strong>'
        + '<small>' + esc(rank.frameName) + ' frame · ' + (rank.min ? rank.min.toLocaleString() + ' XP' : 'from the start') + '</small></span>'
        + '<span class="forge-rank-ladder__state">' + esc(state) + '</span></li>';
    });
    return h + '</ol>';
  }

  root.ForgeRanks = {
    RANKS: RANKS, byKey: byKey, rankFor: rankFor, nextRank: nextRank, progress: progress,
    initials: initials, avatarHtml: avatarHtml, chipHtml: chipHtml, ladderHtml: ladderHtml
  };
}(typeof window !== 'undefined' ? window : globalThis));
