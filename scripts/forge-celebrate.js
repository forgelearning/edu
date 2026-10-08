/* Celebrations for a new rank, badge tier or weekly league trophy, and
   sharing them.

   check() compares what a page has just worked out (lifetime XP, badge tiers,
   league trophies)
   with what this student has already been congratulated on, which is kept per
   student on this device. Anything new opens one popup listing it all. The
   first time a student is seen, their current state is recorded silently, so
   an existing student is not greeted with every badge they already hold.

   Shared images and text carry the rank or badge and Forge's public address
   only: no name, school or class, because most students are under 18.

   Depends on scripts/forge-ranks.js and scripts/forge-achievements.js. */
(function (root) {
  'use strict';

  var PREFIX = 'forge-celebrated:';
  var SITE = 'https://forgelearning.github.io/edu/';
  var doc = root.document;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function read(id) {
    try { return JSON.parse(root.localStorage.getItem(PREFIX + id) || 'null'); } catch (e) { return null; }
  }
  function write(id, value) {
    try { root.localStorage.setItem(PREFIX + id, JSON.stringify(value)); } catch (e) {}
  }

  var R = function () { return root.ForgeRanks; };
  var A = function () { return root.ForgeAchievements; };
  function rankIndex(key) { var r = R() && R().byKey(key); return r ? R().RANKS.indexOf(r) : -1; }
  function tierIndex(key) { var list = A() ? A().TIERS : []; for (var i = 0; i < list.length; i++) if (list[i].key === key) return i; return -1; }

  // What is new since the last visit, as a list of events. Pure, so it can be
  // tested: `seen` is the stored record (or null), the rest is the current state.
  // opts.xp: lifetime XP, or null to leave the rank alone (the quiz passes
  // none when it is not showing XP).
  // opts.badges: ForgeAchievements.compute() output, or null to leave alone.
  function diff(seen, opts) {
    var next = { rank: seen && seen.rank || null, badges: Object.assign({}, seen && seen.badges), badgesSeen: !!(seen && seen.badgesSeen) };
    if (seen && seen.trophies != null) next.trophies = seen.trophies;
    var events = [];
    // Ranks and badges are first recorded independently: the quiz records
    // only a rank, so a student whose first visit is a quiz must not then be
    // congratulated on every badge they already hold when Home loads.
    var first = !next.badgesSeen;
    if (opts.xp != null && R()) {
      var rank = R().rankFor(opts.xp);
      // A rank never recorded before (first visit, or ranks newly shown) is
      // recorded without a popup, like the first visit.
      if (next.rank && rankIndex(rank.key) > rankIndex(next.rank)) events.push({ type: 'rank', rank: rank });
      // Only ever moves up: a lower total from a partial load or another
      // device must not reset it, or the real total would be announced again.
      if (!next.rank || rankIndex(rank.key) > rankIndex(next.rank)) next.rank = rank.key;
    }
    (opts.badges || []).forEach(function (b) {
      if (!b.tier) return;
      var had = next.badges[b.key];
      if (!first && (had == null || tierIndex(b.tier.key) > tierIndex(had))) events.push({ type: 'badge', badge: b, tier: b.tier });
      if (had == null || tierIndex(b.tier.key) > tierIndex(had)) next.badges[b.key] = b.tier.key;
    });
    if (opts.badges) next.badgesSeen = true;
    // opts.trophies: weekly league wins from get_class_weekly_league, or null
    // to leave alone. Unlike a rank, a win already held when trophies first
    // appear is still celebrated: it was earned in a week that has closed and
    // never been announced. Only ever moves up, like the rank.
    if (opts.trophies != null) {
      var won = Math.max(0, Math.floor(Number(opts.trophies) || 0)), had = Number(next.trophies) || 0;
      if (won > had) events.push({ type: 'trophy', count: won });
      if (next.trophies == null || won > had) next.trophies = Math.max(won, had);
    }
    return { events: events, record: next };
  }

  function check(opts) {
    opts = opts || {};
    if (!opts.studentId) return [];
    var result = diff(read(opts.studentId), opts);
    write(opts.studentId, result.record);
    if (result.events.length) show(result.events, opts.name);
    return result.events;
  }

  // ── Words ───────────────────────────────────────────────────────────────
  function words(event) {
    if (event.type === 'trophy') {
      var n = event.count;
      return {
        kicker: 'Weekly league',
        title: n === 1 ? 'You won the week' : 'You’ve won ' + n + ' weekly leagues',
        body: (n === 1 ? 'You finished 1st in your class’s weekly league.' : 'You’ve finished 1st in your class’s weekly league ' + n + ' times.')
          + ' Your trophies show next to your name in the league and on your profile.',
        short: n === 1 ? 'League trophy' : n + ' league trophies',
        share: n === 1
          ? 'I finished 1st in my class’s weekly league on Forge, the revision app that helps you fix your mistakes.'
          : 'I’ve won my class’s weekly league ' + n + ' times on Forge, the revision app that helps you fix your mistakes.'
      };
    }
    if (event.type === 'rank') {
      return {
        kicker: 'New rank',
        // "Forged" is an adjective and "Master" reads oddly with an article,
        // so the title names the rank rather than calling the student one.
        title: 'You’ve reached ' + event.rank.name,
        body: event.rank.frameName + ' frame unlocked. Friends and your class league see it next to your name.',
        short: event.rank.name + ' rank',
        share: 'I’ve reached the ' + event.rank.name + ' rank on Forge, the revision app that helps you fix your mistakes.'
      };
    }
    return {
      kicker: 'Achievement unlocked',
      title: event.tier.name + ': ' + event.badge.name,
      body: (Number(event.badge.value) > 0 ? Number(event.badge.value).toLocaleString() + ' ' + event.badge.unit + '. ' : '') + event.badge.about,
      short: event.tier.name + ' · ' + event.badge.name,
      share: 'I’ve earned the ' + event.tier.name + ' “' + event.badge.name + '” badge on Forge, the revision app that helps you fix your mistakes.'
    };
  }

  function visual(event, name, size) {
    if (event.type === 'trophy') return A().medalHtml('trophy', 'gold', size === 'sm' ? '' : 'lg');
    if (event.type === 'rank') return R().avatarHtml(name || '', 0, { rank: event.rank, size: size === 'sm' ? 'sm' : 'lg' });
    return A().medalHtml(event.badge.icon, event.tier.key, size === 'sm' ? '' : 'lg');
  }

  // ── Popup ───────────────────────────────────────────────────────────────
  var current = null;
  function show(events, name) {
    if (!doc || !R() || !A()) return;
    if (current) current.close();
    // Ranks first, then a league trophy, then higher tiers, so the biggest
    // news leads.
    var order = function (e) { return e.type === 'rank' ? 0 : e.type === 'trophy' ? 1 : 2; };
    events = events.slice().sort(function (a, b) {
      return order(a) - order(b) || tierIndex(b.tier && b.tier.key) - tierIndex(a.tier && a.tier.key);
    });
    var lead = events[0], w = words(lead);
    var dialog = doc.createElement('dialog');
    dialog.className = 'forge-celebrate';
    dialog.setAttribute('aria-labelledby', 'forge-celebrate-title');
    dialog.setAttribute('aria-describedby', 'forge-celebrate-body');
    var more = events.slice(1).map(function (e) {
      return '<li>' + visual(e, name, 'sm') + '<span>' + esc(words(e).short) + '</span></li>';
    }).join('');
    dialog.innerHTML = '<div class="forge-celebrate__sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>'
      + '<p class="forge-celebrate__kicker">' + esc(w.kicker) + '</p>'
      + '<div class="forge-celebrate__visual">' + visual(lead, name) + '</div>'
      + '<h2 id="forge-celebrate-title">' + esc(w.title) + '</h2>'
      + '<p id="forge-celebrate-body" class="forge-celebrate__body">' + esc(w.body) + '</p>'
      + (more ? '<p class="forge-celebrate__also">Also new</p><ul class="forge-celebrate__more">' + more + '</ul>' : '')
      + '<p class="forge-celebrate__status" role="status" aria-live="polite"></p>'
      + '<div class="forge-celebrate__actions">'
      + '<button type="button" class="forge-button forge-button--secondary" data-celebrate-share>Share</button>'
      + '<button type="button" class="forge-button forge-button--primary" data-celebrate-close autofocus>Done</button></div>';
    doc.body.appendChild(dialog);
    var opener = doc.activeElement;
    // The popup opens as a session ends, often under the finger that tapped
    // "Next". Ignore clicks for a moment so a double tap cannot press Share
    // (which saves a file on desktop) or dismiss it unseen.
    var openedAt = Date.now();
    dialog.addEventListener('click', function (e) {
      if (Date.now() - openedAt < 600) return;
      if (e.target === dialog || e.target.closest('[data-celebrate-close]')) dialog.close();
      else if (e.target.closest('[data-celebrate-share]')) share(lead, dialog.querySelector('.forge-celebrate__status'));
    });
    dialog.addEventListener('close', function () {
      dialog.remove();
      if (current === dialog) current = null;
      if (opener && opener.focus) try { opener.focus(); } catch (e) {}
    });
    current = dialog;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  // ── Share image ─────────────────────────────────────────────────────────
  var FRAME_STOPS = {
    iron: ['#3A3734', '#5F5A55', '#8A847D'], bronze: ['#7A4A22', '#C98A4B', '#F2C38E'],
    silver: ['#8A95A1', '#D3DAE1', '#FFFFFF'], gold: ['#94660A', '#E3AE2E', '#FFE79A'],
    ember: ['#A42A06', '#FF6B2C', '#FFC93C']
  };
  // An anvil, for rank cards (badge cards use the badge's own icon).
  var ANVIL = '<path d="M4 8h12.5a3.5 3.5 0 0 1-3.5 3.5h-1V15h3v2.5H8V15h3v-3.5H8A4 4 0 0 1 4 8z"/><path d="M16.5 8H20"/>';

  function cardSvg(event) {
    var w = words(event);
    var trophy = event.type === 'trophy';
    var frame = trophy ? 'gold' : event.type === 'rank' ? event.rank.frame : event.tier.key;
    var stops = FRAME_STOPS[frame] || FRAME_STOPS.iron;
    var icon = trophy ? A().ICONS.trophy : event.type === 'rank' ? ANVIL : (A().ICONS[event.badge.icon] || '');
    var title = trophy ? 'League winner' : event.type === 'rank' ? event.rank.name : event.badge.name;
    var sub = trophy ? (event.count === 1 ? '1st in the class this week' : event.count + ' weekly wins') : event.type === 'rank' ? event.rank.frameName + ' frame' : event.tier.name + ' tier';
    var font = "font-family='Rethink Sans, Helvetica Neue, Arial, sans-serif'";
    return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">'
      + '<defs><radialGradient id="glow" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="' + stops[1] + '" stop-opacity=".28"/><stop offset="1" stop-color="#141210" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + stops[2] + '"/><stop offset=".45" stop-color="' + stops[1] + '"/><stop offset="1" stop-color="' + stops[0] + '"/></linearGradient></defs>'
      + '<rect width="1080" height="1080" fill="#141210"/><rect width="1080" height="1080" fill="url(#glow)"/>'
      + '<text x="540" y="150" text-anchor="middle" ' + font + ' font-size="34" font-weight="700" letter-spacing="6" fill="#B8B4AD">' + esc(w.kicker.toUpperCase()) + '</text>'
      + '<circle cx="540" cy="430" r="190" fill="#211E1B" stroke="url(#ring)" stroke-width="30"/>'
      + '<g transform="translate(400 290) scale(11.6667)" fill="none" stroke="' + stops[1] + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + icon + '</g>'
      + '<text x="540" y="770" text-anchor="middle" ' + font + ' font-size="84" font-weight="800" fill="#F5F1EA">' + esc(title) + '</text>'
      + '<text x="540" y="840" text-anchor="middle" ' + font + ' font-size="40" font-weight="600" fill="' + stops[1] + '">' + esc(sub) + '</text>'
      + '<text x="540" y="990" text-anchor="middle" ' + font + ' font-size="32" font-weight="700" fill="#D55C13">Forge</text>'
      + '<text x="540" y="1032" text-anchor="middle" ' + font + ' font-size="26" fill="#B8B4AD">forgelearning.github.io/edu</text>'
      + '</svg>';
  }

  function cardPng(event) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(new Blob([cardSvg(event)], { type: 'image/svg+xml' }));
      var img = new Image();
      img.onload = function () {
        var canvas = doc.createElement('canvas');
        canvas.width = 1080; canvas.height = 1080;
        canvas.getContext('2d').drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('No image')); }, 'image/png');
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('No image')); };
      img.src = url;
    });
  }

  function say(status, text) { if (status) status.textContent = text; }

  // Native share sheet with the image where the device supports it; else the
  // text and link; else save the image and copy the text.
  function share(event, status) {
    var w = words(event), text = w.share + ' ' + SITE;
    var nav = root.navigator || {};
    return cardPng(event).then(function (blob) {
      var file = typeof File === 'function' ? new File([blob], 'forge-' + (event.type === 'trophy' ? 'trophy' : event.type === 'rank' ? event.rank.key : event.badge.key) + '.png', { type: 'image/png' }) : null;
      if (file && nav.canShare && nav.canShare({ files: [file] })) return nav.share({ files: [file], title: 'Forge', text: text });
      if (nav.share) return nav.share({ title: 'Forge', text: w.share, url: SITE });
      var a = doc.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = file ? file.name : 'forge.png';
      doc.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      var copied = nav.clipboard && nav.clipboard.writeText ? nav.clipboard.writeText(text).then(function () { return true; }, function () { return false; }) : Promise.resolve(false);
      return copied.then(function (ok) { say(status, ok ? 'Image saved and message copied — paste it wherever you share.' : 'Image saved.'); });
    }).catch(function (err) {
      if (err && err.name === 'AbortError') return; // the student closed the share sheet
      say(status, 'Sharing isn’t available here. Try again on your phone.');
    });
  }

  // Share buttons outside the popup (profile rank card and earned badges).
  function fromButton(button) {
    var kind = button.getAttribute('data-forge-share');
    if (kind === 'trophy') {
      var count = Math.floor(Number(button.getAttribute('data-count')) || 0);
      return count > 0 ? { type: 'trophy', count: count } : null;
    }
    if (kind === 'rank') {
      var rank = R() && R().byKey(button.getAttribute('data-rank'));
      return rank ? { type: 'rank', rank: rank } : null;
    }
    if (kind === 'badge' && A()) {
      var key = button.getAttribute('data-badge'), tierKey = button.getAttribute('data-tier');
      var badge = A().BADGES.filter(function (b) { return b.key === key; })[0];
      var tier = A().TIERS.filter(function (t) { return t.key === tierKey; })[0];
      return badge && tier ? { type: 'badge', badge: badge, tier: tier } : null;
    }
    return null;
  }
  if (doc) doc.addEventListener('click', function (e) {
    var button = e.target.closest && e.target.closest('[data-forge-share]');
    if (!button) return;
    var event = fromButton(button);
    if (!event) return;
    var status = button.parentNode && button.parentNode.querySelector('.forge-share-status');
    if (!status) {
      status = doc.createElement('span');
      status.className = 'forge-share-status';
      status.setAttribute('role', 'status');
      button.insertAdjacentElement('afterend', status);
    }
    share(event, status);
  });

  root.ForgeCelebrate = { check: check, diff: diff, show: show, share: share, cardSvg: cardSvg };
}(typeof window !== 'undefined' ? window : globalThis));
