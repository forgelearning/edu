// Google Analytics consent mode for public Forge pages.
// Analytics storage is denied until the visitor actively accepts it.
(function () {
  var STORAGE_KEY = 'forge-analytics-consent';
  var measurementId = 'G-RGZ9J6Q8H9';
  var consent = null;

  try { consent = window.localStorage.getItem(STORAGE_KEY); } catch (e) {}

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: consent === 'granted' ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  // The banner is position:fixed, so the page has to reserve its height or the
  // banner covers whatever sits at the bottom of the document. Its height moves
  // with viewport width, text wrapping and the audit-test override, so measure
  // the real box rather than hardcoding a value per breakpoint.
  var spaceObserver = null;

  function syncBannerSpace() {
    var banner = document.getElementById('analytics-consent-banner');
    if (!banner || !document.body) return;
    var rect = banner.getBoundingClientRect();
    var gap = window.innerHeight - rect.bottom;
    if (gap < 0) gap = 0;
    document.body.style.setProperty('--consent-banner-space', Math.ceil(rect.height + gap) + 'px');
  }

  function stopSpaceSync() {
    if (spaceObserver) { spaceObserver.disconnect(); spaceObserver = null; }
    window.removeEventListener('resize', syncBannerSpace);
    if (document.body) document.body.style.removeProperty('--consent-banner-space');
  }

  function startSpaceSync(banner) {
    syncBannerSpace();
    window.addEventListener('resize', syncBannerSpace);
    if (window.ResizeObserver) {
      spaceObserver = new window.ResizeObserver(syncBannerSpace);
      spaceObserver.observe(banner);
    }
  }

  function hideBanner() {
    var banner = document.getElementById('analytics-consent-banner');
    if (banner) banner.remove();
    stopSpaceSync();
    if (document.body) document.body.classList.remove('has-consent-banner');
  }

  function saveChoice(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    window.gtag('consent', 'update', {
      analytics_storage: value === 'granted' ? 'granted' : 'denied'
    });
    hideBanner();
  }

  function showBanner(force) {
    if (!force && consent) return;
    hideBanner();
    var banner = document.createElement('aside');
    banner.id = 'analytics-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'analytics-consent-title');
    banner.innerHTML =
      '<div class="analytics-consent-copy">' +
        '<strong id="analytics-consent-title">Optional analytics</strong>' +
        '<p>Forge uses Google Analytics on public pages to understand aggregate site usage. It is not used to analyse student quiz responses.</p>' +
      '</div>' +
      '<div class="analytics-consent-actions">' +
        '<button type="button" class="analytics-consent-reject">Reject</button>' +
        '<button type="button" class="analytics-consent-accept">Accept analytics</button>' +
      '</div>';
    banner.querySelector('.analytics-consent-reject').addEventListener('click', function () { saveChoice('denied'); });
    banner.querySelector('.analytics-consent-accept').addEventListener('click', function () { saveChoice('granted'); });
    document.body.appendChild(banner);
    document.body.classList.add('has-consent-banner');
    startSpaceSync(banner);
  }

  window.forgeManageAnalytics = function () { showBanner(true); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { showBanner(false); });
  } else {
    showBanner(false);
  }
})();
