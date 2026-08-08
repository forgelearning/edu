/* Forge app shell. Network-first keeps Supabase and live content authoritative;
   the cache is only a resilience layer for the static shell. */
var FORGE_CACHE = 'forge-shell-v4';
var FORGE_SHELL = [
  './', './index.html', './role-select.html', './student-dashboard.html', './teacher.html', './settings.html', './teacher-settings.html',
  './forge-signup.html', './forge-quiz.html', './assignments.html',
  './anvil.html', './crucible.html', './profile.html', './present.html',
  './school-overview.html', './manifest.json', './assets/forge-icon.png',
  './css/base.css', './css/tokens.css', './css/sidebar.css', './css/states.css', './css/role-select.css',
  './scripts/forge-pwa.js', './scripts/forge-role.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(FORGE_CACHE).then(function (cache) {
    return cache.addAll(FORGE_SHELL);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== FORGE_CACHE; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(function (response) {
    if (response.ok && event.request.destination !== 'document') {
      var copy = response.clone();
      caches.open(FORGE_CACHE).then(function (cache) { cache.put(event.request, copy); });
    }
    return response;
  }).catch(function () {
    return caches.match(event.request).then(function (cached) {
      return cached || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error());
    });
  }));
});
