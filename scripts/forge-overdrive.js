/* Small, progressive enhancement for Forge's high-intent surfaces. */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var frame = 0;

  function enhance(node) {
    if (!node || node.dataset.overdriveReady) return;
    node.dataset.overdriveReady = 'true';
    node.classList.add('forge-overdrive-target');
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
    if (root.matches && root.matches('.auth-card,.price-card')) enhance(root);
    root.querySelectorAll('.auth-card,.price-card').forEach(enhance);
  }

  document.addEventListener('DOMContentLoaded', function () {
    scan(document);
    var app = document.getElementById('app');
    if (app) new MutationObserver(function (records) {
      records.forEach(function (record) { record.addedNodes.forEach(scan); });
    }).observe(app, {childList: true, subtree: true});
  });
})();
