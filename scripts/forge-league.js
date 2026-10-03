/* Weekly class league: fetch and render.
   Data comes from get_class_weekly_league (migration 20260928120000), which
   checks the student's identity server-side and returns only the top three
   plus the places either side of the caller. Everything here fails quietly:
   if the function is missing, the class has it switched off, or the request
   fails, the league simply does not appear. */
(function (root) {
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Fill in class code / student code from the saved class registry when the
  // caller only knows the class id.
  function resolve(ctx) {
    ctx = ctx || {};
    var out = { studentId: ctx.studentId, classCode: ctx.classCode, studentCode: ctx.studentCode, studentName: ctx.studentName };
    try {
      var FC = root.ForgeClasses;
      // list() is scoped to the active student name; a signed-in account's
      // name can differ from the name it joined a class with, so fall back
      // to every saved class on this device.
      var pools = FC ? [FC.list(), FC.load ? FC.load() : []] : [];
      var entry = null;
      pools.some(function (pool) {
        entry = (ctx.classId && pool.filter(function (c) { return c.classId === ctx.classId; })[0])
          || (ctx.studentId && pool.filter(function (c) { return c.studentId === ctx.studentId; })[0]) || null;
        return !!entry;
      });
      if (entry) {
        // One student row per class: when the class matched, its own row is
        // the right identity, even if the caller passed another class's row.
        if (ctx.classId && entry.classId === ctx.classId && entry.studentId) out.studentId = entry.studentId;
        out.studentId = out.studentId || entry.studentId;
        out.classCode = out.classCode || entry.classCode;
        out.studentCode = out.studentCode || entry.studentCode;
        out.studentName = out.studentName || entry.studentName;
      }
    } catch (e) {}
    return out;
  }

  // Call a class-student RPC with the caller's identity (the same four
  // parameters every such function takes), plus any extra arguments.
  function studentRpc(name, ctx, extra) {
    var c = resolve(ctx);
    if (!c.studentId || !c.classCode || !root.ForgeAPI) return Promise.reject(new Error('No class session'));
    var token = (root.ForgeAuth && root.ForgeAuth.accessToken && root.ForgeAuth.accessToken()) || root.SUPABASE_KEY || root.ForgeAPI.config.key;
    return root.ForgeAPI.rpc(name, Object.assign({
      p_student_id: String(c.studentId),
      p_class_code: String(c.classCode).trim().toUpperCase(),
      p_student_code: c.studentCode || null,
      p_name: c.studentName || null
    }, extra || {}), { token: token });
  }

  // Shown when nobody in the class has XP yet this week.
  function emptyHtml(title, body) {
    return '<div class="forge-league__empty">'
      + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 5h3v2a4 4 0 0 1-3 3.9M7 5H4v2a4 4 0 0 0 3 3.9"/></svg>'
      + '<p class="forge-league__empty-title">' + title + '</p><p>' + body + '</p></div>';
  }

  function fetchLeague(ctx) {
    return studentRpc('get_class_weekly_league', ctx).then(function (data) {
      return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
    }).catch(function () { return null; });
  }

  function html(data) {
    if (!data || !data.enabled) return '';
    var rows = Array.isArray(data.rows) ? data.rows : [];
    var you = data.you || null;
    var h = '<section class="forge-league" aria-labelledby="forge-league-title">';
    h += '<div class="forge-league__head"><h2 id="forge-league-title">This week’s league</h2><span>Resets Monday</span></div>';
    if (!rows.length) {
      return h + emptyHtml('No XP yet this week', 'Answer a question to take first place.') + '</section>';
    }
    h += '<ol class="forge-league__rows">';
    var lastSeq = 0, above = null;
    rows.forEach(function (r) {
      if (r.seq > lastSeq + 1) h += '<li class="forge-league__gap" aria-hidden="true">…</li>';
      if (r.is_you) above = rows.filter(function (x) { return x.seq === r.seq - 1; })[0] || null;
      h += '<li class="forge-league__row' + (r.is_you ? ' is-you' : '') + '"><span class="forge-league__pos">' + esc(r.position) + '</span>'
        + '<span class="forge-league__name">' + (r.is_you ? 'You' : esc(r.name)) + '</span>'
        + '<span class="forge-league__xp">' + Number(r.xp || 0).toLocaleString() + ' XP</span></li>';
      lastSeq = r.seq;
    });
    h += '</ol>';
    var note;
    if (!you) note = 'Answer a question this week to join the league.';
    else if (you.position === 1) note = 'You’re top of the class this week.';
    else if (above) note = (above.xp - you.xp + 1).toLocaleString() + ' XP to overtake ' + esc(above.name) + (/\.$/.test(above.name) ? '' : '.');
    if (note) h += '<p class="forge-league__note">' + note + '</p>';
    return h + '</section>';
  }

  // Render into an element once the data arrives; leaves it empty otherwise.
  function mount(el, ctx) {
    if (!el) return Promise.resolve(null);
    return fetchLeague(ctx).then(function (data) {
      el.innerHTML = html(data);
      return data;
    });
  }

  // XP for one response row. Same rules as calcXP on the dashboard and the
  // league SQL; dev/test-league.js keeps the three in step.
  function xpFor(r) {
    var id = String(r && r.question_id || '');
    if (/-ANVIL$/.test(id)) return r.is_correct ? 30 : 0;
    if (/-CRU$/.test(id) && r.is_correct) return 30;
    if (r.reforge_attempted && r.reforge_correct) return 20;
    if (r.is_correct && !r.reforge_attempted) return r.hint_used ? 5 : 10;
    return 0;
  }

  // Monday 00:00 local time. Teachers use this in the UK, where it matches the
  // Europe/London week the server uses.
  function weekStart(now) {
    var d = now ? new Date(now) : new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  // Teacher's view of the same league: full names (the teacher knows who
  // they are), every student with XP this week, and whether students can see it.
  function teacherHtml(students, responses, enabled, now) {
    var start = weekStart(now).getTime();
    var byId = {};
    (students || []).forEach(function (s) { byId[s.id] = { name: s.display_name || s.name || 'Student', xp: 0 }; });
    (responses || []).forEach(function (r) {
      if (!byId[r.student_id] || !r.created_at || Date.parse(r.created_at) < start) return;
      byId[r.student_id].xp += xpFor(r);
    });
    var ranked = Object.keys(byId).map(function (id) { return byId[id]; })
      .filter(function (s) { return s.xp > 0; })
      .sort(function (a, b) { return b.xp - a.xp || a.name.localeCompare(b.name); });
    var total = (students || []).length;
    var h = '<section class="forge-league forge-league--teacher" aria-labelledby="teacher-league-title">';
    h += '<div class="forge-league__head"><h2 id="teacher-league-title">This week’s league</h2><span class="forge-league__status' + (enabled ? ' is-on' : '') + '">' + (enabled ? 'Visible to students' : 'Hidden from students') + '</span></div>';
    if (!ranked.length) {
      h += emptyHtml('No XP yet this week', 'Students appear here as they practise. The league resets every Monday.');
    } else {
      h += '<ol class="forge-league__rows">';
      var prevXp = null, pos = 0;
      ranked.slice(0, 10).forEach(function (s, i) {
        if (s.xp !== prevXp) pos = i + 1;
        prevXp = s.xp;
        h += '<li class="forge-league__row"><span class="forge-league__pos">' + pos + '</span><span class="forge-league__name">' + esc(s.name) + '</span><span class="forge-league__xp">' + s.xp.toLocaleString() + ' XP</span></li>';
      });
      h += '</ol>';
      h += '<p class="forge-league__note">' + ranked.length + ' of ' + total + ' students have earned XP this week' + (ranked.length > 10 ? '; showing the top 10' : '') + '. Students see first name and initial only' + (enabled ? '' : ' — switch the league on in Class tools') + '.</p>';
    }
    return h + '</section>';
  }

  root.ForgeLeague = { fetch: fetchLeague, html: html, mount: mount, xpFor: xpFor, weekStart: weekStart, teacherHtml: teacherHtml, studentRpc: studentRpc, esc: esc };
}(typeof window !== 'undefined' ? window : globalThis));
