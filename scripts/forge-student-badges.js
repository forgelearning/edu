/* Student assignment badge + notification controller.
 *
 * The badge is deliberately based on unopened assignment IDs, not unfinished
 * question counts. Notification state is local to the signed-in student and
 * class, so changing accounts cannot leak a previous student's alerts.
 * Native Capacitor builds use LocalNotifications when the plugin is present;
 * browser/PWA builds fall back to the Web Notification API and an in-app toast.
 */
(function (root) {
  'use strict';
  if (!root.ForgeSidebar) return;

  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('forge-student') || 'null'); } catch (e) {}
  var hasStudentClass = !!(saved && saved.classId);
  if (!hasStudentClass) {
    root.ForgeSidebar.setBadge('assignments', null);
    root.ForgeSidebar.setBadge('anvil', null);
  }

  var studentKey = String(saved && saved.studentId || 'anon') + ':' + String(saved && saved.classId || 'none');
  var seenKey = 'forge-assignment-seen:' + studentKey;
  var noticeKey = 'forge-notification-state:' + studentKey;
  var seen = readArray(seenKey);
  var state = readObject(noticeKey);
  var nativeNotifications = root.Capacitor && root.Capacitor.Plugins && root.Capacitor.Plugins.LocalNotifications;
  function ensureNativeNotifications() {
    if (nativeNotifications) return Promise.resolve(nativeNotifications);
    var isNative = root.Capacitor && (typeof root.Capacitor.isNativePlatform !== 'function' || root.Capacitor.isNativePlatform());
    if (!isNative) return Promise.resolve(null);
    if (root.__forgeNotificationPluginPromise) return root.__forgeNotificationPluginPromise;
    root.__forgeNotificationPluginPromise = new Promise(function (resolve) {
      var script = document.createElement('script');
      script.src = 'scripts/forge-capacitor-local-notifications.js';
      script.onload = function () {
        nativeNotifications = root.Capacitor && root.Capacitor.Plugins && root.Capacitor.Plugins.LocalNotifications;
        resolve(nativeNotifications || null);
      };
      script.onerror = function () { resolve(null); };
      document.head.appendChild(script);
    });
    return root.__forgeNotificationPluginPromise;
  }

  function readArray(key) {
    try { var value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch (e) { return []; }
  }
  function readObject(key) {
    try { var value = JSON.parse(localStorage.getItem(key) || '{}'); return value && typeof value === 'object' ? value : {}; } catch (e) { return {}; }
  }
  function persist() {
    try { localStorage.setItem(seenKey, JSON.stringify(seen.slice(-200))); } catch (e) {}
    try { localStorage.setItem(noticeKey, JSON.stringify(state)); } catch (e) {}
  }
  function idFor(assignment) { return String(assignment.id || assignment.created_at || assignment.title || 'assignment'); }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function formatDate(value) {
    if (!value) return 'No due date';
    var date = new Date(value);
    return isNaN(date.getTime()) ? 'No due date' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  function toast(title, body, action) {
    var current = document.getElementById('forge-notification-toast');
    if (current) current.remove();
    var el = document.createElement('aside');
    el.id = 'forge-notification-toast';
    el.setAttribute('role', 'status');
    el.innerHTML = '<strong>' + esc(title) + '</strong><span>' + esc(body) + '</span>' + (action || '');
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.classList.add('is-leaving'); setTimeout(function () { if (el.parentNode) el.remove(); }, 240); }, 6500);
  }
  function nativePermission() {
    return ensureNativeNotifications().then(function (plugin) {
      if (!plugin) return false;
      return plugin.requestPermissions().then(function (result) { return result && result.display === 'granted'; }).catch(function () { return false; });
    });
  }
  function webPermission() {
    if (!root.Notification) return Promise.resolve(false);
    if (root.Notification.permission === 'granted') return Promise.resolve(true);
    if (root.Notification.permission === 'denied') return Promise.resolve(false);
    return root.Notification.requestPermission().then(function (result) { return result === 'granted'; }).catch(function () { return false; });
  }
  function enable() {
    return nativePermission().then(function (nativeOK) {
      if (nativeOK) { state.enabled = true; persist(); return true; }
      return webPermission().then(function (webOK) { state.enabled = webOK; persist(); return webOK; });
    });
  }
  function send(title, body, key, options) {
    options = options || {};
    if (key && state[key]) return;
    if (key) state[key] = new Date().toISOString();
    persist();
    toast(title, body, state.enabled ? '' : '<button type="button" data-forge-enable-notifications>Enable notifications</button>');
    if (!state.enabled) return;
    var notificationPayload = { notifications: [{ id: Math.floor(Date.now() % 2147480000), title: title, body: body, schedule: options.at ? { at: new Date(options.at) } : undefined, extra: { forge: true, kind: options.kind || 'student', href: options.href || 'assignments.html' } }] };
    // The plugin is loaded asynchronously in the static Capacitor shell. Do
    // not lose the first notification simply because assignment data arrived
    // before that bridge finished registering.
    ensureNativeNotifications().then(function (plugin) {
      if (plugin) {
        plugin.schedule(notificationPayload).catch(function () {});
      } else if (root.Notification && root.Notification.permission === 'granted') {
        try {
          var browserNotification = new root.Notification(title, { body: body, tag: key || title });
          browserNotification.addEventListener('click', function () { root.focus(); root.location.href = options.href || 'assignments.html'; });
        } catch (e) {}
      }
    });
  }
  function attachEnable() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest && event.target.closest('[data-forge-enable-notifications]');
      if (!button) return;
      enable().then(function (ok) {
        if (ok) toast('Notifications enabled', 'Forge will alert you about new work and upcoming deadlines.');
        else toast('Notifications remain off', 'You can enable them later in your device settings.');
      });
    });
  }
  function setAssignmentBadge(rows) {
    var unseen = (rows || []).filter(function (assignment) { return seen.indexOf(idFor(assignment)) < 0; }).length;
    root.ForgeSidebar.setBadge('assignments', unseen || null);
    // Installed web apps can expose the system app-icon badge directly.
    // Capacitor native builds show the same count in the Assigned tab and in
    // the delivered local notification; a native app-icon bridge can be added
    // later without changing this state model.
    if (navigator && typeof navigator.setAppBadge === 'function') {
      (unseen ? navigator.setAppBadge(unseen) : navigator.clearAppBadge()).catch(function () {});
    }
    return unseen;
  }
  function markAssignmentsSeen(rows) {
    (rows || []).forEach(function (assignment) {
      var id = idFor(assignment);
      if (seen.indexOf(id) < 0) seen.push(id);
    });
    persist();
    root.ForgeSidebar.setBadge('assignments', null);
    if (navigator && typeof navigator.clearAppBadge === 'function') navigator.clearAppBadge().catch(function () {});
  }
  function refreshAssignments() {
    if (!root.ForgeAPI || !root.ForgeAPI.get) return Promise.resolve([]);
    return root.ForgeAPI.get('assignments', 'class_id=eq.' + encodeURIComponent(saved.classId) + '&order=due_date.asc').then(function (rows) {
      rows = Array.isArray(rows) ? rows : [];
      setAssignmentBadge(rows);
      rows.forEach(function (assignment) {
        var id = idFor(assignment);
        if (seen.indexOf(id) < 0 && !state['new:' + id]) {
          send('New assignment', String(assignment.title || 'Your teacher set new work') + ' · Due ' + formatDate(assignment.due_date), 'new:' + id, { kind: 'new-assignment' });
        }
        if (assignment.due_date) {
          var due = new Date(assignment.due_date).getTime();
          var now = Date.now();
          var dueKey = 'due:' + id;
          var twentyFourHours = 24 * 60 * 60 * 1000;
          if (due > now && due - now <= twentyFourHours && !state[dueKey]) {
            send('Assignment due soon', String(assignment.title || 'Assigned work') + ' is due ' + formatDate(assignment.due_date) + '.', dueKey, { kind: 'due-soon', at: due - twentyFourHours });
          }
        }
      });
      persist();
      return rows;
    }).catch(function () { return []; });
  }
  function refreshAnvil() {
    var count = parseInt(localStorage.getItem('forge-anvil-open') || '', 10);
    if (isNaN(count)) return;
    root.ForgeSidebar.setBadge('anvil', count || null);
    if (count < 10) return;
    var today = new Date().toISOString().slice(0, 10);
    if (state.anvilReminder === today) return;
    send('Anvil tasks waiting', 'You have ' + count + ' open Anvil tasks. Clear a few to keep your progress moving.', 'anvilReminder', { kind: 'anvil-reminder' });
    state.anvilReminder = today;
    persist();
  }

  root.ForgeStudentNotifications = {
    refresh: refreshAssignments,
    markAssignmentsSeen: markAssignmentsSeen,
    enable: enable,
    permission: function () {
      return ensureNativeNotifications().then(function (plugin) {
        if (plugin && plugin.checkPermissions) return plugin.checkPermissions();
        return { display: root.Notification ? root.Notification.permission : 'unsupported' };
      });
    },
    refreshAnvil: refreshAnvil
  };
  function attachNativeNotificationListener(plugin) {
    if (!plugin || typeof plugin.addListener !== 'function' || root.__forgeNotificationListenerAttached) return;
    root.__forgeNotificationListenerAttached = true;
    plugin.addListener('localNotificationActionPerformed', function (event) {
      var href = event && event.notification && event.notification.extra && event.notification.extra.href;
      if (href) root.location.href = href;
    });
  }
  attachNativeNotificationListener(nativeNotifications);
  document.addEventListener('forge:assignments-rendered', function (event) {
    markAssignmentsSeen(event.detail && event.detail.rows || []);
  });
  attachEnable();
  ensureNativeNotifications().then(attachNativeNotificationListener);
  if (hasStudentClass) refreshAssignments();
  refreshAnvil();
}(window));
