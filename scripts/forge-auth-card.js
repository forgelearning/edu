// Shared sign-in card shell. Pairs with css/auth.css and scripts/forge-logo.js
// (load forge-logo.js first — the badge reads the shield from it).
//
// Usage — wrap a screen's existing form markup:
//
//   app.innerHTML = ForgeAuthCard.shell({
//     title: 'Sign in to Forge',
//     sub:   'Enter your name and class code',
//     tag:   'Step 1 of 3',   // optional eyebrow above the title
//     foot:  'No account? <a href="forge-quiz.html">Start with a quiz</a>'
//   }, formHtml);
//
// The returned markup is a <form>, so Enter submits. Wire it up afterwards
// with ForgeAuthCard.onSubmit(fn) — it fires on both Enter and button click.
(function () {
  var SPARK_COUNT = 7;

  function sparks() {
    var out = '';
    for (var i = 0; i < SPARK_COUNT; i++) {
      out += '<span class="auth-spark" style="left:' + (8 + i * 13) + '%;bottom:' +
             (10 + (i % 3) * 18) + '%;animation-delay:' + (i * 2.1) + 's"></span>';
    }
    return out;
  }

  function badge() {
    var mark = window.ForgeLogo ? window.ForgeLogo.imgHtml(22) : '';
    return '<div class="auth-badge">' +
             '<span class="auth-shield">' + mark + '</span>' +
             '<span class="auth-wordmark">Forge</span>' +
           '</div>';
  }

  // The stage centres the card in whatever is left of the viewport, but how
  // much that is varies per page and breakpoint: the desktop rail adds nothing
  // above, the phone/tablet shell adds a top bar and a tab bar as body padding,
  // and the public pages (reset-password, school overview) sit under an in-flow
  // logo nav. Rather than guess, collapse the stage, measure everything else on
  // the page, and hand the stage exactly what is left over — so the card lands
  // dead centre instead of being pushed low and off the bottom edge.
  // CSS keeps a static min-height as the pre-script fallback.
  function fit() {
    var stage = document.querySelector('.auth-stage');
    if (!stage) return;
    stage.style.minHeight = '0px';
    var rest = document.documentElement.scrollHeight - stage.getBoundingClientRect().height;
    stage.style.minHeight = Math.max(0, Math.round(window.innerHeight - rest)) + 'px';
  }

  var fitBound = false;
  function scheduleFit() {
    // setTimeout as well as rAF: rAF never fires while the tab is hidden, and
    // a card rendered in a background tab still has to be centred when it is
    // brought forward.
    setTimeout(fit, 0);
    requestAnimationFrame(fit);
    if (!fitBound) {
      fitBound = true;
      window.addEventListener('resize', fit);
      window.addEventListener('orientationchange', fit);
    }
  }

  window.ForgeAuthCard = {
    shell: function (o, inner) {
      o = o || {};
      scheduleFit();
      return '<div class="auth-stage">' + sparks() +
        '<form class="auth-card' + (o.wide ? ' wide' : '') + '" id="auth-form" novalidate>' +
          badge() +
          (o.tag ? '<span class="auth-tag">' + o.tag + '</span>' : '') +
          (o.title ? '<h1 class="auth-title">' + o.title + '</h1>' : '') +
          (o.sub ? '<p class="auth-sub">' + o.sub + '</p>' : '') +
          (inner || '') +
          (o.foot ? '<p class="auth-foot">' + o.foot + '</p>' : '') +
        '</form></div>';
    },

    // Enter-to-submit. Call after the shell is in the DOM.
    onSubmit: function (fn) {
      var form = document.getElementById('auth-form');
      if (!form) return;
      form.addEventListener('submit', function (e) { e.preventDefault(); fn(); });
    },

    field: function (id, label, o) {
      o = o || {};
      var enterHint = o.enterkeyhint || (o.type === 'password' ? 'done' : 'next');
      return '<div class="auth-field">' +
        '<label class="auth-label" for="' + id + '">' + label + '</label>' +
        '<input id="' + id + '" class="auth-input" type="' + (o.type || 'text') + '"' +
          (o.placeholder ? ' placeholder="' + o.placeholder + '"' : '') +
          (o.autocomplete ? ' autocomplete="' + o.autocomplete + '"' : '') +
          (o.list ? ' list="' + o.list + '"' : '') +
          ' enterkeyhint="' + enterHint + '"' +
          (o.upper ? ' autocapitalize="characters" style="text-transform:uppercase"' : '') +
        '></div>';
    }
  };
})();
