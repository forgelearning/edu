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

  window.ForgeAuthCard = {
    shell: function (o, inner) {
      o = o || {};
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
      form.onsubmit = function (e) { e.preventDefault(); fn(); };
    },

    field: function (id, label, o) {
      o = o || {};
      return '<div class="auth-field">' +
        '<label class="auth-label" for="' + id + '">' + label + '</label>' +
        '<input id="' + id + '" class="auth-input" type="' + (o.type || 'text') + '"' +
          (o.placeholder ? ' placeholder="' + o.placeholder + '"' : '') +
          (o.autocomplete ? ' autocomplete="' + o.autocomplete + '"' : '') +
          (o.upper ? ' autocapitalize="characters" style="text-transform:uppercase"' : '') +
        '></div>';
    }
  };
})();
