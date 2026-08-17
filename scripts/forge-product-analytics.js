(function () {
  var EVENTS_KEY = 'forge-product-events';
  var QUEUE_KEY = 'forge-product-event-queue';
  var ID_KEY = 'forge-product-anonymous-id';
  var SESSION_KEY = 'forge-product-session-id';
  var STATUS_KEY = 'forge-product-analytics-status';

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (e) { return fallback; }
  }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function id(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12); }
  function stableId(key, prefix) {
    var value = null;
    try { value = localStorage.getItem(key); } catch (e) {}
    if (!value) { value = id(prefix); try { localStorage.setItem(key, value); } catch (e) {} }
    return value;
  }
  function safeDetails(details) {
    var out = {}, source = details && typeof details === 'object' ? details : {};
    Object.keys(source).slice(0, 20).forEach(function (key) {
      if (/(question|answer|response|email|name|token|password|text|content)/i.test(key)) return;
      var value = source[key];
      if (typeof value === 'string') out[key.slice(0, 60)] = value.slice(0, 200);
      else if (typeof value === 'number' || typeof value === 'boolean') out[key.slice(0, 60)] = value;
    });
    return out;
  }
  function status() { return read(STATUS_KEY, { mode: 'local-only', lastAttempt: 0, lastError: null }); }
  function setStatus(next) { write(STATUS_KEY, Object.assign(status(), next)); }
  function localEvents() { return read(EVENTS_KEY, []); }
  function queue() { return read(QUEUE_KEY, []); }
  var flushInFlight = false;

  function flush() {
    if (!window.ForgeAPI || !window.ForgeAPI.insert) return Promise.resolve(false);
    if (flushInFlight) return Promise.resolve(false);
    var current = status();
    if (current.lastAttempt && Date.now() - current.lastAttempt < 30000) return Promise.resolve(false);
    var pending = queue();
    if (!pending.length) { setStatus({ mode: 'remote-ready', lastError: null }); return Promise.resolve(true); }
    flushInFlight = true;
    setStatus({ lastAttempt: Date.now() });
    var sent = 0;
    return pending.reduce(function (promise, event) {
      return promise.then(function () {
        return window.ForgeAPI.insert('product_events', {
          client_event_id: event.id,
          event_name: event.name,
          occurred_at: event.at,
          anonymous_id: event.anonymousId,
          session_id: event.sessionId,
          details: event.details
        // Do NOT add resolution=ignore-duplicates here. PostgREST turns it into
        // ON CONFLICT, which needs SELECT on the table; anon/authenticated hold
        // INSERT only, so every event 401'd and product_events stayed empty.
        // client_event_id is the primary key, so a genuine replay fails with
        // 409 and is treated as already-delivered below.
        }, { headers: { 'Prefer': 'return=minimal' } }).then(function () { sent++; })
          .catch(function (error) {
            if (error && error.status === 409) { sent++; return; }
            throw error;
          });
      });
    }, Promise.resolve()).then(function () {
      var sentIds = {};
      pending.slice(0, sent).forEach(function (event) { sentIds[event.id] = true; });
      var left = queue().filter(function (event) { return !sentIds[event.id]; });
      write(QUEUE_KEY, left);
      setStatus({ mode: 'remote', lastError: null });
      return true;
    }).catch(function (error) {
      setStatus({ mode: 'local-fallback', lastError: error && error.message ? error.message : 'Remote analytics unavailable' });
      return false;
    }).then(function (result) {
      flushInFlight = false;
      return result;
    });
  }

  window.forgeAnalytics = {
    status: status,
    localEvents: localEvents,
    flush: flush,
    clearLocal: function () { try { localStorage.removeItem(EVENTS_KEY); localStorage.removeItem(QUEUE_KEY); } catch (e) {} }
  };

  window.forgeTrack = function (name, details) {
    var event = {
      id: id('evt'), name: String(name || 'unknown').slice(0, 100), at: new Date().toISOString(),
      anonymousId: stableId(ID_KEY, 'anon'), sessionId: stableId(SESSION_KEY, 'session'), details: safeDetails(details)
    };
    var events = localEvents(); events.push(event); if (events.length > 100) events = events.slice(-100); write(EVENTS_KEY, events);
    var pending = queue(); pending.push(event); if (pending.length > 100) pending = pending.slice(-100); write(QUEUE_KEY, pending);
    if (typeof window.gtag === 'function') window.gtag('event', event.name, event.details);
    flush();
  };

  flush();
}());
