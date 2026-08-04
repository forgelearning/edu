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

  function hideBanner() {
    var banner = document.getElementById('analytics-consent-banner');
    if (banner) banner.remove();
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
        '<p>Forge uses Google Analytics for aggregate public-site usage only. It does not analyse student quiz responses.</p>' +
      '</div>' +
      '<div class="analytics-consent-actions">' +
        '<button type="button" class="analytics-consent-reject">Reject</button>' +
        '<button type="button" class="analytics-consent-accept">Accept analytics</button>' +
      '</div>';
    banner.querySelector('.analytics-consent-reject').addEventListener('click', function () { saveChoice('denied'); });
    banner.querySelector('.analytics-consent-accept').addEventListener('click', function () { saveChoice('granted'); });
    // Keep consent visible without covering the primary action or live demo.
    // On the homepage, use the intentional space beneath the hero reassurance
    // line; other pages place it before their main content.
    var heroSub = document.querySelector('.hero .sub');
    var insertionPoint = heroSub || document.querySelector('main');
    if (heroSub && heroSub.parentNode) {
      heroSub.parentNode.insertBefore(banner, heroSub.nextSibling);
    } else if (insertionPoint && insertionPoint.parentNode) {
      insertionPoint.parentNode.insertBefore(banner, insertionPoint);
    } else {
      document.body.appendChild(banner);
    }
    document.body.classList.add('has-consent-banner');
  }

  window.forgeManageAnalytics = function () { showBanner(true); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { showBanner(false); });
  } else {
    showBanner(false);
  }
})();
