/* Class friends card for the student dashboard.
   Backed by get_class_friends / send_friend_request / respond_friend_request /
   remove_friend (migration 20260928130000). Friends are classmates only, both
   sides must accept, and there is no messaging. If the functions are missing
   or the teacher has switched friends off, the card does not appear.
   Depends on scripts/forge-league.js for the identity-carrying RPC helper. */
(function (root) {
  var L = function () { return root.ForgeLeague; };
  var esc = function (v) { return L().esc(v); };

  function stat(f) {
    var parts = [Number(f.xp_week || 0).toLocaleString() + ' XP this week'];
    parts.push(f.accuracy == null ? 'no answers yet' : f.accuracy + '% accuracy');
    if (f.streak) parts.push(f.streak + '-day streak');
    return parts.join(' · ');
  }

  function html(data) {
    if (!data || !data.enabled) return '';
    var friends = data.friends || [], incoming = data.incoming || [], outgoing = data.outgoing || [], classmates = data.classmates || [];
    var h = '<section class="forge-friends" aria-labelledby="forge-friends-title">';
    h += '<div class="forge-league__head"><h2 id="forge-friends-title">Friends</h2><span>Classmates only</span></div>';
    h += '<p class="forge-friends__status" role="status" aria-live="polite"></p>';

    incoming.forEach(function (p) {
      h += '<div class="forge-friends__request"><span><strong>' + esc(p.name) + '</strong> wants to be friends</span>'
        + '<span class="forge-friends__actions"><button type="button" class="forge-button forge-button--primary" data-friend-accept="' + esc(p.student_id) + '">Accept</button>'
        + '<button type="button" class="forge-button forge-button--secondary" data-friend-decline="' + esc(p.student_id) + '">Decline</button></span></div>';
    });

    if (friends.length) {
      h += '<ul class="forge-friends__list">';
      friends.forEach(function (f) {
        h += '<li class="forge-friends__row"><div><span class="forge-friends__name">' + esc(f.name) + '</span><span class="forge-friends__stat">' + esc(stat(f)) + '</span></div>'
          + '<button type="button" class="forge-friends__remove" data-friend-remove="' + esc(f.student_id) + '" aria-label="Remove ' + esc(f.name) + ' as a friend">Remove</button></li>';
      });
      h += '</ul>';
    } else if (!incoming.length) {
      h += '<p class="forge-league__note">Add classmates to see their XP, accuracy and streaks.</p>';
    }

    outgoing.forEach(function (p) {
      h += '<div class="forge-friends__pending"><span>Waiting for ' + esc(p.name) + '</span><button type="button" class="forge-friends__remove" data-friend-remove="' + esc(p.student_id) + '">Cancel</button></div>';
    });

    if (classmates.length) {
      h += '<form class="forge-friends__add" data-friend-add><label class="forge-sr-only" for="friend-pick">Classmate to add</label>'
        + '<select id="friend-pick" required><option value="">Add a classmate…</option>'
        + classmates.map(function (c) { return '<option value="' + esc(c.student_id) + '">' + esc(c.name) + '</option>'; }).join('')
        + '</select><button type="submit" class="forge-button forge-button--secondary">Send request</button></form>';
    }
    return h + '</section>';
  }

  var MESSAGES = {
    requested: 'Request sent.', accepted: 'You’re now friends.', declined: 'Request declined.', removed: 'Removed.',
    already_requested: 'You’ve already sent a request.', already_friends: 'You’re already friends.',
    too_many_pending: 'Wait for some of your requests to be answered first.',
    disabled: 'Your teacher has switched friends off.', not_in_class: 'That student isn’t in your class.'
  };

  function mount(el, ctx) {
    if (!el || !L()) return Promise.resolve(null);
    function load(message) {
      return L().studentRpc('get_class_friends', ctx).then(function (data) {
        data = data && typeof data === 'object' && !Array.isArray(data) ? data : null;
        el.innerHTML = html(data);
        var status = el.querySelector('.forge-friends__status');
        if (status && message) status.textContent = message;
        wire();
        return data;
      }).catch(function () { el.innerHTML = ''; return null; });
    }
    function act(name, extra, button) {
      if (button) button.disabled = true;
      return L().studentRpc(name, ctx, extra).then(function (result) {
        return load(MESSAGES[result] || 'Something went wrong. Try again.');
      }).catch(function () {
        if (button) button.disabled = false;
        var status = el.querySelector('.forge-friends__status');
        if (status) status.textContent = 'Something went wrong. Try again.';
      });
    }
    function wire() {
      el.querySelectorAll('[data-friend-accept]').forEach(function (b) {
        b.onclick = function () { act('respond_friend_request', { p_other_student_id: b.getAttribute('data-friend-accept'), p_accept: true }, b); };
      });
      el.querySelectorAll('[data-friend-decline]').forEach(function (b) {
        b.onclick = function () { act('respond_friend_request', { p_other_student_id: b.getAttribute('data-friend-decline'), p_accept: false }, b); };
      });
      el.querySelectorAll('[data-friend-remove]').forEach(function (b) {
        // Removing a friend is a two-step click, so it can't happen by accident.
        b.onclick = function () {
          if (b.getAttribute('data-confirm') !== 'true') { b.setAttribute('data-confirm', 'true'); b.textContent = 'Confirm'; return; }
          act('remove_friend', { p_other_student_id: b.getAttribute('data-friend-remove') }, b);
        };
      });
      var form = el.querySelector('[data-friend-add]');
      if (form) form.onsubmit = function (e) {
        e.preventDefault();
        var pick = form.querySelector('select');
        if (!pick.value) return;
        act('send_friend_request', { p_target_student_id: pick.value }, form.querySelector('button'));
      };
    }
    return load();
  }

  root.ForgeFriends = { html: html, mount: mount, stat: stat };
}(typeof window !== 'undefined' ? window : globalThis));
