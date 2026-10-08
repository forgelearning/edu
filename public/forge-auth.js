// ============================================================
// forge-auth.js — Shared Supabase Auth helper for Forge
// Include BEFORE page-specific scripts on every student page
// ============================================================

var SUPABASE_URL = ForgeAPI.config.url;
var SUPABASE_KEY = ForgeAPI.config.key;

var TRIAL_DAYS = 7;

function _authHeaders(token) {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + (token || SUPABASE_KEY),
    'Content-Type': 'application/json'
  };
}

var FORGE_SESSION_KEY = 'forge-auth-session';
var FORGE_REFRESH_ATTEMPT_KEY = 'forge-auth-refresh-at';
var FORGE_FREE_CLAIM_KEY = 'forge-free-claim-pending';

function _saveAuthSession(session) {
  try { localStorage.setItem(FORGE_SESSION_KEY, JSON.stringify(session)); } catch(e) {}
}
function _loadAuthSession() {
  try { return JSON.parse(localStorage.getItem(FORGE_SESSION_KEY) || 'null'); } catch(e) { return null; }
}
function _clearAuthSession() {
  try {
    localStorage.removeItem(FORGE_SESSION_KEY);
    localStorage.removeItem(FORGE_REFRESH_ATTEMPT_KEY);
  } catch(e) {}
}

