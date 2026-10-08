/* Friends for independent students: signed in, not in a class.

   Backed by get_independent_friends and the functions beside it
   (supabase/migrations/20261008162807_independent_friends.sql). Everything is
   off until app_flags.independent_friends is switched on after safeguarding
   sign-off; until then the server answers { available: false } and neither
   the Settings section nor the Home card appears.

   A student opts in from Settings, confirming they are 13 or over and
   choosing the name friends see. There is no search and no list of other
   students: you can only add someone whose private friend code they gave
   you. Nothing about the other student is shown until they accept. There is
   no messaging. Classes keep their own friends card (scripts/forge-friends.js).

   Home shows nothing to a student who has not opted in, so the page never
   nudges anyone towards sharing more. */
(function (root) {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function signedIn() {
    var A = root.ForgeAuth;
    return !!(A && A.hasSession && A.hasSession() && A.accessToken && A.accessToken());
  }

  function rpc(name, body) {
    if (!signedIn() || !root.ForgeAPI) return Promise.reject(new Error('Not signed in'));
    return root.ForgeAPI.rpc(name, body || {}, { token: root.ForgeAuth.accessToken() });
  }

  function load() {
    if (!signedIn()) return Promise.resolve(null);
    return rpc('get_independent_friends').then(function (data) {
      return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
    }).catch(function () { return null; });
  }

  // ABCDEFGH -> ABCD-EFGH, easier to read out to a friend.
  function formatCode(code) {
    code = String(code || '');
    return code.length === 8 ? code.slice(0, 4) + '-' + code.slice(4) : code;
  }

  var MESSAGES = {
    enabled: 'Friends is on. Share your code with people you know.',
    disabled: 'Friends is off. Your friends and requests have been removed.',
    new_code: 'New code made. Your old code no longer works.',
    requested: 'Request sent. You’ll see their name once they accept.',
    accepted: 'You’re now friends.',
    declined: 'Request declined.',
    removed: 'Removed.',
    age_required: 'You need to be 13 or older to use friends.',
    name_required: 'Enter the first name friends will see.',
    code_not_recognised: 'That code didn’t work. Check it with your friend.',
    own_code: 'That’s your own code.',
    already_friends: 'You’re already friends.',
    already_requested: 'You’ve already sent them a request.',
    request_waiting_for_you: 'They’ve already asked you. Accept their request below.',
    too_many_pending: 'Wait for some of your requests to be answered first.',
    too_many_attempts: 'Too many codes tried. Try again in an hour.',
    not_enabled: 'Turn on friends in Settings first.',
    unavailable: 'Friends isn’t available right now.',
    not_found: 'That request has already been answered.',
    error: 'Something went wrong. Check your connection and try again.'
  };
  function message(result) { return MESSAGES[result] || MESSAGES.error; }

  function stat(f) {
    var parts = [Number(f.xp_week || 0).toLocaleString() + ' XP this week'];
    parts.push(f.accuracy == null ? 'no answers yet' : f.accuracy + '% accuracy');
    if (f.streak) parts.push(f.streak + '-day streak');
    return parts.join(' · ');
  }

  // ── Settings ─────────────────────────────────────────────────────────
  var SHARED = 'Friends see your first name and initial, your weekly and total XP, answer count, accuracy and streak. There is no messaging.';

  function settingsHtml(data) {
    if (!data || !data.available) return '';
    var h = '<div class="settings-section-heading"><div><p class="settings-kicker">FRIENDS</p><h2 id="friends-title">Friends</h2></div><span class="settings-section-mark" aria-hidden="true">F</span></div>';
    if (!data.enabled) {
      h += '<p class="settings-copy">Add friends you know by swapping private codes. ' + esc(SHARED) + ' Friends is off until you turn it on.</p>'
        + '<form class="settings-friends-form" data-friends-enable>'
        + '<label class="settings-friends-field"><span>First name friends will see</span>'
        + '<input type="text" id="friends-name" maxlength="30" autocomplete="given-name" value="' + esc(data.suggested_name || '') + '"></label>'
        + '<label class="settings-friends-check"><input type="checkbox" id="friends-age"> <span>I’m 13 or older</span></label>'
        + '<button type="submit" class="forge-button forge-button--primary">Turn on friends</button></form>';
    } else {
      h += '<p class="settings-copy">Friends is on. ' + esc(SHARED) + ' Friends see you as <strong>' + esc(data.name) + '</strong>.</p>'
        + '<div class="settings-friends-code"><span>Your friend code</span><strong id="friends-code">' + esc(formatCode(data.code)) + '</strong>'
        + '<small>Only give it to people you know. Anyone with it can send you a request, and you choose whether to accept.</small></div>'
        + '<div class="settings-friends-actions">'
        + '<button type="button" class="forge-button forge-button--secondary" data-friends-new-code>Make a new code</button>'
        + '<button type="button" class="forge-button forge-button--danger" data-friends-disable>Turn off friends</button></div>';
    }
    return h + '<p class="settings-friends-status" role="status" aria-live="polite"></p>';
  }

  function mountSettings(el) {
    if (!el) return Promise.resolve(null);
    var confirmOff = false;
    function render(data, note, isError) {
      var h = settingsHtml(data);
      el.hidden = !h;
      el.innerHTML = h;
      var status = el.querySelector('.settings-friends-status');
      if (status && note) { status.textContent = note; status.classList.toggle('is-error', !!isError); }
      return data;
    }
    function act(name, body, button) {
      if (button) button.disabled = true;
      return rpc(name, body).then(function (result) {
        var code = result && result.result;
        var ok = code === 'enabled' || code === 'disabled' || code === 'new_code';
        return load().then(function (data) { render(data, message(code), !ok); });
      }).catch(function () {
        if (button) button.disabled = false;
        var status = el.querySelector('.settings-friends-status');
        if (status) { status.textContent = MESSAGES.error; status.classList.add('is-error'); }
      });
    }
    if (!el.dataset.friendsWired) {
      el.dataset.friendsWired = '1';
      el.addEventListener('submit', function (e) {
        var form = e.target.closest('[data-friends-enable]');
        if (!form) return;
        e.preventDefault();
        var name = (el.querySelector('#friends-name') || {}).value || '';
        var over13 = !!(el.querySelector('#friends-age') || {}).checked;
        var status = el.querySelector('.settings-friends-status');
        // The server checks both again; this only saves a round trip.
        if (!over13) { status.textContent = MESSAGES.age_required; status.classList.add('is-error'); return; }
        if (!name.trim()) { status.textContent = MESSAGES.name_required; status.classList.add('is-error'); return; }
        act('set_independent_friends', { p_enabled: true, p_over_13: true, p_name: name }, form.querySelector('button'));
      });
      el.addEventListener('click', function (e) {
        var newCode = e.target.closest('[data-friends-new-code]');
        var off = e.target.closest('[data-friends-disable]');
        if (newCode) act('new_independent_friend_code', {}, newCode);
        if (off) {
          // Two presses: turning off deletes every friendship and request.
          if (!confirmOff) {
            confirmOff = true;
            off.textContent = 'Turn off and remove all friends';
            var status = el.querySelector('.settings-friends-status');
            if (status) { status.textContent = 'Press again to turn off. This removes all your friends and requests.'; status.classList.remove('is-error'); }
            return;
          }
          confirmOff = false;
          act('set_independent_friends', { p_enabled: false }, off);
        }
      });
    }
    return load().then(function (data) { return render(data); });
  }

  // ── Home card ────────────────────────────────────────────────────────
  function homeHtml(data) {
    if (!data || !data.available || !data.enabled) return '';
    var friends = data.friends || [], incoming = data.incoming || [], outgoing = data.outgoing || [];
    var R = root.ForgeRanks;
    var h = '<section class="forge-friends" aria-labelledby="independent-friends-title">';
    h += '<div class="forge-league__head"><h2 id="independent-friends-title">Friends</h2><a href="student-settings.html">Your code</a></div>';
    h += '<p class="forge-friends__status" role="status" aria-live="polite"></p>';
    incoming.forEach(function (p) {
      h += '<div class="forge-friends__request"><span><strong>' + esc(p.name) + '</strong> wants to be friends</span>'
        + '<span class="forge-friends__actions"><button type="button" class="forge-button forge-button--primary" data-ifriend-accept="' + esc(p.friendship_id) + '">Accept</button>'
        + '<button type="button" class="forge-button forge-button--secondary" data-ifriend-decline="' + esc(p.friendship_id) + '">Decline</button></span></div>';
    });
    if (friends.length) {
      h += '<ul class="forge-friends__list">';
      friends.forEach(function (f) {
        var rank = R ? R.rankFor(f.xp_total) : null;
        h += '<li class="forge-friends__row"><div class="forge-friends__who">' + (R ? R.avatarHtml(f.name, f.xp_total, { size: 'sm', rank: rank }) : '')
          + '<div><span class="forge-friends__name">' + esc(f.name) + (R ? ' ' + R.chipHtml(f.xp_total, rank) : '') + '</span><span class="forge-friends__stat">' + esc(stat(f)) + '</span></div></div>'
          + '<button type="button" class="forge-friends__remove" data-ifriend-remove="' + esc(f.friendship_id) + '" aria-label="Remove ' + esc(f.name) + ' as a friend">Remove</button></li>';
      });
      h += '</ul>';
    } else if (!incoming.length) {
      h += '<p class="forge-league__note">Swap friend codes with people you know to see their XP, accuracy and streaks.</p>';
    }
    outgoing.forEach(function (p) {
      h += '<div class="forge-friends__pending"><span>Request sent, waiting for a reply</span><button type="button" class="forge-friends__remove" data-ifriend-remove="' + esc(p.friendship_id) + '">Cancel</button></div>';
    });
    h += '<form class="forge-friends__add" data-ifriend-add><label class="forge-sr-only" for="ifriend-code">Friend code</label>'
      + '<input type="text" id="ifriend-code" maxlength="9" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Friend code, e.g. ABCD-EFGH">'
      + '<button type="submit" class="forge-button forge-button--secondary">Send request</button></form>';
    return h + '</section>';
  }

  function mountHome(el) {
    if (!el) return Promise.resolve(null);
    function render(data, note, isError) {
      el.innerHTML = homeHtml(data);
      var status = el.querySelector('.forge-friends__status');
      if (status && note) { status.textContent = note; status.classList.toggle('is-error', !!isError); }
      return data;
    }
    function act(name, body, button) {
      if (button) button.disabled = true;
      return rpc(name, body).then(function (result) {
        var code = result && result.result;
        var ok = code === 'requested' || code === 'accepted' || code === 'declined' || code === 'removed';
        return load().then(function (data) { render(data, message(code), !ok); if (!ok && name === 'send_independent_friend_request') { var input = el.querySelector('#ifriend-code'); if (input) { input.value = body.p_code; input.focus(); } } });
      }).catch(function () {
        if (button) button.disabled = false;
        var status = el.querySelector('.forge-friends__status');
        if (status) { status.textContent = MESSAGES.error; status.classList.add('is-error'); }
      });
    }
    if (!el.dataset.friendsWired) {
      el.dataset.friendsWired = '1';
      el.addEventListener('click', function (e) {
        var accept = e.target.closest('[data-ifriend-accept]');
        var decline = e.target.closest('[data-ifriend-decline]');
        var remove = e.target.closest('[data-ifriend-remove]');
        if (accept) act('respond_independent_friend_request', { p_friendship_id: accept.getAttribute('data-ifriend-accept'), p_accept: true }, accept);
        if (decline) act('respond_independent_friend_request', { p_friendship_id: decline.getAttribute('data-ifriend-decline'), p_accept: false }, decline);
        if (remove) act('remove_independent_friend', { p_friendship_id: remove.getAttribute('data-ifriend-remove') }, remove);
      });
      el.addEventListener('submit', function (e) {
        var form = e.target.closest('[data-ifriend-add]');
        if (!form) return;
        e.preventDefault();
        var input = form.querySelector('#ifriend-code');
        var code = (input && input.value || '').replace(/[^A-Za-z0-9]/g, '');
        if (code.length !== 8) {
          var status = el.querySelector('.forge-friends__status');
          if (status) { status.textContent = 'A friend code has 8 letters and numbers.'; status.classList.add('is-error'); }
          return;
        }
        act('send_independent_friend_request', { p_code: code }, form.querySelector('button'));
      });
    }
    return load().then(function (data) { return render(data); });
  }

  root.ForgeIndependentFriends = {
    load: load, formatCode: formatCode, message: message, stat: stat,
    settingsHtml: settingsHtml, homeHtml: homeHtml, mountSettings: mountSettings, mountHome: mountHome
  };
}(typeof window !== 'undefined' ? window : globalThis));
