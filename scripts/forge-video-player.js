/* In-page video player, shared by the Videos pages and the video offered
   after a wrong answer (scripts/forge-video-match.js).

   A link with data-video plays in a dialog through youtube-nocookie.com,
   which sets no YouTube cookies until the video plays and is often allowed by
   school filters that block youtube.com itself. The link's own href still
   goes to YouTube, for a modified click, a page without scripts, and the
   "Open on YouTube" fallback in the dialog. A link without data-video (the
   owner has disabled embedding) simply opens YouTube.

   Videos opened are remembered on this device only, as a convenience: no one
   else sees them and nothing is sent anywhere. */
(function (root) {
  'use strict';
  var doc = root.document;
  var WATCHED = 'forge-videos-watched';
  var ID = /^[A-Za-z0-9_-]{11}$/;
  // Links the player handles: the library lists and the after-a-mistake card.
  var LINKS = '.videos-list a, .forge-video-help__link';

  function all() {
    try { return JSON.parse(root.localStorage.getItem(WATCHED) || '{}') || {}; } catch (e) { return {}; }
  }
  function watched(id) { return !!all()[id]; }
  function markWatched(id) {
    var list = all();
    if (list[id]) return;
    list[id] = 1;
    try { root.localStorage.setItem(WATCHED, JSON.stringify(list)); } catch (e) {}
  }
  function idOf(link) {
    var id = link.getAttribute('data-video') || (/[?&]v=([A-Za-z0-9_-]{11})/.exec(link.href) || [])[1];
    return ID.test(id || '') ? id : null;
  }

  var dialog = null, frame = null, heading = null, external = null, opener = null;
  function build() {
    dialog = doc.createElement('dialog');
    dialog.className = 'video-player';
    dialog.setAttribute('aria-labelledby', 'video-player-title');
    dialog.innerHTML = '<div class="video-player__head"><h2 id="video-player-title"></h2>'
      + '<button type="button" class="video-player__close" aria-label="Close video">'
      + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
      + '<div class="video-player__frame"></div>'
      + '<p class="video-player__foot">Not loading? Your school may block video here. '
      + '<a target="_blank" rel="noopener noreferrer">Open on YouTube</a></p>';
    doc.body.appendChild(dialog);
    frame = dialog.querySelector('.video-player__frame');
    heading = dialog.querySelector('h2');
    external = dialog.querySelector('.video-player__foot a');
    dialog.addEventListener('click', function (e) {
      // A click on the backdrop lands on the dialog itself.
      if (e.target === dialog || e.target.closest('.video-player__close')) dialog.close();
    });
    dialog.addEventListener('close', function () {
      // Removing the iframe stops playback.
      frame.innerHTML = '';
      if (opener && opener.focus) try { opener.focus(); } catch (e) {}
    });
  }

  function open(id, title, from) {
    if (!ID.test(id || '')) return;
    if (!dialog) build();
    opener = from || doc.activeElement;
    heading.textContent = title || 'Video';
    external.href = 'https://www.youtube.com/watch?v=' + id;
    var iframe = doc.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
    iframe.title = title || 'Video';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    // YouTube refuses to play an embed that sends no referrer.
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.innerHTML = '';
    frame.appendChild(iframe);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  if (doc) doc.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest(LINKS);
    if (!link) return;
    var id = idOf(link);
    if (!id) return;
    markWatched(id);
    link.dispatchEvent(new CustomEvent('forge-video-watched', { bubbles: true, detail: { id: id } }));
    // Let a new-tab click, and a video that cannot be embedded, go to YouTube.
    if (!link.hasAttribute('data-video') || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open(id, (link.querySelector('strong') || link).textContent, link);
  });

  root.ForgeVideoPlayer = { open: open, watched: watched, markWatched: markWatched, idOf: idOf };
}(window));
