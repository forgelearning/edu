// ============================================================
// forge-sidebar.js — shared collapsible sidebar shell for the
// Forge student + teacher app pages (badge, rail, footer row).
// Requires css/tokens.css + css/sidebar.css loaded first.
// Include this script immediately after <body> opens, then call
// ForgeSidebar.mount({...}) — see bottom of file for config shape.
// ============================================================

// Logo data URIs live in scripts/forge-logo.js (shared with the sign-in
// cards). That script must be loaded before this one.
var _FORGE_LOGO_DARK = (window.ForgeLogo || {}).dark || '';
var _FORGE_LOGO_LIGHT = (window.ForgeLogo || {}).light || '';

// key -> svg-inner markup for common nav icons, shared across pages
var _FORGE_ICONS = {
  dashboard: '<path d="M3 12l9-9 9 9"></path><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"></path>',
  forge: '<path d="M12 3c1.2 2 .6 3.2-.3 4.3C10.8 8.5 9.5 9.8 9.5 12a2.5 2.5 0 0 0 5 0c0-.8-.3-1.3-.7-1.8"></path><path d="M8 13.5c-1 1.5-1.3 3-1.3 4.3A5.3 5.3 0 0 0 12 23a5.3 5.3 0 0 0 5.3-5.2c0-1.4-.4-2.9-1.3-4.3"></path>',
  anvil: '<path d="M4 13h16l-1.5-3.5a2 2 0 0 0-1.84-1.22L14 8.2V6h1a1 1 0 0 0 0-2h-6a1 1 0 0 0 0 2h1v2.2l-2.66.08a2 2 0 0 0-1.84 1.22L4 13Z"></path><path d="M9 13v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2"></path><path d="M10 17v3M14 17v3M8 20h8"></path>',
  crucible: '<path d="M9 3h6M9 3v3.5a5 5 0 0 1-.7 2.55L5.9 12.9A5 5 0 0 0 5.2 15.45V19a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2v-3.55a5 5 0 0 0-.7-2.55l-2.4-3.85A5 5 0 0 1 15 6.5V3"></path><path d="M7 16h10"></path>',
  profile: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 4-6 8-6s8 2 8 6"></path>',
  signout: '<path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path>',
  assignments: '<rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M3 9h18M8 2v4M16 2v4"></path><path d="M8 13h2M8 17h2M14 13h2M14 17h2"></path>',
  misconceptions: '<path d="M12 9v4M12 17h.01"></path><path d="M10.3 3.9 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path>',
  students: '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  classes: '<path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"></path><path d="M8 8h6M8 12h8M8 16h5"></path>',
  present: '<rect x="2" y="4" width="20" height="13" rx="2"></rect><path d="M8 21h8M12 17v4"></path>'
};

function _fsIcon(key, cls) {
  var inner = _FORGE_ICONS[key] || '';
  return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
}

