(function () {
  var picker = document.getElementById('video-subject');
  if (!picker) return;
  // Subject pages are generated as videos-<slug>.html by scripts/build/build-video-pages.js.
  var subjectPage = /^videos-[a-z0-9-]+\.html$/;
  var currentPage = window.location.pathname.split('/').pop();
  var currentValue = subjectPage.test(currentPage) ? currentPage : '';
  function syncSelection() { picker.value = currentValue; }
  syncSelection();
  window.addEventListener('pageshow', syncSelection);
  picker.addEventListener('change', function () {
    var page = picker.value;
    if (subjectPage.test(page)) {
      window.location.assign(page);
    }
  });
})();

/* In-page player. A link with data-video plays in a dialog through
   youtube-nocookie.com, which sets no YouTube cookies until the video plays
   and is often allowed by school filters that block youtube.com itself. The
   link's own href still goes to YouTube, for a modified click, a page without
   scripts, and the "Open on YouTube" fallback in the dialog.

   Videos opened are remembered on this device only, as a convenience: no
   one else sees them and nothing is sent anywhere. */
(function () {
  var list = document.querySelector('.videos-list');
  if (!list) return;
  var WATCHED = 'forge-videos-watched';
  var ID = /^[A-Za-z0-9_-]{11}$/;

  function watched() {
    try { return JSON.parse(localStorage.getItem(WATCHED) || '{}') || {}; } catch (e) { return {}; }
  }
  function markWatched(id) {
    var all = watched();
    if (all[id]) return;
    all[id] = 1;
    try { localStorage.setItem(WATCHED, JSON.stringify(all)); } catch (e) {}
  }
  function idOf(link) {
    var id = link.getAttribute('data-video') || (/[?&]v=([A-Za-z0-9_-]{11})/.exec(link.href) || [])[1];
    return ID.test(id || '') ? id : null;
  }
  function showWatched(link) {
    link.classList.add('is-watched');
    var action = link.querySelector('.videos-open');
    if (action && link.hasAttribute('data-video')) action.textContent = 'Watch again';
  }
  var seen = watched();
  document.querySelectorAll('.videos-list a').forEach(function (link) {
    var id = idOf(link);
    if (id && seen[id]) showWatched(link);
  });

  var dialog = null, frame = null, heading = null, external = null, opener = null;
  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'video-player';
    dialog.setAttribute('aria-labelledby', 'video-player-title');
    dialog.innerHTML = '<div class="video-player__head"><h2 id="video-player-title"></h2>'
      + '<button type="button" class="video-player__close" aria-label="Close video">'
      + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
      + '<div class="video-player__frame"></div>'
      + '<p class="video-player__foot">Not loading? Your school may block video here. '
      + '<a target="_blank" rel="noopener noreferrer">Open on YouTube</a></p>';
    document.body.appendChild(dialog);
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

  function play(link, id) {
    if (!dialog) build();
    opener = link;
    var title = (link.querySelector('strong') || link).textContent;
    heading.textContent = title;
    external.href = 'https://www.youtube.com/watch?v=' + id;
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
    iframe.title = title;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    // YouTube refuses to play an embed that sends no referrer.
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.innerHTML = '';
    frame.appendChild(iframe);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('.videos-list a');
    if (!link) return;
    var id = idOf(link);
    if (!id) return;
    markWatched(id);
    showWatched(link);
    // Let a new-tab click, and a video that cannot be embedded, go to YouTube.
    if (!link.hasAttribute('data-video') || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    play(link, id);
  });
})();
