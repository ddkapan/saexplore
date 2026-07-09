/* Headless render + interaction tests for the SA Species Explorer.
 * Run:  npm i jsdom   (once)   then:   node tests/render-test.js
 * Loads data.js + app.js into jsdom, boots the app, and asserts that
 * every control renders and the key interactions behave. Exits non-zero on failure.
 */
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
let failures = 0;
function ok(name, cond, detail) {
  const status = cond ? 'PASS' : 'FAIL';
  if (!cond) failures++;
  console.log(`${status}  ${name}${detail ? '  (' + detail + ')' : ''}`);
}

const dom = new JSDOM(
  '<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>',
  { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://localhost/saexplore/' }
);
const ctx = dom.getInternalVMContext();

let bootErr = null;
try {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'), ctx);
} catch (e) { bootErr = e.message; }

const w = dom.window, d = w.document;
const rows = () => [].slice.call(d.querySelectorAll('#content tbody tr[data-i]'));
const visible = () => rows().filter(r => !r.classList.contains('hid'));

ok('app boots without error', !bootErr, bootErr || '');
ok('renders all organisms', rows().length > 2000, rows().length + ' rows');
ok('season control present', !!d.getElementById('tripwin') && d.querySelectorAll('.mo').length === 12);
ok('taxon chips present', d.querySelectorAll('.chip.tax').length === 10);
ok('venn row-labels clickable', d.querySelectorAll('.rowh.gsel').length === 10);
ok('tour buttons present', !!d.getElementById('playS') && !!d.getElementById('prevS') && !!d.getElementById('nextS'));
ok('map markers render', d.querySelectorAll('.mkr').length === 10);
ok('status line renders', /organisms/.test((d.getElementById('statusline') || {}).textContent || ''));
ok('Fish taxon populated (not greyed)', !d.querySelector('.chip.tax[data-g="Actinopterygii"]').classList.contains('empty'));

// Taxon filter: none -> 0, Plants-only -> all Plantae
d.querySelector('.taxNone').click();
ok('taxon NONE hides all', visible().length === 0, visible().length + ' visible');
d.querySelector('.chip.tax[data-g="Plantae"]').click();
const pv = visible();
ok('Plants-only shows only Plantae', pv.length > 0 && pv.every(r => r.getAttribute('data-g') === 'Plantae'), pv.length + ' rows');

// Row-label <-> chip sync
d.querySelector('.rowh.gsel[data-g="Aves"]').click();
ok('row-label toggles chip', d.querySelector('.chip.tax[data-g="Aves"]').classList.contains('on'));

// Compress absent rows
d.querySelector('.taxAll').click();
ok('absent rows compressed (hidden)', d.querySelectorAll('#content tbody tr.hid').length > 0);
d.querySelector('.cmpT').click();
ok('compress toggle reveals rows', d.querySelectorAll('#content tbody tr.hid').length === 0);

// Tour focus collapses to one site column
d.getElementById('nextS').click();
const cols = [].slice.call(d.querySelectorAll('#content thead th.scol')).filter(e => e.style.display !== 'none').length;
ok('tour focuses one site column', cols === 1, cols + ' columns');

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
