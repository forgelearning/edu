/* Build the Capacitor web bundle without changing the public static website. */
var fs = require('fs');
var path = require('path');

var root = path.resolve(__dirname, '..');
var out = path.join(root, 'mobile-web');
var excluded = new Set(['.git', 'node_modules', 'ios', 'android', 'mobile-web']);

function copyTree(source, target) {
  var entries = fs.readdirSync(source, { withFileTypes: true });
  entries.forEach(function (entry) {
    if (excluded.has(entry.name)) return;
    var from = path.join(source, entry.name);
    var to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyTree(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  });
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
copyTree(root, out);
fs.copyFileSync(path.join(root, 'role-select.html'), path.join(out, 'index.html'));
// The static app has no bundler, so expose the Capacitor Local Notifications
// UMD bundle to the native WebView on demand.
fs.copyFileSync(
  path.join(root, 'node_modules/@capacitor/local-notifications/dist/plugin.js'),
  path.join(out, 'scripts/forge-capacitor-local-notifications.js')
);
console.log('Built Capacitor web bundle at mobile-web/');
