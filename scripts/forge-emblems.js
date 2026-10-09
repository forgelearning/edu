/* Avatars.

   A student can replace the initials in their avatar with a character. The
   rank frame around it is unchanged, so the frame still shows rank.

   Three sets:

   - Forge: things from the smithy. Two are free; the other seven are earned,
     one for reaching Bronze in each achievement badge, so badges have
     something to spend as well as display, the way XP unlocks colour themes.
   - Subjects: one or two per subject, all free. The picker lists the
     student's own subject first.
   - Legendary: animated, shaded to look solid, and unlocked by lifetime XP,
     the same total that sets the rank. The last one arrives with Master.

   Forge and subject avatars are flat colour with a dark outline. Only a few
   are characters with a face, each with its own expression; the rest are
   objects, so the set does not read as one smile pasted on everything.

   The choice is kept per student on this device, like the colour theme. Only
   the student sees it: friends and the class league draw other students from
   server data, which has no avatar, so they keep showing initials.

   Badges are built from saved answers and lifetime XP only grows, so a choice
   made while unlocked stays valid. Pages that do not compute badges
   (Settings) render the stored choice as it is.

   Flat avatars use no ids. Legendary ones need gradients, filters and clips,
   so every render gets fresh ids: one avatar often appears several times on a
   page.

   Depends on scripts/forge-ranks.js (and forge-achievements.js for badge
   names). Animations are in css/components.css and stop under reduced
   motion. */
