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
    if (data && data.reason === 'codes_required') {
      return '<section class="forge-friends" aria-labelledby="forge-friends-title">'
        + '<div class="forge-league__head"><h2 id="forge-friends-title">Friends</h2><span>Paused</span></div>'
        + '<p class="forge-league__note">Your teacher needs to give everyone in this class a private student code before friends can be used.</p></section>';
    }
    if (!data || !data.enabled) return '';
    var friends = data.friends || [], incoming = data.incoming || [], outgoing = data.outgoing || [], classmates = data.classmates || [];
    var h = '<section class="forge-friends" aria-labelledby="forge-friends-title">';
    h += '<div class="forge-league__head"><h2 id="forge-friends-title">Friends</h2><span>Classmates only</span></div>';
    h += '<p class="forge-friends__sharing" id="forge-friends-sharing">If you accept a request, you and that classmate can see each other’s weekly and total XP, answer count, accuracy and streak. Either of you can remove the friendship later.</p>';
    h += '<p class="forge-friends__status" role="status" aria-live="polite"></p>';

    incoming.forEach(function (p) {
      h += '<div class="forge-friends__request"><span><strong>' + esc(p.name) + '</strong> wants to be friends</span>'
        + '<span class="forge-friends__actions"><button type="button" class="forge-button forge-button--primary" data-friend-accept="' + esc(p.student_id) + '" aria-describedby="forge-friends-sharing">Accept</button>'
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
      h += '<p class="forge-friends__sharing">Sending a request shows your name to that classmate. Your stats stay private until they accept.</p>';
      h += '<form class="forge-friends__add" data-friend-add><label class="forge-sr-only" for="friend-pick">Classmate to add</label>'
        + '<select id="friend-pick"><option value="">Add a classmate…</option>'
        + classmates.map(function (c) { return '<option value="' + esc(c.student_id) + '">' + esc(c.name) + '</option>'; }).join('')
        + '</select><button type="submit" class="forge-button forge-button--secondary">Send request</button></form>';
    }
    return h + '</section>';
  }

  var MESSAGES = {
    requested: 'Request sent.', accepted: 'You’re now friends.', declined: 'Request declined.', removed: 'Removed.',
    already_requested: 'You’ve already sent a request.', already_friends: 'You’re already friends.',
    too_many_pending: 'Wait for some of your requests to be answered first.',
    disabled: 'Your teacher has switched friends off.', codes_required: 'Friends are paused until everyone has a private student code.',
    request_waiting_for_you: 'This classmate has asked you already. Use Accept on their request to connect.',
    not_in_class: 'That student isn’t in your class.'
  };

  function mount(el, ctx) {
    if (!el || !L()) return Promise.resolve(null);
    function load(message, isError) {
      return L().studentRpc('get_class_friends', ctx).then(function (data) {
        data = data && typeof data === 'object' && !Array.isArray(data) ? data : null;
        el.innerHTML = html(data);
        var status = el.querySelector('.forge-friends__status');
        if (status && message) { status.textContent = message; status.classList.toggle('is-error', !!isError); }
        return data;
      }).catch(function () { el.innerHTML = ''; return null; });
    }
    function act(name, extra, button) {
      if (button) button.disabled = true;
      return L().studentRpc(name, ctx, extra).then(function (result) {
        return load(MESSAGES[result] || 'Something went wrong. Try again.', !/^(requested|accepted|declined|removed)$/.test(result));
      }).catch(function () {
        if (button) button.disabled = false;
        var status = el.querySelector('.forge-friends__status');
        if (status) { status.textContent = 'Something went wrong. Try again.'; status.classList.add('is-error'); }
      });
    }
    // One set of delegated listeners on the card, bound once; the card's
    // contents are re-rendered after every action.
    if (!el._forgeFriendsBound) {
      el._forgeFriendsBound = true;
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || !el.contains(b)) return;
        if (b.hasAttribute('data-friend-accept')) {
          act('respond_friend_request', { p_other_student_id: b.getAttribute('data-friend-accept'), p_accept: true }, b);
        } else if (b.hasAttribute('data-friend-decline')) {
          act('respond_friend_request', { p_other_student_id: b.getAttribute('data-friend-decline'), p_accept: false }, b);
        } else if (b.hasAttribute('data-friend-remove')) {
          // Removing a friend is a two-step click, so it can't happen by accident.
          if (b.getAttribute('data-confirm') !== 'true') { b.setAttribute('data-confirm', 'true'); b.textContent = 'Confirm'; return; }
          act('remove_friend', { p_other_student_id: b.getAttribute('data-friend-remove') }, b);
        }
      });
      el.addEventListener('submit', function (e) {
        var form = e.target.closest('[data-friend-add]');
        if (!form) return;
        e.preventDefault();
        var pick = form.querySelector('select');
        if (!pick.value) {
          // Our own message, in the card: the browser's "required" bubble
          // popped up over the friend requests.
          var status = el.querySelector('.forge-friends__status');
          if (status) { status.textContent = 'Choose a classmate first.'; status.classList.add('is-error'); }
          pick.focus();
          return;
        }
        act('send_friend_request', { p_target_student_id: pick.value }, form.querySelector('button'));
      });
    }
    return load();
  }

  // Teacher view: who is friends with whom, from the class's friendship rows
  // (readable by the class teacher only, migration 20260928140000).
  function studentName(byId, id) {
    var s = byId[id];
    return s ? (s.display_name || s.name || 'Student') : 'Former student';
  }

  function teacherLinks(students, rows, studentId) {
    var byId = {};
    (students || []).forEach(function (s) { byId[s.id] = s; });
    var friends = [], waiting = [];
    (rows || []).forEach(function (r) {
      if (studentId && r.requester_id !== studentId && r.addressee_id !== studentId) return;
      var other = r.requester_id === studentId ? r.addressee_id : r.requester_id;
      if (r.status === 'accepted') friends.push(studentId ? studentName(byId, other) : [studentName(byId, r.requester_id), studentName(byId, r.addressee_id)]);
      else waiting.push({ from: studentName(byId, r.requester_id), to: studentName(byId, r.addressee_id) });
    });
    return { friends: friends, waiting: waiting, byId: byId };
  }

  function teacherHtml(students, rows, enabled, readError, paused) {
    var links = teacherLinks(students, rows);
    var h = '<section class="forge-friends forge-friends--teacher" aria-labelledby="teacher-friends-title">';
    var status = enabled ? (paused ? 'Friends paused' : 'Friends on') : 'Friends off';
    h += '<div class="forge-league__head"><h2 id="teacher-friends-title">Friendships</h2><span class="forge-league__status' + (enabled && !paused ? ' is-on' : '') + '">' + status + '</span></div>';
    if (readError) {
      return h + '<p class="forge-league__note forge-friends__status is-error" role="alert">Couldn’t load friendships. Refresh this class to try again.</p></section>';
    }
    h += '<p class="forge-league__note">The teacher chooses whether this class can use friends. Classmates can see each other’s names to send requests; accepted friends share weekly and total XP, answer count, accuracy and streak. Either student can remove a connection.</p>';
    if (enabled && paused) {
      h += '<p class="forge-league__note">Friends are paused until every student in this class has a private code.</p>';
    }
    if (!links.friends.length && !links.waiting.length) {
      return h + '<p class="forge-league__note">' + (enabled && paused
        ? 'No friend connections in this class yet.'
        : 'No friend connections in this class yet. Students add classmates from their dashboard.') + '</p></section>';
    }
    // Group accepted pairs by student so each name appears once with its friends.
    var groups = {};
    links.friends.forEach(function (pair) {
      (groups[pair[0]] = groups[pair[0]] || []).push(pair[1]);
      (groups[pair[1]] = groups[pair[1]] || []).push(pair[0]);
    });
    var names = Object.keys(groups).sort(function (a, b) { return a.localeCompare(b); });
    h += '<p class="forge-league__note forge-friends__summary">' + links.friends.length + ' friendship' + (links.friends.length === 1 ? '' : 's')
      + (links.waiting.length ? ' · ' + links.waiting.length + ' request' + (links.waiting.length === 1 ? '' : 's') + ' waiting' : '') + '</p>';
    if (names.length) {
      h += '<ul class="forge-friends__list">';
      names.forEach(function (n) {
        h += '<li class="forge-friends__row"><div><span class="forge-friends__name">' + esc(n) + '</span><span class="forge-friends__stat">Friends with ' + esc(groups[n].sort(function (a, b) { return a.localeCompare(b); }).join(', ')) + '</span></div></li>';
      });
      h += '</ul>';
    }
    if (links.waiting.length) {
      h += '<details class="forge-friends__waiting"><summary>Requests waiting (' + links.waiting.length + ')</summary><ul>';
      links.waiting.forEach(function (w) { h += '<li>' + esc(w.from) + ' → ' + esc(w.to) + '</li>'; });
      h += '</ul></details>';
    }
    return h + '</section>';
  }

  // One student's connections, for the teacher's student profile.
  function teacherStudentHtml(students, rows, studentId, readError) {
    var links = teacherLinks(students, rows, studentId);
    var me = studentName(links.byId, studentId);
    var h = '<section class="card forge-friends__profile"><div class="card-title">Friends</div>';
    if (readError) return h + '<p class="forge-friends__status is-error" role="alert">Couldn’t load friendships. Refresh this class to try again.</p></section>';
    h += '<p>' + (links.friends.length ? esc(links.friends.sort(function (a, b) { return a.localeCompare(b); }).join(', ')) : 'No friends added yet.') + '</p>';
    links.waiting.forEach(function (w) {
      h += '<p class="forge-league__note">' + (w.from === me ? 'Waiting for ' + esc(w.to) + ' to accept' : esc(w.from) + ' has sent a request') + '</p>';
    });
    return h + '</section>';
  }

  root.ForgeFriends = { html: html, mount: mount, stat: stat, teacherHtml: teacherHtml, teacherStudentHtml: teacherStudentHtml };
}(typeof window !== 'undefined' ? window : globalThis));
