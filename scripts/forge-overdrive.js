/* Small, progressive enhancement for Forge's high-intent surfaces. */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var frame = 0;

  function enhance(node) {
    if (!node || node.dataset.overdriveReady) return;
    node.dataset.overdriveReady = 'true';
    node.classList.add('forge-overdrive-target');
    node.classList.add('forge-tactile');
    if (reduced || !finePointer) return;
    node.addEventListener('pointermove', function (event) {
      var rect = node.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * 100;
      var y = ((event.clientY - rect.top) / rect.height) * 100;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        node.style.setProperty('--pointer-x', Math.max(0, Math.min(100, x)) + '%');
        node.style.setProperty('--pointer-y', Math.max(0, Math.min(100, y)) + '%');
      });
    }, {passive: true});
    node.addEventListener('pointerleave', function () {
      node.style.removeProperty('--pointer-x');
      node.style.removeProperty('--pointer-y');
    }, {passive: true});
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    var targets = '.auth-card,.price-card,.stat-card,.mech,.insight-stat,.insight-list,.pick-btn,.stage,.scaffold-big,.opt-big,.faq-hero,.guide-hero,.faq-item,.item,.callout,.rm-hero,.rm-bucket,.rm-item,.rm-cta,.prof-header,.prof-tabs,.profile-card,.rank-display,.grade-card,.anvil-card,.anvil-stat,.opt,.scaffold-box,.praise-box,.cleared-banner';
    if (root.matches && root.matches(targets)) enhance(root);
    root.querySelectorAll(targets).forEach(enhance);
  }

  function initGuideProgress() {
    if (!document.querySelector('.faq-layout,.layout,.rm-bucket')) return;
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var progress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      document.documentElement.style.setProperty('--guide-progress', progress);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, {passive: true});
    update();
  }

  function init() {
    scan(document);
    var app = document.getElementById('app');
    if (app) new MutationObserver(function (records) {
      records.forEach(function (record) { record.addedNodes.forEach(scan); });
    }).observe(app, {childList: true, subtree: true});
    initGuideProgress();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Landing-page overdrive collection. Each query-string variant keeps the same
   product truth and content, then authors one focused browser-native moment:
   a living learning trace, a product showcase, a reactive ember field, or a
   composed showcase that combines the latter two. */
(function () {
  var variant = document.documentElement.dataset.overdriveVariant;
  if (variant !== 'ember' && variant !== 'sequence' && variant !== 'instrument' && variant !== 'fusion') return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  function initEmberTheatre() {
    var atmosphere = document.createElement('div');
    atmosphere.className = 'forge-ember-atmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');
    atmosphere.innerHTML = '<i></i><i></i><i></i>';
    document.body.insertBefore(atmosphere, document.body.firstChild);

    var frame = 0;
    var pointerX = 72;
    var pointerY = 44;
    var scrollProgress = 0;

    function paint() {
      frame = 0;
      document.body.style.setProperty('--ember-x', pointerX + '%');
      document.body.style.setProperty('--ember-y', pointerY + '%');
      document.body.style.setProperty('--ember-scroll', scrollProgress);
    }

    function schedulePaint() {
      if (!frame) frame = window.requestAnimationFrame(paint);
    }

    if (!reduced && finePointer) {
      document.addEventListener('pointermove', function (event) {
        pointerX = Math.max(0, Math.min(100, (event.clientX / window.innerWidth) * 100));
        pointerY = Math.max(0, Math.min(100, (event.clientY / window.innerHeight) * 100));
        schedulePaint();
      }, {passive: true});
    }

    window.addEventListener('scroll', function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      schedulePaint();
    }, {passive: true});

    if ('IntersectionObserver' in window) {
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('is-ember-active', entry.isIntersecting);
        });
      }, {rootMargin: '-18% 0px -46% 0px', threshold: 0});
      document.querySelectorAll('main > section').forEach(function (section) {
        sectionObserver.observe(section);
      });
    }

    paint();
  }

  function initLivingSequence() {
    var meter = document.createElement('div');
    meter.className = 'forge-sequence-meter';
    meter.setAttribute('aria-hidden', 'true');
    meter.innerHTML = '' +
      '<span class="forge-sequence-meter__label">Learning trace</span>' +
      '<strong class="forge-sequence-meter__stage">Trigger</strong>' +
      '<span class="forge-sequence-meter__copy">A misconception becomes visible.</span>' +
      '<span class="forge-sequence-meter__rail"><i></i></span>';
    document.body.appendChild(meter);

    var stageNode = meter.querySelector('.forge-sequence-meter__stage');
    var copyNode = meter.querySelector('.forge-sequence-meter__copy');
    var stages = [
      {node: document.querySelector('.hero-shell'), name: 'Trigger', copy: 'A misconception becomes visible.'},
      {node: document.getElementById('how'), name: 'Repair', copy: 'The missing idea is corrected.'},
      {node: document.querySelector('#how + section'), name: 'Re-forge', copy: 'The fix is proved in a new frame.'},
      {node: document.getElementById('audit-subject-picker'), name: 'Map', copy: 'Practice meets the exam specification.'},
      {node: document.getElementById('students'), name: 'Student signal', copy: 'The next useful action stays visible.'},
      {node: document.getElementById('teachers'), name: 'Teacher action', copy: 'A pattern becomes the next lesson.'},
      {node: document.getElementById('waitlist'), name: 'Start', copy: 'Take Forge into real practice.'}
    ].filter(function (stage) { return stage.node; });

    function setStage(index) {
      var stage = stages[index];
      if (!stage) return;
      document.body.dataset.sequenceStage = String(index);
      stageNode.textContent = stage.name;
      copyNode.textContent = stage.copy;
    }

    if ('IntersectionObserver' in window) {
      var stageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var index = stages.findIndex(function (stage) { return stage.node === entry.target; });
          setStage(index);
        });
      }, {rootMargin: '-34% 0px -52% 0px', threshold: 0});
      stages.forEach(function (stage) { stageObserver.observe(stage.node); });

      var loopObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('is-sequence-active', entry.isIntersecting);
        });
      }, {rootMargin: '-25% 0px -48% 0px', threshold: 0});
      document.querySelectorAll('#how .loop .step').forEach(function (step) {
        loopObserver.observe(step);
      });
    }

    var frame = 0;
    function updateProgress() {
      frame = 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var progress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      document.body.style.setProperty('--sequence-progress', progress);
      meter.classList.toggle('is-visible', window.scrollY > Math.min(320, window.innerHeight * 0.32));
    }
    window.addEventListener('scroll', function () {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    }, {passive: true});
    setStage(0);
    updateProgress();
  }

  function initPrecisionShowcase() {
    var previews = document.querySelectorAll('#students .audit-app-preview, #teachers .audit-app-preview');
    previews.forEach(function (preview, index) {
      preview.style.setProperty('--showcase-index', index);
    });

    if ('IntersectionObserver' in window) {
      var previewObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('is-showcase-active', entry.isIntersecting);
        });
      }, {rootMargin: '-12% 0px -18% 0px', threshold: 0.18});
      previews.forEach(function (preview) { previewObserver.observe(preview); });
    } else {
      previews.forEach(function (preview) { preview.classList.add('is-showcase-active'); });
    }
  }

  function init() {
    document.body.classList.add('forge-overdrive-ready');
    if (variant === 'ember' || variant === 'fusion') initEmberTheatre();
    if (variant === 'sequence') initLivingSequence();
    if (variant === 'instrument' || variant === 'fusion') initPrecisionShowcase();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
