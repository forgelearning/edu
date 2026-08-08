/* Forge PWA shell: install affordance, connectivity state, and mobile viewport lifecycle. */
(function () {
  'use strict';

  var deferredInstallPrompt = null;
  var banner;

  // Capacitor keeps the same UI code as the PWA. Only mark a genuine native
  // Capacitor shell: Safari also exposes window.webkit, so using that alone
  // would incorrectly enable the native-only layout in the browser.
  var isNativeCapacitor = !!(window.Capacitor &&
    (typeof window.Capacitor.isNativePlatform !== 'function' || window.Capacitor.isNativePlatform()));
  if (isNativeCapacitor) document.documentElement.classList.add('forge-native');

  function syncThemeMetadata() {
    var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      if (!meta.media) meta.content = dark ? '#101214' : '#f7f5f0';
    });
  }

  function syncNativeTheme() {
    if (!isNativeCapacitor) return;
    // Respect an explicit Forge choice. Only the System option follows iOS
    // Appearance; otherwise this startup sync would immediately undo the
    // selection made in Settings on the next native page load.
    var saved = null;
    try { saved = localStorage.getItem('forge-theme'); } catch (e) {}
    var light = saved === 'light'
      ? true
      : saved === 'dark'
        ? false
        : !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (window.setForgeTheme) window.setForgeTheme(!!light, false);
    else {
      document.documentElement.toggleAttribute('data-theme', !!light);
      if (light) document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function syncAppIcon() {
    document.querySelectorAll('link[rel="apple-touch-icon"]').forEach(function (link) {
      link.href = 'assets/forge-icon.png';
    });
  }

  function ensureBanner() {
    if (banner) return banner;
    banner = document.createElement('div');
    banner.className = 'forge-connectivity-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.hidden = true;
    document.body.appendChild(banner);
    return banner;
  }

  function setConnectivity(online) {
    var el = ensureBanner();
    el.textContent = online ? 'Connection restored — Forge is up to date.' : 'You’re offline — saved pages remain available, but syncing is paused.';
    el.classList.toggle('is-online', online);
    el.hidden = online;
    document.documentElement.classList.toggle('forge-offline', !online);
  }

  function showInstallButton() {
    var button = document.querySelector('[data-forge-install]');
    if (!button && deferredInstallPrompt) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'forge-install-button';
      button.setAttribute('data-forge-install', '');
      button.textContent = 'Install Forge';
      document.body.appendChild(button);
    }
    if (!button || !deferredInstallPrompt) return;
    button.hidden = false;
    button.addEventListener('click', function () {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.finally(function () {
        deferredInstallPrompt = null;
        button.hidden = true;
      });
    }, { once: true });
  }

  function updateViewportState() {
    if (!window.visualViewport) return;
    var keyboardOpen = window.innerHeight - window.visualViewport.height > 140;
    document.documentElement.classList.toggle('forge-keyboard-open', keyboardOpen);
  }

  function refreshNativeSession() {
    if (!isNativeCapacitor || !window.ForgeAuth || typeof window.ForgeAuth.refreshIfNeeded !== 'function') return;
    window.ForgeAuth.refreshIfNeeded();
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallButton();
  });
  window.addEventListener('appinstalled', function () {
    deferredInstallPrompt = null;
    var button = document.querySelector('[data-forge-install]');
    if (button) button.hidden = true;
  });
  window.addEventListener('offline', function () { setConnectivity(false); });
  window.addEventListener('online', function () {
    setConnectivity(true);
    window.setTimeout(function () { ensureBanner().hidden = true; }, 3500);
  });
  window.addEventListener('pageshow', refreshNativeSession);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') refreshNativeSession();
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportState);
    window.visualViewport.addEventListener('scroll', updateViewportState);
  }
  if (window.matchMedia) {
    var colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    var onColorSchemeChange = function () { syncThemeMetadata(); syncNativeTheme(); };
    if (colorScheme.addEventListener) colorScheme.addEventListener('change', onColorSchemeChange);
    else if (colorScheme.addListener) colorScheme.addListener(onColorSchemeChange);
    syncThemeMetadata();
    syncNativeTheme();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!navigator.onLine) setConnectivity(false);
      updateViewportState();
      syncAppIcon();
      showInstallButton();
    });
  } else {
    if (!navigator.onLine) setConnectivity(false);
    updateViewportState();
    syncAppIcon();
    showInstallButton();
  }

  if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('service-worker.js', { scope: './' }).catch(function (error) {
        console.warn('Forge offline shell could not start.', error);
      });
    });
  }
}());
