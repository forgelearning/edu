// ============================================================
// forge-auth.js — Shared Supabase Auth helper for Forge
// Include BEFORE page-specific scripts on every student page
// ============================================================

var SUPABASE_URL = 'https://crysulmbaadjkymcjrew.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyeXN1bG1iYWFkamt5bWNqcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNDUzMzAsImV4cCI6MjA5OTgyMTMzMH0.Q69MKJR6_iEYkqJYXjn8RBhKhstAZShtmf0NiYM-8Vk';

var TRIAL_DAYS = 7;

function _authHeaders(token) {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + (token || SUPABASE_KEY),
    'Content-Type': 'application/json'
  };
}

var FORGE_SESSION_KEY = 'forge-auth-session';

function _saveAuthSession(session) {
  try { localStorage.setItem(FORGE_SESSION_KEY, JSON.stringify(session)); } catch(e) {}
}
function _loadAuthSession() {
  try { return JSON.parse(localStorage.getItem(FORGE_SESSION_KEY) || 'null'); } catch(e) { return null; }
}
function _clearAuthSession() {
  try { localStorage.removeItem(FORGE_SESSION_KEY); } catch(e) {}
}

// ── TRIAL HELPERS ────────────────────────────────────────────

// Given a subscriber record, return their access level:
// 'pro'      — paying subscriber (active = true)
// 'trial'    — within 7-day trial window
// 'expired'  — trial ended, not paying
// 'none'     — no subscriber record

function ForgeAccess(sub) {
  if (!sub) return 'none';
  if (sub.active) return 'pro';
  if (sub.trial && sub.trial_started_at) {
    var start = new Date(sub.trial_started_at);
    var now   = new Date();
    var daysSince = (now - start) / (1000 * 60 * 60 * 24);
    if (daysSince < TRIAL_DAYS) return 'trial';
    return 'expired';
  }
  return 'expired';
}

// Days remaining in trial (0 if expired)
function ForgeTrialDaysLeft(sub) {
  if (!sub || !sub.trial_started_at) return 0;
  var start = new Date(sub.trial_started_at);
  var now   = new Date();
  var daysSince = (now - start) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - daysSince));
}

// ── SUPABASE AUTH API CALLS ──────────────────────────────────

var ForgeAuth = {

  // Sign up — creates Supabase auth user + subscriber record (trial, not yet paying)
  signUp: function(email, password, name, subjects) {
    return fetch(SUPABASE_URL + '/auth/v1/signup', {
      method: 'POST',
      headers: _authHeaders(),
      body: JSON.stringify({ email: email, password: password })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error || !data.access_token) {
        return Promise.reject(new Error(data.error_description || data.msg || data.error || 'Sign-up failed'));
      }
      _saveAuthSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });

      // Insert subscriber record — trial mode, not yet paying
      return fetch(SUPABASE_URL + '/rest/v1/subscribers', {
        method: 'POST',
        headers: Object.assign({}, _authHeaders(data.access_token), { 'Prefer': 'return=representation' }),
        body: JSON.stringify({
          user_id: data.user.id,
          name: name,
          subjects: subjects,
          active: false,
          trial: true,
          trial_started_at: new Date().toISOString()
        })
      })
      .then(function(r) { return r.json(); })
      .then(function() {
        return { user: data.user, name: name, subjects: subjects };
      });
    });
  },

  // Sign in with email + password
  signIn: function(email, password) {
    return fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: _authHeaders(),
      body: JSON.stringify({ email: email, password: password })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error || !data.access_token) {
        return Promise.reject(new Error(data.error_description || data.msg || data.error || 'Incorrect email or password'));
      }
      _saveAuthSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
      return data;
    });
  },

  // Refresh an expired access token
  refreshSession: function(refreshToken) {
    return fetch(SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: _authHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error || !data.access_token) {
        _clearAuthSession();
        return Promise.reject(new Error('Session expired'));
      }
      _saveAuthSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
      return data;
    });
  },

  // Check session, refresh if needed, return { session, subscriber, access, daysLeft } or null
  getSession: function() {
    var saved = _loadAuthSession();
    if (!saved || !saved.access_token) return Promise.resolve(null);

    return fetch(SUPABASE_URL + '/rest/v1/subscribers?select=*', {
      headers: _authHeaders(saved.access_token)
    })
    .then(function(r) {
      if (r.status === 401 && saved.refresh_token) {
        return ForgeAuth.refreshSession(saved.refresh_token).then(function() {
          var newSaved = _loadAuthSession();
          return fetch(SUPABASE_URL + '/rest/v1/subscribers?select=*', {
            headers: _authHeaders(newSaved.access_token)
          }).then(function(r2) { return r2.json(); });
        });
      }
      return r.json();
    })
    .then(function(rows) {
      var sub     = (Array.isArray(rows) && rows.length > 0) ? rows[0] : null;
      var access  = ForgeAccess(sub);
      var daysLeft = ForgeTrialDaysLeft(sub);
      var currentSaved = _loadAuthSession();
      return { session: currentSaved, subscriber: sub, access: access, daysLeft: daysLeft };
    })
    .catch(function() { return null; });
  },

  // Sign out
  signOut: function() {
    var saved = _loadAuthSession();
    if (saved && saved.access_token) {
      fetch(SUPABASE_URL + '/auth/v1/logout', {
        method: 'POST',
        headers: _authHeaders(saved.access_token)
      }).catch(function() {});
    }
    _clearAuthSession();
  },

  currentUser: function() {
    var saved = _loadAuthSession();
    return saved ? saved.user : null;
  },
  accessToken: function() {
    var saved = _loadAuthSession();
    return saved ? saved.access_token : null;
  },
  hasSession: function() {
    var saved = _loadAuthSession();
    return !!(saved && saved.access_token);
  }
};
