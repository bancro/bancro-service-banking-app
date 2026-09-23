#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const failures = [];
const notes = [];
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex');
const requireText = (file, needles) => {
  const t = read(file);
  needles.forEach(n => { if (!t.includes(n)) failures.push(`${file}: missing ${n}`); });
};

// Exact user-supplied Dore references retained in the source tree.
const doreHashes = {
  'src/assets/dore/reference/dore.light.bluenavy.min.css': '8529fbe8c22b234e56a0fd2f30e95fe176e10b58157e19f439225446ca072195',
  'src/assets/dore/reference/main.css': 'fef1107861ab09f49ab238828d376289140f894a991436f7091f698dd3f0e2a8'
};
Object.entries(doreHashes).forEach(([file, expected]) => {
  if (!fs.existsSync(path.join(root, file))) failures.push(`${file}: missing Dore reference asset`);
  else if (sha(file) !== expected) failures.push(`${file}: reference asset differs from supplied Dore source`);
});

// Login/pre-auth source is deliberately preserved from MVP12.8.
const manifest = read('docs/MVP12_9_LOGIN_PRESERVATION_SHA256.txt').trim().split(/\r?\n/);
manifest.forEach(line => {
  const m = line.match(/^([a-f0-9]{64})\s+(.+)$/);
  if (!m) return;
  const [, expected, file] = m;
  if (!fs.existsSync(path.join(root, file))) failures.push(`${file}: login preservation file missing`);
  else if (sha(file) !== expected) failures.push(`${file}: changed from preserved MVP12.8 login baseline`);
});

requireText('src/main.scss', ['@import "assets/styles/dore-bancro";']);
requireText('src/app/core/shell/shell.component.ts', [
  "'bancro-dore-authenticated'",
  'OverlayContainer',
  "removeClass(this.document.body, 'bancro-dore-authenticated')"
]);
requireText('src/app/core/shell/shell.component.html', [
  'dore-authenticated-shell',
  'dore-shell-body',
  'mifosx-sidenav',
  'mifosx-toolbar'
]);
requireText('src/app/core/shell/sidenav/sidenav.component.html', [
  'dore-main-menu',
  'dore-sub-menu',
  'Customer Banking',
  'Teller Workstation',
  'Transfers & NIBSS',
  'Cards',
  'POS & Merchants',
  'Approvals & Controls',
  'Integrations',
  'Users & Roles',
  'Sign out'
]);
requireText('src/assets/styles/_dore-bancro.scss', [
  '#00365a',
  '--dore-bg: #f8f8f8',
  'router-outlet + *',
  '.list-grid',
  '.mat-card',
  '.mat-form-field',
  '.mat-table',
  '.mat-tab-label',
  '.mat-paginator',
  '.mat-step-header',
  '.mat-expansion-panel',
  '.mat-dialog-container',
  '.mat-menu-panel',
  '.mat-select-panel',
  '.mat-datepicker-content',
  '.mat-snack-bar-container'
]);

// Basic SCSS brace balance catches accidental truncation before CI compiles Sass.
const scss = read('src/assets/styles/_dore-bancro.scss');
let balance = 0;
for (const ch of scss.replace(/\/\*[\s\S]*?\*\//g, '')) {
  if (ch === '{') balance++;
  if (ch === '}') balance--;
  if (balance < 0) break;
}
if (balance !== 0) failures.push(`_dore-bancro.scss: brace balance ${balance}`);

// Inventory: every authenticated feature view inherits Dore from ShellComponent,
// so report the complete component surface for traceability.
function walk(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(p));
    else out.push(p);
  }
  return out;
}
const htmlFiles = walk(path.join(root, 'src/app')).filter(p => p.endsWith('.component.html'));
const authenticatedViews = htmlFiles.filter(p => !p.includes(`${path.sep}login${path.sep}`));
if (authenticatedViews.length < 600) failures.push(`Unexpected authenticated view count: ${authenticatedViews.length}`);
notes.push(`${authenticatedViews.length} authenticated component views inherit the Dore shell/conformance layer.`);
notes.push(`${manifest.length} login/pre-auth source files match the preserved MVP12.8 baseline.`);
notes.push(`Supplied Dore reference CSS hashes are unchanged.`);

if (failures.length) {
  console.error('Bancro Dore UI conformance: FAILED');
  failures.forEach(f => console.error(` - ${f}`));
  process.exit(1);
}
console.log('Bancro Dore UI conformance: PASS');
notes.forEach(n => console.log(` - ${n}`));
