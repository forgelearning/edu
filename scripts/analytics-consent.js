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
    // Keep this invariant in the element itself as well as in CSS so an older
    // cached stylesheet can never turn the consent UI into a viewport overlay.
    banner.style.position = 'static';
    banner.style.inset = 'auto';
    banner.style.zIndex = 'auto';
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
    // line. Other pages insert it before their top-level content shell rather
    // than before a nested <main>, which can accidentally turn the banner into
    // a grid or flex child (the FAQ layout is one such case).
    var heroSub = document.querySelector('.hero .sub');
    if (heroSub && heroSub.parentNode) {
      heroSub.parentNode.insertBefore(banner, heroSub.nextSibling);
    } else {
      var pageShell = null;
      var bodyChildren = document.body ? document.body.children : [];
      for (var i = 0; i < bodyChildren.length; i += 1) {
        var child = bodyChildren[i];
        if (child.id === 'sticky-nav' || child.tagName === 'SCRIPT' || child.id === 'analytics-consent-banner') continue;
        pageShell = child;
        break;
      }
      if (pageShell && pageShell.parentNode) {
        pageShell.parentNode.insertBefore(banner, pageShell);
      } else {
        document.body.appendChild(banner);
      }
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