var ForgeSidebar = {

  // config:
  //   active: string — key of the item to mark active
  //   items: [{key, href, label, badge, badgeMuted}] — main nav items
  //   footerItems: [{key, href, label}] — items after the divider (e.g. Profile). Optional.
  //   classSwitch: {label, addLabel} — optional class-switcher row at the top
  //            (teacher pages). addLabel renames the last row of the menu,
  //            which calls window.forgeOnClassSwitch().
  //   signOut: function — called when Sign out is clicked. Defaults to
  //            window.forgeSignOut() or window.forgeLogout(), whichever exists.
  mount: function(config) {
    config = config || {};
    var items = config.items || [];
    var footerItems = config.footerItems || [];

    var itemsHtml = items.map(function(it) {
      return _fsItemHtml(it, config.active);
    }).join('');
    var footerItemsHtml = footerItems.map(function(it) {
      return _fsItemHtml(it, config.active);
    }).join('');

    var classSwitchHtml = '';
    if (config.classSwitch) {
      this._addLabel = config.classSwitch.addLabel;
      classSwitchHtml =
        '<div class="fside-classswitch" style="position:relative">' +
          '<button class="fclassswitch-btn" id="fclassswitch-btn" onclick="ForgeSidebar._toggleClassMenu()">' +
            _fsIcon('classes') +
            '<span class="fclassswitch-label">' + _fsEsc(config.classSwitch.label || '') + '</span>' +
            '<svg class="fclassswitch-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5 5 5-5"></path></svg>' +
          '</button>' +
          '<div class="fclassswitch-menu" id="fclassswitch-menu" style="display:none"></div>' +
        '</div>';
    }

    var badgeHref = config.badgeHref || 'index.html';
    var badgeHtml =
      '<a id="forge-badge" href="' + _fsEsc(badgeHref) + '">' +
        '<span class="badge-mark">' +
          '<img class="forge-logo-dark" src="' + _FORGE_LOGO_DARK + '" alt="" style="height:22px;width:auto">' +
          '<img class="forge-logo-light" src="' + _FORGE_LOGO_LIGHT + '" alt="" style="height:22px;width:auto">' +
        '</span>' +
        '<span class="badge-name">Forge</span>' +
      '</a>';

    var sidebarHtml =
      '<aside id="forge-sidebar">' +
        classSwitchHtml +
        '<nav class="fside-nav">' + itemsHtml +
          (footerItemsHtml ? '<div class="fside-divider"></div>' + footerItemsHtml : '') +
        '</nav>' +
        '<div class="fside-footer">' +
          '<button class="fside-item danger fside-footer-main" onclick="ForgeSidebar._signOut()">' +
            _fsIcon('signout') +
            '<span class="fside-label">Sign out</span>' +
            '<span class="fside-tooltip">Sign out</span>' +
          '</button>' +
          '<button class="fside-footer-icon" id="forge-theme-toggle" onclick="ForgeSidebar._toggleTheme()" aria-label="Toggle theme">' +
            '<svg id="forge-theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' +
            '<svg id="forge-theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:none"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>' +
            '<span class="fside-tooltip" id="forge-theme-tooltip">Dark mode</span>' +
          '</button>' +
        '</div>' +
      '</aside>' +
      '<button id="forge-sidebar-toggle" onclick="ForgeSidebar._toggleSidebar()" aria-label="Toggle sidebar">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
      '</button>';

    document.body.insertAdjacentHTML('afterbegin', sidebarHtml);
    document.body.insertAdjacentHTML('afterbegin', badgeHtml);
    document.body.classList.add('has-forge-sidebar');

    this._signOutFn = config.signOut || function() {
      if (typeof window.forgeSignOut === 'function') return window.forgeSignOut();
      if (typeof window.forgeLogout === 'function') return window.forgeLogout();
    };

    var expanded = localStorage.getItem('forge-sidebar-expanded') === '1';
    document.getElementById('forge-sidebar').classList.toggle('expanded', expanded);
    document.getElementById('forge-badge').classList.toggle('collapsed', !expanded);
    document.body.classList.toggle('forge-sidebar-expanded', expanded);

    var isLight = localStorage.getItem('forge-theme') === 'light';
    if (isLight) document.documentElement.setAttribute('data-theme', 'light');
    this._updateThemeUI(isLight);

    document.addEventListener('click', function(e) {
      var menu = document.getElementById('fclassswitch-menu');
      var wrap = document.querySelector('.fside-classswitch');
      if (menu && menu.style.display !== 'none' && wrap && !wrap.contains(e.target)) menu.style.display = 'none';
    });
  },

  setClassLabel: function(text) {
    var el = document.querySelector('.fclassswitch-label');
    if (el) el.textContent = text;
  },

  // classes: [{id, name, subject, code}], activeId: currently open class id
  setClassList: function(classes, activeId) {
    this._classes = classes || [];
    this._activeClassId = activeId;
  },

  _toggleClassMenu: function() {
    var menu = document.getElementById('fclassswitch-menu');
    if (!menu) return;
    var open = menu.style.display !== 'none';
    if (open) { menu.style.display = 'none'; return; }
    var classes = this._classes || [];
    var activeId = this._activeClassId;
    var canRemove = typeof window.forgeOnClassRemove === 'function';
    var h = classes.map(function(c) {
      var row = '<div class="fclassswitch-row">' +
        '<button class="fclassswitch-item' + (c.id === activeId ? ' active' : '') + '" onclick="ForgeSidebar._selectClass(\'' + c.id + '\')">' +
          _fsEsc(c.name || c.code || '') +
          '<span class="fcs-sub">' + _fsEsc(c.code || '') + '</span>' +
        '</button>';
      if (canRemove) {
        row += '<button class="fcs-remove" title="Remove from this list" aria-label="Remove ' + _fsEsc(c.name || c.code || 'class') + ' from this list" onclick="ForgeSidebar._removeClass(\'' + c.id + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>' +
        '</button>';
      }
      return row + '</div>';
    }).join('');
    h += '<button class="fclassswitch-item fcs-add" onclick="ForgeSidebar._addClass()">' + _fsEsc(this._addLabel || '+ Join another class') + '</button>';
    menu.innerHTML = h;
    menu.style.display = 'block';
  },

  _selectClass: function(id) {
    var menu = document.getElementById('fclassswitch-menu');
    if (menu) menu.style.display = 'none';
    var cls = (this._classes || []).find(function(c) { return String(c.id) === String(id); });
    if (cls && typeof window.forgeOnClassSelect === 'function') window.forgeOnClassSelect(cls);
  },

  // Drops a class from the switcher list. The page owns what that means (the
  // teacher page forgets it locally rather than deleting the class itself) —
  // the × only shows when a page has provided the hook.
  _removeClass: function(id) {
    var cls = (this._classes || []).find(function(c) { return String(c.id) === String(id); });
    if (!cls || typeof window.forgeOnClassRemove !== 'function') return;
    var kept = window.forgeOnClassRemove(cls);
    if (kept === false) return;
    this._classes = (this._classes || []).filter(function(c) { return String(c.id) !== String(id); });
    var menu = document.getElementById('fclassswitch-menu');
    if (menu) { menu.style.display = 'none'; this._toggleClassMenu(); }
  },

  _addClass: function() {
    var menu = document.getElementById('fclassswitch-menu');
    if (menu) menu.style.display = 'none';
    if (typeof window.forgeOnClassSwitch === 'function') window.forgeOnClassSwitch();
  },

  setBadge: function(key, value, muted) {
    var el = document.querySelector('.fside-item[data-key="' + key + '"] .fside-badge');
    if (!el) return;
    el.textContent = value;
    el.classList.toggle('badge-muted', !!muted);
  },

  _toggleSidebar: function() {
    var sb = document.getElementById('forge-sidebar');
    var badge = document.getElementById('forge-badge');
    var expanded = sb.classList.toggle('expanded');
    badge.classList.toggle('collapsed', !expanded);
    document.body.classList.toggle('forge-sidebar-expanded', expanded);
    localStorage.setItem('forge-sidebar-expanded', expanded ? '1' : '0');
  },

  _updateThemeUI: function(isLight) {
    var moon = document.getElementById('forge-theme-icon-moon');
    var sun = document.getElementById('forge-theme-icon-sun');
    var tip = document.getElementById('forge-theme-tooltip');
    if (!moon || !sun || !tip) return;
    moon.style.display = isLight ? 'none' : 'block';
    sun.style.display = isLight ? 'block' : 'none';
    tip.textContent = isLight ? 'Switch to dark' : 'Switch to light';
  },

  _toggleTheme: function() {
    var h = document.documentElement;
    var isLight = h.getAttribute('data-theme') === 'light';
    if (isLight) {
      h.removeAttribute('data-theme');
      localStorage.setItem('forge-theme', 'dark');
    } else {
      h.setAttribute('data-theme', 'light');
      localStorage.setItem('forge-theme', 'light');
    }
    this._updateThemeUI(!isLight);
  },

  _signOut: function() {
    if (this._signOutFn) this._signOutFn();
  }
};

function _fsEsc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _fsItemHtml(it, activeKey) {
  var tag = it.href ? 'a' : 'button';
  var hrefAttr = it.href ? ' href="' + _fsEsc(it.href) + '"' : '';
  // onclick is a raw JS string (page-controlled, not user input) — used for
  // in-page SPA navigation (e.g. teacher.html's tab switcher) where there's
  // no real URL to link to.
  var onclickAttr = it.onclick ? ' onclick="' + it.onclick.replace(/"/g, '&quot;') + '"' : '';
  var activeCls = it.key === activeKey ? ' active' : '';
  var badgeHtml = (it.badge !== undefined && it.badge !== null)
    ? '<span class="fside-badge' + (it.badgeMuted ? ' badge-muted' : '') + '">' + _fsEsc(it.badge) + '</span>'
    : '';
  return '<' + tag + ' class="fside-item' + activeCls + '" data-key="' + _fsEsc(it.key) + '"' + hrefAttr + onclickAttr + '>' +
    _fsIcon(it.key) +
    '<span class="fside-label">' + _fsEsc(it.label) + '</span>' +
    badgeHtml +
    '<span class="fside-tooltip">' + _fsEsc(it.label) + '</span>' +
  '</' + tag + '>';
}