(function (root) {
  'use strict';

  var PREFIX = 'forge-emblem:';
  var INK = '#2B1D16';
  var S = ' stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"';
  var R = function () { return root.ForgeRanks; };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── Faces ──────────────────────────────────────────────────────────────
  // o.eyes: 'dot' (blinks, see css/components.css), 'happy' (closed arcs) or
  // 'wink'. o.mouth: 'smile', 'grin', 'o' or 'tongue'. o.cheeks: a colour.
  function face(cx, cy, o) {
    o = o || {};
    var gap = o.gap || 7, l = cx - gap / 2, r = cx + gap / 2, eyes = o.eyes || 'dot', mouth = o.mouth || 'smile';
    var dot = function (x) { return '<ellipse cx="' + x + '" cy="' + cy + '" rx="1.7" ry="2.2" fill="' + INK + '"/>'; };
    var arc = function (x) { return '<path d="M' + (x - 2) + ' ' + (cy + 1) + 'q2-2.8 4 0" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>'; };
    var h = eyes === 'happy' ? arc(l) + arc(r) : eyes === 'wink' ? '<g class="fe-eyes">' + dot(l) + '</g>' + arc(r) : '<g class="fe-eyes">' + dot(l) + dot(r) + '</g>';
    if (o.cheeks) h += '<circle cx="' + (l - 2.2) + '" cy="' + (cy + 3) + '" r="1.7" fill="' + o.cheeks + '" opacity=".7"/>'
      + '<circle cx="' + (r + 2.2) + '" cy="' + (cy + 3) + '" r="1.7" fill="' + o.cheeks + '" opacity=".7"/>';
    var m = cy + 3.2;
    if (mouth === 'grin') h += '<path d="M' + (cx - 3) + ' ' + m + 'h6a3 3 0 0 1-6 0z" fill="' + INK + '"/><path d="M' + (cx - 1.6) + ' ' + (m + 2.3) + 'a1.6 1.1 0 0 1 3.2 0z" fill="#FF7A8A"/>';
    else if (mouth === 'o') h += '<ellipse cx="' + cx + '" cy="' + (m + 1) + '" rx="1.4" ry="1.7" fill="' + INK + '"/>';
    else {
      h += '<path d="M' + (cx - 2.4) + ' ' + m + 'q2.4 2.4 4.8 0" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
      if (mouth === 'tongue') h += '<path d="M' + (cx + .2) + ' ' + (m + 1.1) + 'h2.2v1.3a1.1 1.1 0 0 1-2.2 0z" fill="#FF7A8A" stroke="' + INK + '" stroke-width=".8"/>';
    }
    return h;
  }

  function star4(cx, cy, r) {
    return 'M' + cx + ' ' + (cy - r) + 'Q' + cx + ' ' + cy + ' ' + (cx + r) + ' ' + cy + 'Q' + cx + ' ' + cy + ' ' + cx + ' ' + (cy + r)
      + 'Q' + cx + ' ' + cy + ' ' + (cx - r) + ' ' + cy + 'Q' + cx + ' ' + cy + ' ' + cx + ' ' + (cy - r) + 'z';
  }
  function star5(cx, cy, r) {
    var p = [];
    for (var i = 0; i < 10; i++) {
      var a = Math.PI / 5 * i - Math.PI / 2, d = i % 2 ? r * .45 : r;
      p.push((cx + d * Math.cos(a)).toFixed(2) + ' ' + (cy + d * Math.sin(a)).toFixed(2));
    }
    return 'M' + p.join('L') + 'z';
  }
  var ANVIL = 'M9 18h25c4 0 7-1.5 9-4-1 5-4 8.5-9 9.5V26c0 2-1.5 3.5-3.5 3.5H29v5h4v4H15v-4h4v-5h-2.5C13 29.5 11 27 11 24.5V23c-1.2 0-2-.8-2-2z';

  // ── Legendary drawings ─────────────────────────────────────────────────
  // Drawn on a 100-unit canvas for finer detail, lit from the top left, with
  // blur filters for glow and heat, and textures for metal and scales. Each
  // takes a fresh id prefix for its gradients, filters and clips, and is
  // clipped to the circle so nothing (the dragon's fire) spills outside.
  function stops(list) {
    return list.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('');
  }
  function lin(id, list, x1, y1, x2, y2) {
    return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stops(list) + '</linearGradient>';
  }
  function rad(id, list, cx, cy, r) {
    return '<radialGradient id="' + id + '" cx="' + (cx == null ? .5 : cx) + '" cy="' + (cy == null ? .5 : cy) + '" r="' + (r || .6) + '">' + stops(list) + '</radialGradient>';
  }
  function blur(id, sd) {
    return '<filter id="' + id + '" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="' + sd + '"/></filter>';
  }
  // Fine streaks for brushed metal, or speckle, kept inside the shape it is applied to.
  function grain(id, freq, alpha) {
    return '<filter id="' + id + '" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="2" seed="7"/>'
      + '<feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ' + alpha + ' 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>';
  }
  function frame(u, defs, body) {
    return '<defs><clipPath id="' + u + 'o"><circle cx="50" cy="50" r="50"/></clipPath>' + defs + '</defs><g clip-path="url(#' + u + 'o)">' + body + '</g>';
  }
  // A spark or ember that flies off along (dx, dy).
  function fly(x, y, dx, dy, delay, colour, size) {
    return '<circle class="lg-spark" cx="' + x + '" cy="' + y + '" r="' + (size || 1.3) + '" fill="' + (colour || '#FFE58A') + '" style="--dx:' + dx + 'px;--dy:' + dy + 'px;animation-delay:' + delay + 's"/>';
  }
  function poly(pts, fill, extra) { return '<polygon points="' + pts + '" fill="' + fill + '"' + (extra || '') + '/>'; }

  var LEGENDARY_ART = {
    molten: function (u) {
      var F = 'M18 37H64C74 37 84 34 92 28C89 39 80 46 68 48V53C68 57.5 65 61 60.5 61H58V70H66Q68 70 68 72V78H32V72Q32 70 34 70H42V61H38.5C31.5 61 26 56 26 50V47C21.5 47 18 44 18 41Z';
      var TOP = 'M18 37L24 31H64.5C73.5 31 82 29.5 92 28C84 34 74 37 64 37Z';
      var defs = rad(u + 'b', [[0, '#C2410C'], [.38, '#561405'], [1, '#0E0503']], .5, .95, .95)
        + lin(u + 'f', [[0, '#2A3136'], [.22, '#69757F'], [.48, '#B4BEC7'], [.7, '#6A7680'], [1, '#2C3338']], 0, 0, 1, 0)
        + lin(u + 's', [[0, '#000', 0], [.55, '#000', 0], [1, '#000', .6]])
        + lin(u + 't', [[0, '#8E99A3'], [.45, '#F5F8FA'], [1, '#A9B4BD']], 0, 0, 1, 0)
        + lin(u + 'h', [[0, '#FFFCE6'], [.4, '#FFC53D'], [1, '#FF4E10']])
        + rad(u + 'w', [[0, '#FF8A2B', .55], [1, '#FF8A2B', 0]], .5, 0, .9)
        + blur(u + 'g', 2.2) + blur(u + 'G', 5.5) + grain(u + 'n', '0.9', .18);
      return frame(u, defs,
        '<circle cx="50" cy="50" r="50" fill="url(#' + u + 'b)"/>'
        + '<g class="lg-flicker" filter="url(#' + u + 'G)" opacity=".9"><ellipse cx="50" cy="98" rx="42" ry="16" fill="#FF6A13"/><ellipse cx="34" cy="94" rx="10" ry="16" fill="#FFB02E"/><ellipse cx="66" cy="95" rx="9" ry="14" fill="#FFB02E"/></g>'
        + '<ellipse cx="50" cy="79" rx="31" ry="3.6" fill="#000" opacity=".65" filter="url(#' + u + 'g)"/>'
        + '<path d="' + F + '" fill="url(#' + u + 'f)"/>'
        + '<path d="' + F + '" fill="#fff" filter="url(#' + u + 'n)" opacity=".7"/>'
        + '<path d="' + F + '" fill="url(#' + u + 's)"/>'
        + '<path d="' + F + '" fill="url(#' + u + 'w)"/>'
        + '<path d="' + F + '" fill="none" stroke="#111518" stroke-width=".9" stroke-linejoin="round"/>'
        + '<path d="' + TOP + '" fill="url(#' + u + 't)" stroke="#111518" stroke-width=".7" stroke-linejoin="round"/>'
        + '<path d="M30 32.3h4.4l-1 1.9h-4.4z" fill="#1A1F23"/>'
        + '<path d="M19.5 37.7H64C74 37.7 83.5 34.6 90.5 29.5" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>'
        + '<path d="M70 42.5C78 41 85 37 89 32" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".3"/>'
        + '<path d="M43 61.5V69.5" stroke="#D3DBE2" stroke-width=".9" opacity=".45"/>'
        + '<path d="M18.6 41C18.6 44 21.6 46.6 26.6 46.6V50C26.6 55.6 31.6 60.4 38.6 60.4M42.6 70.6H34Q32.6 70.6 32.6 72V77.4" fill="none" stroke="#FF8A2B" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>'
        + '<ellipse cx="50" cy="62" rx="13" ry="2.2" fill="#000" opacity=".45" filter="url(#' + u + 'g)"/>'
        + '<ellipse cx="50" cy="70.8" rx="17" ry="1.6" fill="#000" opacity=".35" filter="url(#' + u + 'g)"/>'
        + '<g class="lg-twinkle" style="animation-delay:.6s"><path d="' + star4(84, 33, 3.4) + '" fill="#fff"/></g>'
        + '<g class="lg-haze" filter="url(#' + u + 'G)" opacity=".35"><ellipse cx="53" cy="17" rx="10" ry="7" fill="#FFB02E"/></g>'
        + '<ellipse class="lg-pulse" cx="53" cy="33.5" rx="18" ry="3" fill="#FF8A2B" opacity=".75" filter="url(#' + u + 'g)"/>'
        + '<rect class="lg-pulse" x="38" y="25" width="30" height="9" rx="4.5" fill="#FF7A1A" filter="url(#' + u + 'G)"/>'
        + '<path d="M40.5 33.6C40 31 41 28.3 43.5 28H63.5C66 28.3 67 31 66.4 33.6Z" fill="url(#' + u + 'h)" stroke="#7A2400" stroke-width=".5"/>'
        + '<path d="M44 29.6h17.5" stroke="#FFFFF2" stroke-width=".9" stroke-linecap="round" opacity=".85"/>'
        + '<g filter="url(#' + u + 'g)" opacity=".6">' + fly(46, 28, -18, -30, 0, '#FFB02E', 2) + fly(58, 28, 16, -28, .7, '#FFB02E', 2) + '</g>'
        + fly(47, 28, -20, -30, 0) + fly(52, 27, -4, -36, .35) + fly(57, 28, 18, -30, .7) + fly(54, 28, 8, -34, 1.05) + fly(49, 28, -12, -26, 1.4) + fly(60, 29, 24, -20, 1.7)
      );
    },
    crystal: function (u) {
      var a = '32 30', b = '44 30', c = '56 30', d = '68 30';
      var G = '16 42', H = '29 42', I = '41 42', K = '59 42', L = '71 42', M = '84 42';
      var g = '16 43.6', h = '29 43.6', i = '41 43.6', j = '50 43.6', k = '59 43.6', l = '71 43.6', m = '84 43.6', C = '50 86';
      var edge = ' stroke="#EAF8FF" stroke-opacity=".75" stroke-width=".5" stroke-linejoin="round"';
      var outline = [G, a, '36 27', '64 27', d, M, m, C, g].join(' ');
      var defs = rad(u + 'b', [[0, '#2C1F70'], [.6, '#0E0A2C'], [1, '#05040F']], .5, .42, .75)
        + rad(u + 'a', [[0, '#A9DDFF', .85], [1, '#A9DDFF', 0]]) + rad(u + 'i', [[0, '#FFFFFF', .55], [1, '#FFFFFF', 0]])
        + lin(u + 'L', [[0, '#FFFFFF'], [1, '#A6E9FF']]) + lin(u + 'M', [[0, '#9BDCFF'], [1, '#4F7DF0']])
        + lin(u + 'D', [[0, '#6168E8'], [1, '#2A1C86']]) + lin(u + 'X', [[0, '#3B2CB4'], [1, '#120A48']])
        + '<clipPath id="' + u + 'c"><polygon points="' + outline + '"/></clipPath>' + blur(u + 'g', 3) + blur(u + 'f', .9);
      var stars = [[14, 22, .7], [84, 18, .9], [22, 70, .6], [80, 66, .7], [70, 10, .5], [10, 50, .5], [90, 44, .6]].map(function (s) { return '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="' + s[2] + '" fill="#fff" opacity=".8"/>'; }).join('');
      return frame(u, defs,
        '<circle cx="50" cy="50" r="50" fill="url(#' + u + 'b)"/>' + stars
        + '<circle class="lg-pulse" cx="50" cy="52" r="36" fill="url(#' + u + 'a)" opacity=".55"/>'
        + '<ellipse class="lg-pulse" cx="50" cy="93" rx="19" ry="3" fill="#9FD8FF" filter="url(#' + u + 'g)"/>'
        + poly('36 90 50 99 64 90', '#9FD8FF', ' opacity=".14" filter="url(#' + u + 'f)"')
        + '<g class="lg-float">'
        + poly([a, '36 27', '64 27', d].join(' '), 'url(#' + u + 'L)', edge)
        + poly([G, a, H].join(' '), 'url(#' + u + 'M)', edge) + poly([H, a, b].join(' '), 'url(#' + u + 'L)', edge)
        + poly([H, b, I].join(' '), 'url(#' + u + 'D)', edge) + poly([I, b, c, K].join(' '), 'url(#' + u + 'L)', edge)
        + poly([K, c, L].join(' '), 'url(#' + u + 'M)', edge) + poly([c, d, L].join(' '), 'url(#' + u + 'D)', edge)
        + poly([L, d, M].join(' '), 'url(#' + u + 'M)', edge)
        + poly([G, M, m, g].join(' '), '#D6F4FF', edge)
        + poly([g, h, C].join(' '), 'url(#' + u + 'D)', edge) + poly([h, i, C].join(' '), 'url(#' + u + 'M)', edge)
        + poly([i, j, C].join(' '), 'url(#' + u + 'X)', edge) + poly([j, k, C].join(' '), 'url(#' + u + 'L)', edge)
        + poly([k, l, C].join(' '), 'url(#' + u + 'D)', edge) + poly([l, m, C].join(' '), 'url(#' + u + 'X)', edge)
        + poly('41 43.6 50 72 59 43.6', '#fff', ' opacity=".14"')
        + '<g clip-path="url(#' + u + 'c)"><ellipse class="lg-pulse" cx="47" cy="50" rx="20" ry="14" fill="url(#' + u + 'i)"/></g>'
        + poly('29 43.6 36 60 41 43.6', '#fff', ' opacity=".1"') + poly('59 43.6 64 58 71 43.6', '#fff', ' opacity=".08"')
        + '<g class="lg-glimmer">' + poly('35 51 39 56 34 57.5', '#FF7AD9', ' opacity=".6"') + poly('62 49 66 53 61 55', '#FFE66B', ' opacity=".6"')
        + poly('46 63 50 68 45 69.5', '#7BFFB0', ' opacity=".55"') + poly('55 58 58 61 54 62', '#7FD8FF', ' opacity=".6"') + '</g>'
        + '<g clip-path="url(#' + u + 'c)"><g transform="rotate(22 50 50)"><rect class="lg-shine" x="20" y="-10" width="9" height="120" fill="#fff" opacity=".55"/></g></g>'
        + poly(outline, 'none', ' stroke="#F4FCFF" stroke-width=".9" stroke-linejoin="round" opacity=".9"')
        + '</g>'
        + '<g class="lg-twinkle"><path d="' + star4(36, 27, 7) + '" fill="#fff" filter="url(#' + u + 'f)"/><path d="' + star4(36, 27, 5) + '" fill="#fff"/></g>'
        + '<g class="lg-twinkle" style="animation-delay:.9s"><path d="' + star4(70, 33, 4.5) + '" fill="#D9F6FF"/></g>'
        + '<g class="lg-twinkle" style="animation-delay:1.7s"><path d="' + star4(24, 46, 3.5) + '" fill="#fff"/></g>'
      );
    },
    phoenix: function (u) {
      var feather = function (len, w, angle, grad) {
        return '<g transform="rotate(' + angle + ')"><path d="M0 0C' + (w * .6) + ' ' + (-len * .25) + ' ' + (w * .55) + ' ' + (-len * .78) + ' 0 ' + (-len) + 'C' + (-w * .55) + ' ' + (-len * .78) + ' ' + (-w * .6) + ' ' + (-len * .25) + ' 0 0Z" fill="url(#' + u + grad + ')" stroke="#6A1505" stroke-width=".4"/>'
          + '<path d="M0 -2V' + (-len * .9) + '" stroke="#FFE7A0" stroke-width=".6" opacity=".55"/>'
          + '<path d="' + [.3, .45, .6, .75].map(function (t) { var y = (-len * t).toFixed(1), y2 = (-len * (t + .07)).toFixed(1), x = (w * .32).toFixed(1); return 'M0 ' + y + 'L' + x + ' ' + y2 + 'M0 ' + y + 'L-' + x + ' ' + y2; }).join('') + '" stroke="#7A1A05" stroke-width=".35" opacity=".4"/></g>';
      };
      var wing = '<g class="lg-wing"><g transform="translate(44 50)">'
        + [[40, 9, -80], [45, 9.5, -66], [43, 9.5, -52], [37, 9, -38], [29, 8.5, -24]].map(function (f) { return feather(f[0], f[1], f[2], 'p'); }).join('')
        + [[25, 10, -72], [25, 10, -55], [21, 9.5, -38]].map(function (f) { return feather(f[0], f[1], f[2], 'c'); }).join('')
        + '</g></g>';
      var defs = rad(u + 'b', [[0, '#A8320A'], [.5, '#4A0E03'], [1, '#120402']], .5, .55, .7)
        + lin(u + 'p', [[0, '#A3140A'], [.45, '#FF6A13'], [.82, '#FFB02E'], [1, '#FFF2A8']], 0, 1, 0, 0)
        + lin(u + 'c', [[0, '#D42E14'], [1, '#FFC93C']], 0, 1, 0, 0)
        + lin(u + 'y', [[0, '#FFF0A0'], [.45, '#FFA020'], [1, '#C2260E']])
        + lin(u + 'T', [[0, '#FFB02E'], [.6, '#D42E14'], [1, '#D42E14', 0]])
        + rad(u + 'a', [[0, '#FF8A2B', .9], [1, '#FF8A2B', 0]]) + blur(u + 'g', 3) + blur(u + 'f', 1) + grain(u + 'n', '1.1', .14);
      return frame(u, defs,
        '<circle cx="50" cy="50" r="50" fill="url(#' + u + 'b)"/>'
        + '<circle class="lg-pulse" cx="50" cy="46" r="38" fill="url(#' + u + 'a)" opacity=".6"/>'
        + '<g filter="url(#' + u + 'f)">' + fly(30, 84, -6, -46, 0, '#FFB02E', 1.4) + fly(70, 86, 6, -44, .8, '#FFB02E', 1.4) + fly(50, 92, 2, -50, 1.5, '#FFE58A', 1.2) + '</g>'
        + '<g class="lg-float">'
        + '<g class="lg-sway"><path d="M47 60C44 74 50 84 45 99C54 88 57 76 53 60Z" fill="url(#' + u + 'T)"/>'
        + '<path d="M46 60C38 70 30 77 22 93C33 85 42 78 49 64Z" fill="url(#' + u + 'T)"/><path d="M54 60C62 70 70 77 78 93C67 85 58 78 51 64Z" fill="url(#' + u + 'T)"/></g>'
        + wing + '<g transform="translate(100 0) scale(-1 1)">' + wing + '</g>'
        + '<ellipse class="lg-pulse" cx="50" cy="44" rx="13" ry="18" fill="#FFE27A" opacity=".55" filter="url(#' + u + 'g)"/>'
        + '<path d="M50 29C57 29 61 37 61 46C61 55 56 62 50 67C44 62 39 55 39 46C39 37 43 29 50 29Z" fill="url(#' + u + 'y)" stroke="#6A1505" stroke-width=".5"/>'
        + '<path d="M50 29C57 29 61 37 61 46C61 55 56 62 50 67C44 62 39 55 39 46C39 37 43 29 50 29Z" fill="#fff" filter="url(#' + u + 'n)" opacity=".5"/>'
        + '<path d="M58.5 38C60 42 60 49 58 54" fill="none" stroke="#7A1A05" stroke-width="1.2" stroke-linecap="round" opacity=".35"/>'
        + '<path d="M44 49q3 3 6 0q3 3 6 0M42.5 55q3.75 3.3 7.5 0q3.75 3.3 7.5 0M45 61q2.5 2.6 5 0q2.5 2.6 5 0" fill="none" stroke="#B3260E" stroke-width=".8" opacity=".6"/>'
        + '<path d="M48 19C44 12 45 6 49 1C48 8 50 12 52 18ZM51 18C51 11 54 7 59 4C55 10 55 14 54 19ZM46 21C40 17 38 11 40 5C42 12 45 15 48 19Z" fill="url(#' + u + 'c)"/>'
        + '<path d="M43.5 23C45 17.5 51 15 56.5 16.8C59.5 17.8 61.5 20.3 62 23.2L61 28.5C58.5 30 57 31.5 55.5 34C52 35 47 34.5 44.5 32C42.5 29.5 42.6 26 43.5 23Z" fill="url(#' + u + 'y)" stroke="#6A1505" stroke-width=".5"/>'
        + '<path d="M45.5 21C47.5 18.4 50.5 17.4 53.5 17.8" fill="none" stroke="#FFF7D0" stroke-width="1" stroke-linecap="round" opacity=".8"/>'
        + '<path d="M60 21.8C64.5 21.6 68.5 24 69 28.6C68.6 30 67.6 30.6 66.8 30.4C66.6 28.6 65.4 27.4 63.6 27.2L60.5 28.6Z" fill="#FFD23F" stroke="#7A3A00" stroke-width=".5" stroke-linejoin="round"/>'
        + '<path d="M61 27.6L65 27.2" stroke="#7A3A00" stroke-width=".5"/>'
        + '<g class="fe-eyes"><ellipse cx="56" cy="23.2" rx="1.9" ry="1.6" fill="#FFE36B"/><circle cx="56.3" cy="23.2" r="1.1" fill="#2B0A00"/><circle cx="56.7" cy="22.8" r=".4" fill="#fff"/></g>'
        + '<path d="M52.6 21.3C54.6 20.4 57.4 20.6 59.4 22" fill="none" stroke="#7A1A05" stroke-width="1.1" stroke-linecap="round"/>'
        + '</g>'
      );
    },
    storm: function (u) {
      var wraps = '';
      for (var y = 48; y <= 82; y += 4.5) wraps += '<path d="M46 ' + y + 'L54 ' + (y - 3) + '" stroke="#26140A" stroke-width="1.3" opacity=".85"/><path d="M46 ' + (y + 1.1) + 'L54 ' + (y - 1.9) + '" stroke="#C08A5A" stroke-width=".6" opacity=".45"/>';
      var bolt = function (d, delay) {
        return '<g class="lg-flash" style="animation-delay:' + delay + 's"><path d="' + d + '" fill="#8FD0FF" filter="url(#' + u + 'g)"/><path d="' + d + '" fill="#F6FCFF"/></g>';
      };
      var defs = lin(u + 'b', [[0, '#1E3260'], [.55, '#0B1430'], [1, '#05080F']])
        + lin(u + 'm', [[0, '#55657A'], [.3, '#D9E3EC'], [.48, '#F8FBFF'], [.68, '#97A8BA'], [1, '#435163']])
        + lin(u + 't', [[0, '#A7B7C6'], [.5, '#F2F7FB'], [1, '#B4C3D0']], 0, 0, 1, 0)
        + lin(u + 'k', [[0, '#FFF2B8'], [.45, '#E3B341'], [1, '#7C4F0B']])
        + lin(u + 'l', [[0, '#2E190B'], [.5, '#8C5B35'], [1, '#2E190B']], 0, 0, 1, 0)
        + blur(u + 'g', 1.8) + blur(u + 'c', 4) + grain(u + 'n', '0.04 1.4', .3);
      return frame(u, defs,
        '<circle cx="50" cy="50" r="50" fill="url(#' + u + 'b)"/>'
        + '<g class="lg-drift" filter="url(#' + u + 'c)" opacity=".85"><ellipse cx="22" cy="16" rx="24" ry="10" fill="#3D4D70"/><ellipse cx="60" cy="9" rx="28" ry="11" fill="#33415F"/><ellipse cx="88" cy="24" rx="18" ry="9" fill="#3D4D70"/></g>'
        + '<g opacity=".3"><circle class="lg-flash" cx="50" cy="50" r="50" fill="#CFE6FF"/></g>'
        + bolt('M22 14L15 33L23 32L13 55L31 26L23 27L30 14Z', 0) + bolt('M80 18L74 32L81 31L73 48L88 28L81 29L86 18Z', 1.1)
        + '<g transform="rotate(-18 50 52)">'
        + '<rect x="46" y="44" width="8" height="42" rx="2.5" fill="url(#' + u + 'l)" stroke="#1A0E06" stroke-width=".6"/>' + wraps
        + '<rect x="44" y="85" width="12" height="6" rx="2" fill="url(#' + u + 'k)" stroke="#3A2606" stroke-width=".6"/>'
        + '<circle class="lg-pulse" cx="50" cy="88" r="3" fill="#5CE1FF" filter="url(#' + u + 'g)"/><circle cx="50" cy="88" r="1.6" fill="#CFF8FF"/>'
        + '<rect x="44" y="42" width="12" height="4" rx="1" fill="url(#' + u + 'k)" stroke="#3A2606" stroke-width=".5"/>'
        + '<path d="M22 20L26 15.5H74L78 20Z" fill="url(#' + u + 't)" stroke="#10161D" stroke-width=".6" stroke-linejoin="round"/>'
        + '<rect x="20" y="20" width="60" height="24" rx="2.5" fill="url(#' + u + 'm)" stroke="#10161D" stroke-width=".8"/>'
        + '<rect x="20" y="20" width="60" height="24" rx="2.5" fill="#fff" filter="url(#' + u + 'n)"/>'
        + '<path d="M22 21.2H78" stroke="#fff" stroke-width=".8" opacity=".85"/><path d="M22 42.8H78" stroke="#0B0F14" stroke-width="1" opacity=".6"/>'
        + '<path d="M79.2 22V42.5M20.8 22V42.5" stroke="#8FD0FF" stroke-width="1.2" stroke-linecap="round" opacity=".75"/>'
        + '<g class="lg-flash"><path d="M24 20L34 20L28 44L18 44Z" fill="#E6F6FF" opacity=".35"/></g>'
        + '<path d="M53.5 46V84" stroke="#8FD0FF" stroke-width=".8" opacity=".35"/>'
        + [31, 63].map(function (x) {
          return '<rect x="' + x + '" y="20" width="6" height="24" fill="url(#' + u + 'k)" stroke="#3A2606" stroke-width=".5"/>'
            + '<path d="M' + x + ' 20L' + (x + 3) + ' 15.5H' + (x + 9) + 'L' + (x + 6) + ' 20Z" fill="#FFE9A0" stroke="#3A2606" stroke-width=".4"/>'
            + '<circle cx="' + (x + 3) + '" cy="24" r="1.1" fill="#FFF4C8" stroke="#6A4508" stroke-width=".4"/><circle cx="' + (x + 3) + '" cy="40" r="1.1" fill="#FFF4C8" stroke="#6A4508" stroke-width=".4"/>';
        }).join('')
        + '<g class="lg-pulse"><path d="M47 25V39M47 25L53 30L47 34M53 30V39" fill="none" stroke="#5CE1FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#' + u + 'g)"/></g>'
        + '<path d="M47 25V39M47 25L53 30L47 34M53 30V39" fill="none" stroke="#D8FAFF" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<g class="lg-flash" style="animation-delay:.4s"><path d="M18 24l-5 3 4 1.5-5 4.5M82 38l5 2-4 2 5 3.5" fill="none" stroke="#BFE9FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></g>'
        + '</g>'
      );
    },
    dragon: function (u) {
      var HEAD = 'M8 100C8 80 14 60 26 46C34 36 46 30 60 30C68 30 74 33 80 37L90 42C93 44 94 47 92 50L74 52C70 52.5 66 54 63 56L56 60C50 64 44 74 42 100Z';
      var defs = rad(u + 'b', [[0, '#6A1C0E'], [.55, '#2A0905'], [1, '#0C0302']], .7, .5, .8)
        + lin(u + 's', [[0, '#72F2AC'], [.35, '#25AA68'], [.7, '#0E6A3D'], [1, '#06331D']], 0, 0, .4, 1)
        + lin(u + 'd', [[0, '#000', 0], [.5, '#000', 0], [1, '#000', .5]])
        + lin(u + 'j', [[0, '#1C8A52'], [1, '#063019']])
        + lin(u + 'y', [[0, '#F3E7B0'], [1, '#A88E50']], 0, 0, 1, 0)
        + lin(u + 'h', [[0, '#FFF8E6'], [.5, '#CDB98A'], [1, '#6E5A36']])
        + lin(u + 'f1', [[0, '#FF3D1F'], [.7, '#FF3D1F', .8], [1, '#FF3D1F', 0]], 0, 0, 1, 0)
        + lin(u + 'f2', [[0, '#FFA020'], [1, '#FFA020', 0]], 0, 0, 1, 0)
        + lin(u + 'f3', [[0, '#FFFBE0'], [1, '#FFE27A', 0]], 0, 0, 1, 0)
        + rad(u + 'e', [[0, '#FFE36B'], [1, '#FF9A1F', 0]])
        + '<clipPath id="' + u + 'c"><path d="' + HEAD + '"/></clipPath>'
        + '<pattern id="' + u + 'p" width="5" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)"><path d="M0 4Q2.5 .5 5 4" fill="none" stroke="#032012" stroke-width=".6" stroke-opacity=".6"/><path d="M0 3.4Q2.5 0 5 3.4" fill="none" stroke="#9CFFC8" stroke-width=".3" stroke-opacity=".35"/></pattern>'
        + blur(u + 'g', 2) + blur(u + 'f', .9) + blur(u + 'G', 4);
      return frame(u, defs,
        '<circle cx="50" cy="50" r="50" fill="url(#' + u + 'b)"/>'
        + '<g filter="url(#' + u + 'G)" opacity=".45">' + fly(88, 40, 6, -30, .2, '#8A8A8A', 3) + fly(87, 41, -2, -34, 1.4, '#8A8A8A', 2.5) + '</g>'
        + '<g class="lg-breath"><path d="M84 55C90 45 98 43 108 45C101 49 100 52 101 55C105 56 107 59 110 64C101 67 92 65 84 58Z" fill="url(#' + u + 'f1)" filter="url(#' + u + 'f)"/>'
        + '<path d="M85 55.5C90 49 96 48 103 49C99 51.5 98.5 53.5 99 55.5C102 56.5 104 58.5 105 61C99 62.5 91 61.5 85 57.5Z" fill="url(#' + u + 'f2)"/>'
        + '<path d="M86 55.8C89 53 93 52.5 97 53C95.5 54 95.3 55 95.6 56C97 56.6 98 57.5 98.5 58.6C94.5 59 90 58.5 86 57Z" fill="url(#' + u + 'f3)"/></g>'
        + '<path d="M24 48L13 44L20 55ZM18 58L7 56L15 66ZM14 70L3 70L12 78ZM12 82L1 84L11 90Z" fill="url(#' + u + 'h)" stroke="#3A2C14" stroke-width=".4"/>'
        + '<path d="M60 55C68 52 80 51 90 50L84 61C76 59 68 58 60 59Z" fill="#3A0A06"/>'
        + '<path d="M62 58C68 58 74 59 79 60.5C74 61.8 68 61.8 63 61.2Z" fill="#C2264A"/>'
        + '<path d="M62 57C68 56 76 57 84 59C86 60 86 63 83 64C76 66 68 67 61 67C58 67 56 64 58 61Z" fill="url(#' + u + 'j)" stroke="#032012" stroke-width=".6"/>'
        + '<path d="M68 58.4L69 56L70 58.5ZM74 58.8L75 56.6L76 59ZM79 59.6L80 57.6L81 59.8Z" fill="#FFF8E6"/>'
        + '<path d="' + HEAD + '" fill="url(#' + u + 's)"/>'
        + '<rect x="0" y="20" width="100" height="80" fill="url(#' + u + 'p)" clip-path="url(#' + u + 'c)"/>'
        + '<path d="M42 100C44 80 48 70 56 62L60 66C54 72 50 84 50 100Z" fill="url(#' + u + 'y)"/>'
        + '<path d="M44.5 90H50M45.5 82H51M47.5 74H53M51 68H56" stroke="#7A6630" stroke-width=".7" opacity=".7"/>'
        + '<path d="' + HEAD + '" fill="url(#' + u + 'd)"/>'
        + '<path d="' + HEAD + '" fill="none" stroke="#032012" stroke-width=".8" stroke-linejoin="round"/>'
        + '<path d="M28 46C36 36 48 31 60 31C68 31 74 34 80 38" fill="none" stroke="#C8FFE0" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>'
        + '<path d="M66 52.6L67.2 55.6L68.4 52.4ZM71 52.1L72 54.7L73 52ZM76 51.6L76.9 54L77.8 51.5ZM81 51.1L81.8 53.3L82.6 51Z" fill="#FFF8E6"/>'
        + '<path d="M44 50L35 57L46 55.5ZM48 54L41 63L50 59.5Z" fill="#0A4A2A" stroke="#032012" stroke-width=".4"/>'
        + '<path d="M36 40C28 30 22 20 11 12C20 15 31 22 41 34Z" fill="url(#' + u + 'h)" stroke="#4A3A20" stroke-width=".5"/>'
        + '<path d="M46 33C42 22 40 12 33 2C42 8 48 18 52.5 31Z" fill="url(#' + u + 'h)" stroke="#4A3A20" stroke-width=".5"/>'
        + '<path d="M30.5 29.5l3-2.2M25.5 23.6l3-2M20.5 18.8l2.6-1.7M43 22.5l3.2-1.2M40 14.5l3-1.3" stroke="#7A6640" stroke-width=".7" opacity=".8"/>'
        + '<path d="M53 35.5C58.5 32.5 66 32.5 72 36" fill="none" stroke="#032012" stroke-width="2.4" stroke-linecap="round"/>'
        + '<path d="M54 34.3C59 31.8 65.5 31.8 70.5 34.5" fill="none" stroke="#9CFFC8" stroke-width=".7" stroke-linecap="round" opacity=".6"/>'
        + '<ellipse cx="62" cy="40.5" rx="9.5" ry="5.8" fill="#021A0D" opacity=".5" filter="url(#' + u + 'f)"/>'
        + '<ellipse class="lg-pulse" cx="62" cy="40" rx="8" ry="5" fill="url(#' + u + 'e)" filter="url(#' + u + 'g)"/>'
        + '<path d="M74 38.5C79 39.5 84 41.5 87.5 43.5" fill="none" stroke="#E8FFF2" stroke-width="1" stroke-linecap="round" opacity=".4"/>'
        + '<path class="lg-pulse" d="M61.5 66.8C69 66.4 77 65.4 83.5 63.6M84 50.6C87 49.8 90 49.2 92 48.6" fill="none" stroke="#FFB02E" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>'
        + '<g class="fe-eyes"><path d="M57 40C59 37.5 64 37 67.5 39.5C64.5 42.6 60 42.6 57 40Z" fill="#FFC21F" stroke="#3A2000" stroke-width=".5"/>'
        + '<ellipse cx="62.4" cy="40" rx=".9" ry="2.4" fill="#1A0A00"/><circle cx="63.8" cy="38.8" r=".6" fill="#fff"/></g>'
        + '<path d="M85 43.2c1.5-.8 3-.4 3.5.6" fill="none" stroke="#032012" stroke-width="1.2" stroke-linecap="round"/>'
      );
    }
  };

  var AVATARS = [
    // ── Forge: free ──────────────────────────────────────────────────────
    { key: 'spark', name: 'Spark', set: 'forge', bg: '#2B2140',
      art: '<path d="M24 6l4 11 11-3-7 9 7 9-11-3-4 11-4-11-11 3 7-9-7-9 11 3z" fill="#FFC93C"' + S + '/>' + face(24, 22, { gap: 6, mouth: 'grin' }) },
    { key: 'ingot', name: 'Ingot', set: 'forge', bg: '#6B4E9B',
      art: '<path d="M15 15h18l6 10H9z" fill="#FFE08A"' + S + '/><path d="M9 25h30v9H9z" fill="#E3A21A"' + S + '/>'
        + '<rect x="19" y="27.5" width="10" height="4" rx="1" fill="#C98A12"/><path d="M17 18.5h8" stroke="#FFF6D5" stroke-width="2" stroke-linecap="round"/>'
        + '<path d="' + star4(36, 11, 3) + '" fill="#FFFFFF"/>' },
    // ── Forge: one per achievement badge, unlocked at Bronze ──────────────
    { key: 'hammer', name: 'Hammer', set: 'forge', badge: 'answers', bg: '#F2C14E',
      art: '<g transform="rotate(-35 24 24)"><rect x="21.5" y="19" width="5" height="24" rx="2" fill="#B9773E"' + S + '/>'
        + '<path d="M23 23v16" stroke="#8C5427" stroke-width="1.2"/><rect x="11" y="8" width="26" height="12" rx="3" fill="#8C96A3"' + S + '/>'
        + '<path d="M14 11.5h12" stroke="#D5DBE1" stroke-width="1.6" stroke-linecap="round"/></g>'
        + '<path d="' + star4(10, 34, 3) + '" fill="#FFFFFF"/>' },
    { key: 'anvil', name: 'Anvil', set: 'forge', badge: 'repairs', bg: '#E8743B',
      art: '<path d="' + ANVIL + '" fill="#5D6670"' + S + '/><rect x="17" y="13.5" width="12" height="4.5" rx="2" fill="#FFB02E"' + S + '/>'
        + '<circle cx="34" cy="10" r="1.6" fill="#FFE07A"/><circle cx="30" cy="7" r="1.1" fill="#FFE07A"/><circle cx="14" cy="9" r="1.2" fill="#FFE07A"/>' },
    { key: 'ember', name: 'Ember', set: 'forge', badge: 'streak', bg: '#3B2A55',
      art: '<path d="M24 5c2 6 11 10 11 21a11 11 0 0 1-22 0c0-5 3-8.5 5-10.5.3 3 1.5 5 3.5 6C20.5 16 22 10 24 5z" fill="#FF8A2B"' + S + '/>'
        + '<path d="M24 21c2 3 6.5 5 6.5 9.5a6.5 6.5 0 0 1-13 0c0-3 2-5 3.5-6 .3 1.5 1 2.4 2 2.8z" fill="#FFD24A"/>'
        + face(24, 28.5, { gap: 6, eyes: 'happy', cheeks: '#FF6A3D' }) },
    { key: 'hourglass', name: 'Hourglass', set: 'forge', badge: 'timed', bg: '#7FB3D5',
      art: '<path d="M16 11h16c0 6-5 9.5-6.5 13 1.5 3.5 6.5 7 6.5 13H16c0-6 5-9.5 6.5-13C21 20.5 16 17 16 11z" fill="#EAF6FF"' + S + '/>'
        + '<path d="M18.5 13h11c-.5 3-3.5 5.5-5.5 8-2-2.5-5-5-5.5-8z" fill="#F2B84B"/><path d="M18 35c.8-3 4-5 6-6.5 2 1.5 5.2 3.5 6 6.5z" fill="#F2B84B"/>'
        + '<path d="M24 21v8" stroke="#F2B84B" stroke-width="1.2" stroke-dasharray="1.2 1.2"/>'
        + '<rect x="13" y="7" width="22" height="4" rx="2" fill="#9A5B2E"' + S + '/><rect x="13" y="37" width="22" height="4" rx="2" fill="#9A5B2E"' + S + '/>' },
    { key: 'lantern', name: 'Lantern', set: 'forge', badge: 'topics', bg: '#2F4858',
      art: '<circle cx="24" cy="25" r="15" fill="#FFD866" opacity=".22"/><path d="M19 11a5 5 0 0 1 10 0" fill="none"' + S + '/>'
        + '<rect x="17" y="16" width="14" height="17" rx="3" fill="#FFE9A6"' + S + '/>'
        + '<path d="M24 18.5c2.2 2.6 3.2 4.6 3.2 6.6a3.2 3.2 0 0 1-6.4 0c0-2 1-4 3.2-6.6z" fill="#FF8A2B"/><path d="M24 23c.9 1 1.3 1.8 1.3 2.6a1.3 1.3 0 0 1-2.6 0c0-.8.4-1.6 1.3-2.6z" fill="#FFF1B8"/>'
        + '<rect x="15" y="11" width="18" height="5" rx="2" fill="#C9862F"' + S + '/><rect x="15" y="33" width="18" height="5" rx="2" fill="#C9862F"' + S + '/>' },
    { key: 'blade', name: 'Blade', set: 'forge', badge: 'sharpened', bg: '#5B8C85',
      art: '<g transform="rotate(40 24 24)"><path d="M24 3l3.2 4.5V29h-6.4V7.5z" fill="#DDE5EC"' + S + '/><path d="M24 7v20" stroke="#FFFFFF" stroke-width="1.4"/>'
        + '<rect x="15" y="29" width="18" height="4" rx="2" fill="#C9862F"' + S + '/><rect x="22" y="33" width="4" height="8" fill="#7A4A22"' + S + '/>'
        + '<circle cx="24" cy="43" r="2.5" fill="#C9862F"' + S + '/></g>'
        + '<path d="' + star4(10, 14, 3) + '" fill="#FFFFFF"/>' },
    { key: 'shield', name: 'Shield', set: 'forge', badge: 'cleared', bg: '#4C6EF5',
      art: '<path d="M24 7l14 5v9c0 9-6 16-14 20-8-4-14-11-14-20v-9z" fill="#E8EEF5"' + S + '/>'
        + '<path d="M24 8v32c-7-4-13-10.5-13-19v-8.3z" fill="#E5484D"/><path d="M24 7l14 5v9c0 9-6 16-14 20-8-4-14-11-14-20v-9z" fill="none"' + S + '/>'
        + '<path d="' + star5(24, 22, 6.5) + '" fill="#FFC93C" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>' },

    { key: 'horseshoe', name: 'Horseshoe', set: 'forge', badge: 'fixed', bg: '#2E8B57',
      art: '<path d="M15 10v13a9 9 0 0 0 18 0V10" fill="none" stroke="' + INK + '" stroke-width="10"/>'
        + '<path d="M15 11v12a9 9 0 0 0 18 0V11" fill="none" stroke="#A9B4BE" stroke-width="6.5"/>'
        + '<path d="M13.5 9.5h3M31.5 9.5h3" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>'
        + [[15, 15], [15, 22], [17.5, 29], [30.5, 29], [33, 22], [33, 15]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1" fill="' + INK + '"/>'; }).join('')
        + '<path d="M17 25a7 7 0 0 0 4 5" fill="none" stroke="#F2F6F9" stroke-width="1.4" stroke-linecap="round"/>'
        + '<path d="' + star4(38, 34, 3) + '" fill="#FFE07A"/>' },

    // ── Subjects: all free ───────────────────────────────────────────────
    { key: 'cell', name: 'Cell', set: 'subject', subjects: ['bio', 'gcse-sep-bio', 'gcse-science'], bg: '#2E7D5B',
      art: '<path d="M24 9c9 0 15 6 15 14 0 9-6 16-15 16S9 33 9 24c0-8 6-15 15-15z" fill="#9BE29B"' + S + '/>'
        + '<circle cx="31" cy="17" r="4.5" fill="#4CAF50" stroke="' + INK + '" stroke-width="1.5"/><ellipse cx="15" cy="31" rx="2.5" ry="1.4" fill="#4CAF50"/>'
        + '<ellipse cx="32" cy="31" rx="1.8" ry="1.2" fill="#4CAF50"/>' + face(21, 24, { eyes: 'wink', mouth: 'tongue', cheeks: '#FF8FA3' }) },
    { key: 'flask', name: 'Flask', set: 'subject', subjects: ['chem', 'gcse-sep-chem', 'gcse-science'], bg: '#3D2C6B',
      art: '<path d="M20 9v9L11 35c-1.5 3 .5 5 3.5 5h19c3 0 5-2 3.5-5L28 18V9z" fill="#E9F5FF"' + S + '/>'
        + '<path d="M15.6 28h16.8l3.8 7.5c1 2-.3 3.5-2.5 3.5H14.3c-2.2 0-3.5-1.5-2.5-3.5z" fill="#B06BFF"/>'
        + '<path d="M20 9v9L11 35c-1.5 3 .5 5 3.5 5h19c3 0 5-2 3.5-5L28 18V9z" fill="none"' + S + '/>'
        + '<rect x="18" y="6.5" width="12" height="3.5" rx="1.75" fill="#E9F5FF"' + S + '/>'
        + '<circle cx="21" cy="24" r="1.3" fill="#B06BFF"/><circle cx="26" cy="21" r="1" fill="#B06BFF"/><circle cx="19" cy="33" r="1.6" fill="#E3C4FF"/>'
        + '<circle cx="27" cy="35" r="1.1" fill="#E3C4FF"/><circle cx="30" cy="31.5" r=".9" fill="#E3C4FF"/>' },
    { key: 'rocket', name: 'Rocket', set: 'subject', subjects: ['phys', 'gcse-sep-phys', 'gcse-science'], bg: '#1F3A5F',
      art: '<circle cx="9" cy="12" r="1" fill="#FFFFFF"/><circle cx="39" cy="17" r="1.2" fill="#FFFFFF"/><circle cx="12" cy="36" r=".9" fill="#FFFFFF"/>'
        + '<path d="M19 34h10l-2 6-3 4-3-4z" fill="#FFB02E"' + S + '/><path d="M16 25l-5 7v4l5-3zM32 25l5 7v4l-5-3z" fill="#E5484D"' + S + '/>'
        + '<path d="M24 5c6 5 8 12 8 20v9H16v-9c0-8 2-15 8-20z" fill="#F1F3F5"' + S + '/><path d="M16.6 27h14.8v3H16.6z" fill="#E5484D"/>'
        + '<circle cx="24" cy="18" r="4.2" fill="#7FD3FF"' + S + '/><path d="M22.2 16.6a2.3 2.3 0 0 1 2.2-1" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>' },
    { key: 'calculator', name: 'Calculator', set: 'subject', subjects: ['maths', 'gcse-maths'], bg: '#F08A5D',
      art: '<rect x="12" y="7" width="24" height="34" rx="4" fill="#3E4A59"' + S + '/><rect x="15" y="10" width="18" height="11" rx="2" fill="#BFF2C9"/>'
        + '<text x="29.5" y="19" text-anchor="end" font-family="Georgia,serif" font-size="10" font-weight="700" fill="#1F5131">π</text>'
        + [24.5, 30, 35.5].map(function (y) { return [15.5, 22, 28.5].map(function (x, i) { return '<rect x="' + x + '" y="' + y + '" width="4" height="3.5" rx="1" fill="' + (i === 2 && y === 35.5 ? '#FF8A3D' : '#F5F5F5') + '"/>'; }).join(''); }).join('') },
    { key: 'globe', name: 'Globe', set: 'subject', subjects: ['geo', 'gcse-geo'], bg: '#1E5A8A',
      art: '<circle cx="24" cy="24" r="15" fill="#5EC2F2"' + S + '/>'
        + '<path d="M13 18c3-2 6-1 7 1s-1 4 1 6-1 5-4 4-5-4-6-6c-1-2 0-3 2-5zM27 11c3 0 7 2 8 5s-2 3-4 2-3 1-5 0-1-4 1-7zM29 30c2-1 5 0 5 2s-2 5-4 5-3-2-3-4 1-2 2-3z" fill="#6CCB5F"/>'
        + '<path d="M9.5 24h29M24 9c-5 4-5 26 0 30" fill="none" stroke="#FFFFFF" stroke-width="1" opacity=".45"/>'
        + '<circle cx="24" cy="24" r="15" fill="none"' + S + '/><path d="M15 14a12 12 0 0 1 6-3.5" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>' },
    { key: 'helmet', name: 'Helmet', set: 'subject', subjects: ['hist', 'gcse-hist'], bg: '#8E3B46',
      art: '<path d="M24 11c2-4 7-6 12-5-3 1-5.5 3-6.5 6" fill="#E5484D"' + S + '/>'
        + '<path d="M12 27c0-9 5-16 12-16s12 7 12 16v10H12z" fill="#AEB8C2"' + S + '/><path d="M24 11v11" stroke="' + INK + '" stroke-width="1.5"/>'
        + '<rect x="15" y="22" width="18" height="5" rx="2.5" fill="' + INK + '"/>'
        + '<g class="fe-eyes"><circle cx="20.5" cy="24.5" r="1.3" fill="#FFFFFF"/><circle cx="27.5" cy="24.5" r="1.3" fill="#FFFFFF"/></g>'
        + '<circle cx="20" cy="32" r="1" fill="' + INK + '"/><circle cx="24" cy="32" r="1" fill="' + INK + '"/><circle cx="28" cy="32" r="1" fill="' + INK + '"/>' },
    { key: 'coin', name: 'Coin', set: 'subject', subjects: ['econ', 'gcse-econ'], bg: '#2F6F4E',
      art: '<ellipse cx="27" cy="27" rx="13" ry="13" fill="#E3A21A"' + S + '/><circle cx="23" cy="23" r="14" fill="#FFC93C"' + S + '/>'
        + '<circle cx="23" cy="23" r="10.5" fill="none" stroke="#E3A21A" stroke-width="1.5"/>'
        + '<text x="23" y="29" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="700" fill="#B7791F">£</text>'
        + '<path d="M14.5 17a10 10 0 0 1 4-4" fill="none" stroke="#FFF1B8" stroke-width="1.6" stroke-linecap="round"/>' },
    { key: 'briefcase', name: 'Briefcase', set: 'subject', subjects: ['bus'], bg: '#5B6CFF',
      art: '<path d="M19 16v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" fill="none" stroke="' + INK + '" stroke-width="2.4"/>'
        + '<rect x="9" y="16" width="30" height="21" rx="4" fill="#A0622D"' + S + '/><path d="M9 23h30" stroke="' + INK + '" stroke-width="1.5"/>'
        + '<path d="M12 19.5h24M12 33.5h24" stroke="#D89A5B" stroke-width="1" stroke-dasharray="1.5 1.5"/>'
        + '<rect x="21" y="20.5" width="6" height="5" rx="1" fill="#FFC93C" stroke="' + INK + '" stroke-width="1.5"/>' },
    { key: 'brain', name: 'Brain', set: 'subject', subjects: ['psych', 'gcse-psych'], bg: '#5E3A87',
      art: '<path d="M24 12c-2-3-7-3-9 0-4 0-6 4-5 7-2 2-2 6 0 8-1 4 2 7 6 7 2 3 6 3 8 1 2 2 6 2 8-1 4 0 7-3 6-7 2-2 2-6 0-8 1-3-1-7-5-7-2-3-7-3-9 0z" fill="#FF9EC1"' + S + '/>'
        + '<path d="M24 12v23M14 19c2 0 3 1 3 3M34 19c-2 0-3 1-3 3M15 28c2-1 4 0 4 2M33 28c-2-1-4 0-4 2M19 15c0 2 1 3 2.5 3M29 15c0 2-1 3-2.5 3" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>' },
    { key: 'chat', name: 'Chat', set: 'subject', subjects: ['soc'], bg: '#E07A5F',
      art: '<path d="M27 20h11a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-1v4l-5-4h-5a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4z" fill="#FFD866"' + S + '/>'
        + '<path d="M10 10h18a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H18l-6 5v-5h-2a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill="#FFFFFF"' + S + '/>'
        + '<circle cx="13" cy="19" r="1.8" fill="' + INK + '"/><circle cx="19" cy="19" r="1.8" fill="' + INK + '"/><circle cx="25" cy="19" r="1.8" fill="' + INK + '"/>' },
    { key: 'book', name: 'Book', set: 'subject', subjects: ['englit', 'engll'], bg: '#F2C14E',
      art: '<rect x="13" y="35" width="23" height="5" rx="1" fill="#FFFFFF"' + S + '/><rect x="12" y="8" width="24" height="30" rx="3" fill="#3D7BD9"' + S + '/>'
        + '<rect x="13" y="9" width="4" height="28" fill="#2C5FAE"/><path d="M29 8v9l2.5-2 2.5 2V8" fill="#E5484D"' + S + '/>'
        + '<rect x="20" y="20" width="12" height="2.4" rx="1.2" fill="#BFD7FF"/><rect x="20" y="25" width="9" height="2.4" rx="1.2" fill="#BFD7FF"/>' },
    { key: 'quill', name: 'Quill', set: 'subject', subjects: ['englit', 'engll'], bg: '#2D4A3E',
      art: '<path d="M38 5c-12 1-20 10-22 26l3 1C21 18 28 10 38 5z" fill="#F5F0E6"' + S + '/><path d="M38 5L19 32" stroke="' + INK + '" stroke-width="1.5"/>'
        + '<path d="M33 9l-3 .5M30 13l-4 .3M27 17.5l-4 0" stroke="#C9C0AE" stroke-width="1.2" stroke-linecap="round"/>'
        + '<rect x="15" y="29" width="10" height="4" fill="#2B3A55"' + S + '/><rect x="11" y="32" width="18" height="10" rx="3" fill="#2B3A55"' + S + '/>'
        + '<rect x="14" y="35.5" width="12" height="3" rx="1" fill="#C9862F"/>' },
    { key: 'croissant', name: 'Croissant', set: 'subject', subjects: ['french'], bg: '#3366CC',
      art: '<path d="M5 31c0-11 8.5-19 19-19s19 8 19 19c-2.5 2.5-6.5 2.5-9 .5-1.5-5.5-5.5-9-10-9s-8.5 3.5-10 9c-2.5 2-6.5 2-9-.5z" fill="#E9A94B"' + S + '/>'
        + '<path d="M16 15.5c1.5 3 2.5 6 2.5 9M32 15.5c-1.5 3-2.5 6-2.5 9M9.5 22c2 1.5 3.5 3.5 4 6.5M38.5 22c-2 1.5-3.5 3.5-4 6.5" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>'
        + '<path d="M20 15c2-.8 5-.8 8 0M11 24c.6-1 1.3-1.8 2-2.4M37 24c-.6-1-1.3-1.8-2-2.4" fill="none" stroke="#FFD99A" stroke-width="1.6" stroke-linecap="round"/>' },
    { key: 'pretzel', name: 'Pretzel', set: 'subject', subjects: ['german'], bg: '#D4A017',
      art: '<path d="M15 35c-7-4-7-15 1-18 6-2 10 4 8 10-1 4-6 8-9 8M33 35c7-4 7-15-1-18-6-2-10 4-8 10 1 4 6 8 9 8" fill="none" stroke="' + INK + '" stroke-width="7.5" stroke-linecap="round"/>'
        + '<path d="M15 35c-7-4-7-15 1-18 6-2 10 4 8 10-1 4-6 8-9 8M33 35c7-4 7-15-1-18-6-2-10 4-8 10 1 4 6 8 9 8" fill="none" stroke="#9C5A1E" stroke-width="4.5" stroke-linecap="round"/>'
        + '<circle cx="13" cy="22" r=".9" fill="#FFFFFF"/><circle cx="34" cy="20" r=".9" fill="#FFFFFF"/><circle cx="18" cy="17" r=".9" fill="#FFFFFF"/><circle cx="37" cy="27" r=".9" fill="#FFFFFF"/>' },
    { key: 'dumpling', name: 'Dumpling', set: 'subject', subjects: ['mand'], bg: '#D9483B',
      art: '<path d="M18 13c-2-2 2-3 0-5M24 11c-2-2 2-3 0-5M30 13c-2-2 2-3 0-5" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>'
        + '<path d="M9 33c0-9 6.5-16 15-16s15 7 15 16c0 3-3 5-6 5H15c-3 0-6-2-6-5z" fill="#FFF4E0"' + S + '/>'
        + '<path d="M20 18.5c1.5 2 6.5 2 8 0M24 17v3.5" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>' + face(24, 27.5, { eyes: 'happy', mouth: 'o', cheeks: '#FF8FA3' }) },
    { key: 'sun', name: 'Sun', set: 'subject', subjects: ['span'], bg: '#F0743E',
      art: [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<path d="M24 6.5v5" transform="rotate(' + a + ' 24 24)" stroke="#FFE07A" stroke-width="3" stroke-linecap="round"/>'; }).join('')
        + '<circle cx="24" cy="24" r="10.5" fill="#FFD23F"' + S + '/>'
        + '<path d="M16 20.5h16M17 20.5h5.5v2.2a2.6 2.6 0 0 1-5.5 0zM25.5 20.5H31v2.2a2.6 2.6 0 0 1-5.5 0z" fill="' + INK + '" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round"/>'
        + '<path d="M18.3 21.6l1.4-.6M26.8 21.6l1.4-.6" stroke="#FFFFFF" stroke-width=".9" stroke-linecap="round"/>'
        + '<path d="M20.5 27.5h7a3.5 3.5 0 0 1-7 0z" fill="' + INK + '"/>' },
    { key: 'robot', name: 'Robot', set: 'subject', subjects: ['cs'], bg: '#2A9D8F',
      art: '<path d="M24 14V9" stroke="' + INK + '" stroke-width="2"/><circle cx="24" cy="7.5" r="2.5" fill="#FF5A5F"' + S + '/>'
        + '<rect x="19" y="33" width="10" height="7" fill="#AEB8C2"' + S + '/><rect x="9" y="20" width="4" height="8" rx="1.5" fill="#AEB8C2"' + S + '/>'
        + '<rect x="35" y="20" width="4" height="8" rx="1.5" fill="#AEB8C2"' + S + '/><rect x="12" y="14" width="24" height="20" rx="5" fill="#D9E2EC"' + S + '/>'
        + '<rect x="15" y="18" width="18" height="10" rx="3" fill="#1B2A3A"/>'
        + '<g class="fe-eyes"><circle cx="20" cy="23" r="2" fill="#5CF2FF"/><circle cx="28" cy="23" r="2" fill="#5CF2FF"/></g>'
        + '<path d="M20 31h1.5M23.2 31h1.5M26.5 31H28" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>' },
    { key: 'ball', name: 'Football', set: 'subject', subjects: ['pe'], bg: '#4CAF50',
      art: '<circle cx="24" cy="24" r="15" fill="#FFFFFF"' + S + '/><path d="M24 18l5.5 4-2 6.5h-7l-2-6.5z" fill="' + INK + '"/>'
        + '<path d="M24 18V9.5M29.5 22l8-3M27.5 28.5l5 7M20.5 28.5l-5 7M18.5 22l-8-3" stroke="' + INK + '" stroke-width="1.5"/>'
        + '<path d="M20 9.8l4-1 4 1-1 2.5h-6zM38 20l.8 4.5-1.6 3.6-2.2-2 .8-5.5zM10 20l-.8 4.5 1.6 3.6 2.2-2-.8-5.5z" fill="' + INK + '"/>' },
    { key: 'scales', name: 'Scales', set: 'subject', subjects: ['law'], bg: '#3B3F58',
      art: '<path d="M12 14L8 26M12 14l4 12M36 14l-4 12M36 14l4 12" stroke="#FFE7A3" stroke-width="1.2"/>'
        + '<rect x="22.5" y="12" width="3" height="25" fill="#C9A14A"' + S + '/><rect x="10" y="12" width="28" height="3" rx="1.5" fill="#C9A14A"' + S + '/>'
        + '<circle cx="24" cy="10" r="2.5" fill="#C9A14A"' + S + '/><rect x="15" y="36" width="18" height="4" rx="2" fill="#C9A14A"' + S + '/>'
        + '<path d="M6 26h12a6 6 0 0 1-12 0zM30 26h12a6 6 0 0 1-12 0z" fill="#FFD866"' + S + '/>' },
    { key: 'ballot', name: 'Ballot box', set: 'subject', subjects: ['pol'], bg: '#7B2CBF',
      art: '<rect x="18" y="7" width="12" height="15" rx="1" fill="#FFFFFF"' + S + '/><path d="M21 14l2 2 4-4.5" fill="none" stroke="#2E9E4F" stroke-width="2" stroke-linecap="round"/>'
        + '<rect x="11" y="22" width="26" height="18" rx="2" fill="#F1F3F5"' + S + '/><rect x="9" y="19" width="30" height="5" rx="1.5" fill="#DDE3EA"' + S + '/>'
        + '<rect x="17" y="20.5" width="14" height="2" rx="1" fill="' + INK + '"/><rect x="16" y="29" width="16" height="5" rx="1.5" fill="#7B2CBF" opacity=".25"/>' },
    { key: 'candle', name: 'Candle', set: 'subject', subjects: ['rs'], bg: '#2E2A4F',
      art: '<circle cx="24" cy="15" r="11" fill="#FFD866" opacity=".2"/><path d="M24 7c3 3 4 6 4 8.5a4 4 0 0 1-8 0C20 13 21 10 24 7z" fill="#FFB02E"' + S + '/>'
        + '<path d="M24 12c1.2 1.4 1.8 2.6 1.8 3.6a1.8 1.8 0 0 1-3.6 0c0-1 .6-2.2 1.8-3.6z" fill="#FFE07A"/>'
        + '<rect x="17.5" y="20" width="13" height="18" rx="2" fill="#F7EDE2"' + S + '/><path d="M27 20v5a1.5 1.5 0 0 0 3 0" fill="#F7EDE2" stroke="' + INK + '" stroke-width="1.5"/>'
        + '<rect x="13" y="37" width="22" height="4" rx="2" fill="#C9862F"' + S + '/>' },
    { key: 'clapper', name: 'Clapperboard', set: 'subject', subjects: ['media'], bg: '#F4A259',
      art: '<rect x="10" y="19" width="28" height="19" rx="2" fill="#2B2D42"' + S + '/>'
        + '<g transform="rotate(-14 10 18)"><rect x="10" y="12" width="28" height="6" rx="1" fill="#F1F3F5"' + S + '/>'
        + '<path d="M15 12.5l3 5h4l-3-5zM24 12.5l3 5h4l-3-5zM33 12.5l3 5h1v-5z" fill="' + INK + '"/></g>'
        + '<path d="M14 25h20M14 30h12M28 30h6" stroke="#9AA3B5" stroke-width="1.6" stroke-linecap="round"/>' },
    { key: 'heart', name: 'Heart', set: 'subject', subjects: ['hsc'], bg: '#7AD3C5',
      art: '<path d="M24 39C14 32 9 26 9 19.5 9 15 12.5 11.5 17 11.5c3 0 5.5 1.6 7 4 1.5-2.4 4-4 7-4 4.5 0 8 3.5 8 8C39 26 34 32 24 39z" fill="#FF5A6E"' + S + '/>'
        + '<path d="M11 23h7l2-4 3 8 2.5-6 1.5 2h10" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M14 17.5c.5-1.5 1.7-2.5 3.2-2.7" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>' },
    { key: 'magnifier', name: 'Magnifier', set: 'subject', subjects: ['crim'], bg: '#F2C14E',
      art: '<path d="M29 29l9 9" stroke="' + INK + '" stroke-width="7.5" stroke-linecap="round"/><path d="M29 29l9 9" stroke="#7A4A22" stroke-width="4.5" stroke-linecap="round"/>'
        + '<circle cx="21" cy="21" r="12" fill="#7A4A22"' + S + '/><circle cx="21" cy="21" r="9" fill="#CFEFFF"/>'
        + '<g class="fe-eyes"><ellipse cx="21" cy="21" rx="3.6" ry="4.6" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.4"/><circle cx="22" cy="21.5" r="2" fill="' + INK + '"/></g>'
        + '<path d="M15 16a7 7 0 0 1 4-2.5" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>' },

    // ── Legendary: animated, unlocked by lifetime XP ─────────────────────
    { key: 'molten', name: 'Molten Anvil', set: 'legendary', xp: 2000 },
    { key: 'crystal', name: 'Star Crystal', set: 'legendary', xp: 4000 },
    { key: 'phoenix', name: 'Phoenix', set: 'legendary', xp: 7500 },
    { key: 'storm', name: 'Storm Hammer', set: 'legendary', xp: 10000 },
    { key: 'dragon', name: 'Forge Dragon', set: 'legendary', xp: 15000 }
  ];

  var BY_KEY = {};
  AVATARS.forEach(function (a) { BY_KEY[a.key] = a; });

  function list() { return AVATARS.slice(); }
  function byKey(key) { return Object.prototype.hasOwnProperty.call(BY_KEY, key) ? BY_KEY[key] : null; }
  // The avatar a badge's Bronze tier unlocks.
  function forBadge(badgeKey) {
    for (var i = 0; i < AVATARS.length; i++) if (AVATARS[i].badge === badgeKey) return AVATARS[i];
    return null;
  }
  // Legendary avatars, lowest XP first.
  function legendary() { return AVATARS.filter(function (a) { return a.set === 'legendary'; }); }
  function badgeName(key) {
    var A = root.ForgeAchievements;
    var b = A && A.BADGES.filter(function (x) { return x.key === key; })[0];
    return b ? b.name : key;
  }

  function get(studentId) {
    if (!studentId) return null;
    try { var key = root.localStorage.getItem(PREFIX + studentId); return byKey(key) ? key : null; } catch (e) { return null; }
  }
  function set(studentId, key) {
    if (!studentId) return false;
    try {
      if (key && byKey(key)) root.localStorage.setItem(PREFIX + studentId, key);
      else root.localStorage.removeItem(PREFIX + studentId);
      return true;
    } catch (e) { return false; }
  }

  // badges: ForgeAchievements.compute() output. xp: lifetime XP.
  function unlocked(key, badges, xp) {
    var a = byKey(key);
    if (!a) return false;
    if (a.xp) return (Number(xp) || 0) >= a.xp;
    if (a.badge) return (badges || []).some(function (b) { return b.key === a.badge && !!b.tier; });
    return true;
  }

  var serial = 0;
  function svg(key) {
    var a = byKey(key);
    if (!a) return '';
    if (a.set === 'legendary') return '<svg viewBox="0 0 100 100" class="fe-legendary">' + LEGENDARY_ART[a.key]('fe' + (++serial) + '-') + '</svg>';
    return '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="' + a.bg + '"/>' + a.art + '</svg>';
  }

  // The student's own avatar, with their chosen character when they have one.
  // Marked so a new choice can redraw every copy on the page in place.
  function ownAvatarHtml(studentId, name, xp, opts) {
    return R().avatarHtml(name, xp, Object.assign({}, opts, { emblem: svg(get(studentId)), own: true }));
  }
  function ownLadderHtml(studentId, name, xp) {
    return R().ladderHtml(name, xp, { emblem: svg(get(studentId)), own: true });
  }

  function xpText(n) { return Number(n).toLocaleString('en-GB') + ' XP'; }
  function optionHtml(o, chosen, name, xp) {
    var current = (o.key || null) === chosen;
    var lock = o.xp ? xpText(o.xp - (Number(xp) || 0)) + ' to go' : 'Bronze: ' + badgeName(o.badge);
    var hint = !o.open ? lock : current ? 'In use' : o.xp ? xpText(o.xp) : '';
    var label = o.name + (o.open ? '' : o.xp ? ', locked until ' + xpText(o.xp) : ', locked until you earn Bronze in ' + badgeName(o.badge));
    return '<li><button type="button" class="forge-emblems__option' + (current ? ' is-current' : '') + (o.open ? '' : ' is-locked') + (o.xp ? ' is-legendary' : '') + '"'
      + ' data-forge-emblem="' + esc(o.key) + '" aria-pressed="' + (current ? 'true' : 'false') + '"' + (o.open ? '' : ' disabled')
      + ' aria-label="' + esc(label) + '">'
      + R().avatarHtml(name, xp, { emblem: o.key ? svg(o.key) : '', locked: !o.open })
      + '<span class="forge-emblems__name">' + esc(o.name) + '</span><small>' + esc(hint) + '</small></button></li>';
  }

  // A collapsed row showing the current avatar; opening it shows the choices.
  // opts.subject: the student's subject key, whose avatars are listed first.
  function pickerHtml(studentId, name, xp, badges, opts) {
    opts = opts || {};
    var chosen = get(studentId);
    var option = function (a) { return { key: a.key, name: a.name, badge: a.badge, xp: a.xp, open: unlocked(a.key, badges, xp) }; };
    var mine = opts.subject ? AVATARS.filter(function (a) { return a.subjects && a.subjects.indexOf(opts.subject) !== -1; }) : [];
    var legend = legendary().map(option);
    var owned = legend.filter(function (o) { return o.open; }).length;
    var groups = [
      { title: 'Legendary', note: 'Animated, and earned with lifetime XP' + (owned ? ': ' + owned + ' of ' + legend.length + ' unlocked.' : '.'), items: legend },
      { title: 'Forge', note: 'Earn Bronze in an achievement to unlock its smith’s tool.',
        items: [{ key: '', name: 'Initials', open: true }].concat(AVATARS.filter(function (a) { return a.set === 'forge'; }).map(option)) },
      { title: mine.length ? 'Your subject' : null, items: mine.map(option) },
      { title: mine.length ? 'More subjects' : 'Subjects', items: AVATARS.filter(function (a) { return a.set === 'subject' && mine.indexOf(a) === -1; }).map(option) }
    ].filter(function (g) { return g.items.length; });
    var current = byKey(chosen);
    var h = '<details class="card forge-emblems">'
      + '<summary class="forge-emblems__summary">' + ownAvatarHtml(studentId, name, xp, { size: 'md' })
      + '<span class="forge-emblems__head"><span class="forge-emblems__title">Your avatar</span>'
      + '<span class="forge-emblems__current" data-forge-avatar-name>' + esc(current ? current.name : 'Initials') + '</span></span>'
      + '<span class="forge-emblems__toggle" aria-hidden="true">Change<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span></summary>'
      + '<div class="forge-emblems__body"><p class="forge-emblems__intro">Pick a character to show in your frame. Only you see it: friends and your league see your initials.</p>';
    groups.forEach(function (g) {
      h += '<h3 class="forge-emblems__group">' + esc(g.title) + '</h3>' + (g.note ? '<p class="forge-emblems__note">' + esc(g.note) + '</p>' : '')
        + '<ul class="forge-emblems__grid">' + g.items.map(function (o) { return optionHtml(o, chosen, name, xp); }).join('') + '</ul>';
    });
    return h + '</div></details>';
  }

  // Redraw every own avatar on the page after a new choice, without
  // re-rendering the page around it.
  function refresh(studentId, name, picked) {
    if (!root.document) return;
    var key = get(studentId), a = byKey(key);
    root.document.querySelectorAll('.forge-avatar[data-forge-own]').forEach(function (el) {
      var mark = svg(key);
      el.innerHTML = mark ? '<span class="forge-avatar__emblem">' + mark + '</span>' : '<span class="forge-avatar__initials">' + esc(R().initials(name)) + '</span>';
      el.classList.remove('is-popping'); void el.offsetWidth; el.classList.add('is-popping');
    });
    root.document.querySelectorAll('[data-forge-avatar-name]').forEach(function (el) { el.textContent = a ? a.name : 'Initials'; });
    root.document.querySelectorAll('[data-forge-emblem]').forEach(function (btn) {
      var current = (btn.getAttribute('data-forge-emblem') || null) === key;
      btn.classList.toggle('is-current', current);
      btn.setAttribute('aria-pressed', current ? 'true' : 'false');
      var hint = btn.querySelector('small'), own = byKey(btn.getAttribute('data-forge-emblem'));
      if (hint && !btn.disabled) hint.textContent = current ? 'In use' : own && own.xp ? xpText(own.xp) : '';
      if (btn === picked) { btn.classList.remove('is-popping'); void btn.offsetWidth; btn.classList.add('is-popping'); }
    });
  }

  // Pages call this once with how to find the current student.
  function bind(getStudent) {
    if (!root.document || bind.done) return;
    bind.done = true;
    root.document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-forge-emblem]');
      if (!btn || btn.disabled) return;
      var st = getStudent() || {};
      if (!st.studentId) return;
      set(st.studentId, btn.getAttribute('data-forge-emblem') || null);
      refresh(st.studentId, st.name, btn);
    });
  }

  root.ForgeEmblems = {
    list: list, byKey: byKey, forBadge: forBadge, legendary: legendary, get: get, set: set, unlocked: unlocked, svg: svg,
    ownAvatarHtml: ownAvatarHtml, ownLadderHtml: ownLadderHtml, pickerHtml: pickerHtml, refresh: refresh, bind: bind
  };
}(typeof window !== 'undefined' ? window : globalThis));
