const fs = require('fs');
const path = require('path');

// Replace relaxed dev CSP with stricter production CSP in built index.html
// Run after webpack production build.
const file = path.join(__dirname, '..', 'dist', 'renderer', 'index.html');
if (!fs.existsSync(file)) {
  console.warn('[inject-prod-csp] index.html not found, skipping');
  process.exit(0);
}
let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; img-src \'self\' data:; style-src \'self\' \'unsafe-inline\'; script-src \'self\'; connect-src \'self\'; font-src \'self\'; object-src \'none\'; base-uri \'self\'; form-action \'self\';">');
fs.writeFileSync(file, html, 'utf8');
console.log('[inject-prod-csp] Applied production CSP');