// Student identity is also reflected in local caches used by the dashboard
// and sidebar. Clear those caches whenever an identity changes so a fresh
// account cannot inherit another student's class, assignment, or Anvil state.
function _clearDerivedStudentState() {
  var exact = [
    'forge-student',
    'forge-free-session',
    'forge-paid-student',
    'forge-anvil-open',
    'forge-assigned-open-current'
  ];
  try {
    exact.forEach(function (key) { localStorage.removeItem(key); });
    var remove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && (/^forge-assigned-open:/.test(key) || /^forge-assignment-seen:/.test(key) || /^forge-notification-state:/.test(key))) remove.push(key);
    }
    remove.forEach(function (key) { localStorage.removeItem(key); });
  } catch (e) {}
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

  // Where a student lands after signing in, however they got there
  // (password login, signup completion, confirmation link, password reset).
  LANDING_PAGE: 'student-dashboard.html',

  goToLanding: function() {
    window.location.href = ForgeAuth.LANDING_PAGE;
  },

  // Supabase confirmation / magic links come back with the tokens in the URL
  // hash. Adopt that session and send the student to the landing page, so an
  // email link signs them in the same way the password form does.
  // Recovery links are left alone — reset-password.html handles those.
  adoptHashSession: function() {
    var hash = window.location.hash.slice(1);
    if (!hash || hash.indexOf('access_token=') === -1) return false;

    var params = {};
    hash.split('&').forEach(function(pair) {
      var kv = pair.split('=');
      if (kv.length === 2) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
    });
    if (!params.access_token || params.type === 'recovery') return false;

    _clearDerivedStudentState();
    _saveAuthSession({ access_token: params.access_token, refresh_token: params.refresh_token, user: null });
    return ForgeAPI.auth.user(params.access_token)
    .then(function(user) {
      if (!user || !user.id) throw new Error('Email link did not return an account.');
      _saveAuthSession({ access_token: params.access_token, refresh_token: params.refresh_token, user: user });
      return ForgeAuth.claimPendingFreeStudent().catch(function() { return null; }).then(function() {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        // Already on the landing page (e.g. index.html forwarded the hash here)?
        // The session is stored and the URL is clean — nothing left to do.
        var path = window.location.pathname;
        if (path.slice(-ForgeAuth.LANDING_PAGE.length) !== ForgeAuth.LANDING_PAGE) {
          ForgeAuth.goToLanding();
        } else {
          window.location.reload();
        }
        return true;
      });
    })
    .catch(function() {
      _clearAuthSession();
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      return false;
    });
  },

  // Sign up — creates Supabase auth user + subscriber record (trial, not yet paying)
  signUp: function(email, password, name, subjects) {
    return ForgeAPI.auth.signUp(email, password)
    .then(function(data) {
      if (data.error || !data.access_token) {
        return Promise.reject(new Error(data.error_description || data.msg || data.error || 'Sign-up failed'));
      }
      _clearDerivedStudentState();
      _saveAuthSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
      if (window.ForgeRole) ForgeRole.set('student');

      // Insert subscriber record — trial mode, not yet paying
      return ForgeAPI.insert('subscribers', {
          user_id: data.user.id,
          name: name,
          subjects: subjects,
          active: false,
          trial: true,
          trial_started_at: new Date().toISOString()
        }, { token: data.access_token })
      .then(function() {
        return { user: data.user, name: name, subjects: subjects };
      });
    });
  },

  // Sign in with email + password
  signIn: function(email, password) {
    return ForgeAPI.auth.signIn(email, password)
    .then(function(data) {
      if (data.error || !data.access_token) {
        return Promise.reject(new Error(data.error_description || data.msg || data.error || 'Incorrect email or password'));
      }
      _clearDerivedStudentState();
      _saveAuthSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
      if (window.ForgeRole) ForgeRole.set('student');
      return ForgeAuth.claimPendingFreeStudent().catch(function() { return null; }).then(function() { return data; });
    });
  },

  // The email template may send either a magic link or a six-digit OTP.
  // The page accepts a code when the template includes one.
  sendEmailLink: function(email, saveCurrentFreeWork) {
    try { localStorage.removeItem(FORGE_FREE_CLAIM_KEY); } catch(e) {}
    if (saveCurrentFreeWork) {
      try {
        var free = JSON.parse(localStorage.getItem('forge-free-session') || 'null');
        if (free && free.studentId && free.freeToken) localStorage.setItem(FORGE_FREE_CLAIM_KEY, JSON.stringify({
          studentId: free.studentId, freeToken: free.freeToken, email: email.toLowerCase()
        }));
      } catch(e) {}
    }
    return ForgeAPI.auth.sendEmailLink(email, new URL('student-dashboard.html', window.location.href).href);
  },
  verifyEmailCode: function(email, code) {
    return ForgeAPI.auth.verifyEmailCode(email, code).then(function(data) {
      if (!data || !data.access_token) throw new Error('The code was not recognised. Please request a new one.');
      _clearDerivedStudentState();
      _saveAuthSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
      if (window.ForgeRole) ForgeRole.set('student');
      return ForgeAuth.claimPendingFreeStudent().catch(function() { return null; }).then(function() { return data; });
    });
  },
  claimPendingFreeStudent: function() {
    var token = ForgeAuth.accessToken();
    if (!token) return Promise.resolve();
    var pending = null;
    try { pending = JSON.parse(localStorage.getItem(FORGE_FREE_CLAIM_KEY) || 'null'); } catch(e) {}
    if (!pending) return Promise.resolve();
    var identity = ForgeAuth.currentUser() && ForgeAuth.currentUser().email
      ? Promise.resolve(ForgeAuth.currentUser()) : ForgeAPI.auth.user(token);
    return identity.then(function(user) {
      if (user && user.id && !ForgeAuth.currentUser()) {
        var saved = _loadAuthSession();
        if (saved) { saved.user = user; _saveAuthSession(saved); }
      }
      if (!pending || !pending.studentId || !pending.freeToken ||
          String(pending.email || '').toLowerCase() !== String(user && user.email || '').toLowerCase()) {
        try { localStorage.removeItem(FORGE_FREE_CLAIM_KEY); } catch(e) {}
        return;
      }
      return ForgeAPI.rpc('claim_free_student', {
          p_student_id: pending.studentId, p_free_token: pending.freeToken
        }, { token: token }).then(function(result) {
          if (!result || result.linked !== true) throw new Error('This device’s guest progress could not be linked.');
          localStorage.removeItem(FORGE_FREE_CLAIM_KEY);
        });
    });
  },
  restoreFreeStudent: function() {
    var token = ForgeAuth.accessToken();
    if (!token) return Promise.resolve(null);
    return ForgeAuth.claimPendingFreeStudent().then(function() {
      return ForgeAPI.rpc('get_my_free_student', {}, { token: token });
    }).then(function(rows) {
      var row = Array.isArray(rows) && rows[0];
      if (!row || !row.student_id || !row.free_token) throw new Error('Your saved progress is unavailable right now.');
      var session = { name: row.student_name || 'Student', studentId: row.student_id, freeToken: row.free_token };
      localStorage.setItem('forge-free-session', JSON.stringify(session));
      if (window.ForgeStudyMode) ForgeStudyMode.set('independent');
      return session;
    });
  },

  // Refresh an expired access token
  refreshSession: function(refreshToken) {
    return ForgeAPI.auth.refresh(refreshToken)
    .then(function(data) {
      if (data.error || !data.access_token) {
        _clearAuthSession();
        return Promise.reject(new Error('Session expired'));
      }
      _saveAuthSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
      return data;
    });
  },

  // Native WebViews can remain suspended long enough for the short-lived
  // access token to expire. Refresh on app resume, but throttle the attempt so
  // repeated foreground/background transitions do not create auth traffic.
  refreshIfNeeded: function() {
    var saved = _loadAuthSession();
    if (!saved || !saved.refresh_token) return Promise.resolve(saved);
    var lastAttempt = 0;
    try { lastAttempt = Number(localStorage.getItem(FORGE_REFRESH_ATTEMPT_KEY) || 0); } catch(e) {}
    if (lastAttempt && Date.now() - lastAttempt < 60000) return Promise.resolve(saved);
    try { localStorage.setItem(FORGE_REFRESH_ATTEMPT_KEY, String(Date.now())); } catch(e) {}
    return ForgeAuth.refreshSession(saved.refresh_token).catch(function() { return null; });
  },

  // Check session, refresh if needed, return { session, subscriber, access, daysLeft } or null
  getSession: function() {
    var saved = _loadAuthSession();
    if (!saved || !saved.access_token) return Promise.resolve(null);

    return ForgeAPI.get('subscribers', null, { token: saved.access_token })
    .catch(function(error) {
      if (error && error.status === 401 && saved.refresh_token) {
        return ForgeAuth.refreshSession(saved.refresh_token).then(function() {
          var newSaved = _loadAuthSession();
          return ForgeAPI.get('subscribers', null, { token: newSaved.access_token });
        });
      }
      throw error;
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
      ForgeAPI.auth.signOut(saved.access_token).catch(function() {});
    }
    _clearAuthSession();
    try { localStorage.removeItem(FORGE_FREE_CLAIM_KEY); } catch(e) {}
    _clearDerivedStudentState();
    if (window.ForgeRole) ForgeRole.clear('student');
    // Derived navigation state must never survive into the next student's
    // session. The Anvil count is only a local display cache.
    try { localStorage.removeItem('forge-anvil-open'); } catch(e) {}
    if (window.ForgeSidebar) {
      ForgeSidebar.setBadge('anvil', null);
      ForgeSidebar.setBadge('assignments', null);
    }
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
