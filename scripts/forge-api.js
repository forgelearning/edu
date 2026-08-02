/* Forge data boundary. Pages keep their existing view logic, but all shared
   Supabase configuration, request policy, timeouts, and error normalisation
   live here so a global change is made once. */
(function (root) {
  var config = {
    url: 'https://crysulmbaadjkymcjrew.supabase.co'
  };

  /* Preserve the existing project key exactly while keeping the public
     client configuration in one place. */
  config.key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyeXN1bG1iYWFkamt5bWNqcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNDUzMzAsImV4cCI6MjA5OTgyMTMzMH0.Q69MKJR6_iEYkqJYXjn8RBhKhstAZShtmf0NiYM-8Vk';

  function headers(token, extra) {
    var auth = token || config.key;
    return Object.assign({ 'apikey': config.key, 'Authorization': 'Bearer ' + auth }, extra || {});
  }

  function message(body, status) {
    if (body && typeof body === 'object') return body.message || body.error_description || body.error || body.hint || ('Request failed (' + status + ')');
    return body || ('Request failed (' + status + ')');
  }

  function request(path, options) {
    options = options || {};
    var timeout = options.timeout || 10000;
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, timeout) : null;
    var requestOptions = Object.assign({}, options, { headers: headers(options.token, options.headers) });
    delete requestOptions.timeout;
    delete requestOptions.token;
    var target = /^https?:\/\//.test(path) ? path : config.url + path;
    return fetch(target, Object.assign(requestOptions, controller ? { signal: controller.signal } : {}))
      .then(function (response) {
        return response.text().then(function (text) {
          var body = null;
          try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }
          if (!response.ok) {
            var error = new Error(message(body, response.status));
            error.status = response.status;
            error.body = body;
            throw error;
          }
          return body;
        });
      })
      .catch(function (error) {
        if (error && error.name === 'AbortError') {
          var timeoutError = new Error('The request timed out.');
          timeoutError.code = 'TIMEOUT';
          throw timeoutError;
        }
        throw error;
      })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  function table(name, query) {
    return '/rest/v1/' + name + '?select=*' + (query ? '&' + query : '');
  }

  root.ForgeAPI = {
    config: config,
    headers: headers,
    request: request,
    response: function (path, options) {
      return request(path, options).then(function (body) {
        return { ok: true, status: 200, json: function () { return Promise.resolve(body); }, text: function () { return Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)); } };
      });
    },
    get: function (name, query, options) { return request(table(name, query), Object.assign({ method: 'GET' }, options || {})); },
    rpc: function (name, payload, options) { return request('/rest/v1/rpc/' + name, Object.assign({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload || {}) }, options || {})); },
    insert: function (name, row, options) { return request('/rest/v1/' + name, Object.assign({ method: 'POST', headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' }, body: JSON.stringify(row) }, options || {})); },
    patch: function (name, id, row, options) { return request('/rest/v1/' + name + '?id=eq.' + encodeURIComponent(id), Object.assign({ method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' }, body: JSON.stringify(row) }, options || {})); },
    remove: function (name, id, options) { return request('/rest/v1/' + name + '?id=eq.' + encodeURIComponent(id), Object.assign({ method: 'DELETE' }, options || {})); }
  };

  root.ForgeAPI.auth = {
    signUp: function (email, password) { return request('/auth/v1/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: password }) }); },
    signIn: function (email, password) { return request('/auth/v1/token?grant_type=password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: password }) }); },
    refresh: function (refreshToken) { return request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }) }); },
    user: function (token) { return request('/auth/v1/user', { method: 'GET', token: token }); },
    updatePassword: function (password, token) { return request('/auth/v1/user', { method: 'PUT', token: token, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: password }) }); },
    signOut: function (token) { return request('/auth/v1/logout', { method: 'POST', token: token }); },
    recover: function (email) { return request('/auth/v1/recover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email }) }); }
  };

  root.SUPABASE_URL = config.url;
  root.SUPABASE_KEY = config.key;
}(window));
