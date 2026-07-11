/* Headless render + interaction tests for the SA Species Explorer (funnel redesign).
 * Run:  npm i jsdom   (once)   then:   node tests/render-test.js
 * Loads data.js + app.js into jsdom, boots the app, and asserts the funnel
 * structure, filters, region cascade, seen-tracking, the observer notebook
 * round-trip, and the Grinnell export. Exits non-zero on failure.
 */
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
let failures = 0;
function ok(name, cond, detail) {
  if (!cond) failures++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
}

// shared localStorage so we can test persistence across two boots
const store = {};
function makeDom() {
  const dom = new JSDOM(
    '<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>',
    { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://localhost/saexplore/' }
  );
  Object.defineProperty(dom.window, 'localStorage', {
    value: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    configurable: true
  });
  return dom;
}
function boot(dom) {
  const ctx = dom.getInternalVMContext();
  let err = null;
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'), ctx);
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'), ctx);
  } catch (e) { err = e.message; }
  return { d: dom.window.document, w: dom.window, err };
}

// ---- boot 1 ----
let { d, w, err } = boot(makeDom());
const rows = () => [].slice.call(d.querySelectorAll('#matrix tbody tr.org'));
const visible = () => rows().filter(r => !r.classList.contains('hid'));

ok('app boots without error', !err && !/BOOT:/.test(d.getElementById('app').innerHTML), err || '');
ok('renders all organisms', rows().length > 2000, rows().length + ' rows');

// funnel: 8 disclosure sections in order 01..08
const secs = [].slice.call(d.querySelectorAll('.fh')).map(h => h.dataset.sec);
ok('eight funnel disclosures 1..8', secs.join(',') === '1,2,3,4,5,6,7,8', secs.join(','));
ok('every section has a ▾/▸ triangle', d.querySelectorAll('.fh .tri').length === 8);

// at-hand strip carries taxa + search + site + season
ok('strip has taxa chips', d.querySelectorAll('#stripTaxa .chip.tax').length === 10);
ok('strip has search box', !!d.querySelector('.strip #q'));
ok('strip has site chips', d.querySelectorAll('#stripSites .chip.site').length === 10);
ok('strip has ★ late Jul + count', d.querySelectorAll('.strip .tripBtn').length === 1 && !!d.getElementById('count'));

// shared map + tour + matrix columns
ok('map markers render (10)', d.querySelectorAll('.mkr').length === 10, d.querySelectorAll('.mkr').length + '');
ok('tour buttons present', !!d.getElementById('tPlay') && !!d.getElementById('tPrev') && !!d.getElementById('tNext'));
ok('matrix has a site column per site', d.querySelectorAll('#matrix thead .colh').length === 10);
ok('status line renders', /organisms/.test((d.getElementById('status') || {}).textContent || ''));

// taxa filter: none -> 0, then Plants-only -> all Plantae
d.getElementById('taxNone').click();
ok('taxa NONE hides all', visible().length === 0, visible().length + ' visible');
d.querySelector('#taxaChips .chip.tax[data-g="Plantae"]').click();
const pv = visible();
ok('Plants-only shows only Plantae', pv.length > 0 && pv.every(r => r.getAttribute('data-g') === 'Plantae'), pv.length + ' rows');
d.getElementById('taxAll').click();

// region cascade: Lowveld selects the 5 Lowveld/Kruger site columns (fixes #54)
d.querySelector('.segbtn[data-region="lowveld"]').click();
const lowCols = [].slice.call(d.querySelectorAll('#matrix thead .colh')).filter(th => th.style.display !== 'none').length;
ok('Lowveld region shows 5 site columns', lowCols === 5, lowCols + ' columns');
d.querySelector('.segbtn[data-region="all"]').click();

// focus a site -> one column highlighted, others dimmed
d.querySelector('#matrix thead .colh').click();
const focused = d.querySelector('.chip.site');
ok('focusing a site sets a focused chip', [].slice.call(d.querySelectorAll('.chip.site')).some(c => c.style.background && /181, ?98, ?60|b5623c/i.test(c.style.background) || c.style.borderColor));
d.querySelector('#matrix thead .colh').click(); // restore

// seen tracking: tick a cell -> seen tally shows, row floats under the seen header
d.querySelector('#matrix .cell').click();
if (w.__sortRows) w.__sortRows(); // flush the deferred (setTimeout) re-sort synchronously
ok('ticking a cell records a sighting', w.__sa.seen.size === 1, w.__sa.seen.size + '');
ok('seen tally chip visible', d.getElementById('seenTally').style.display !== 'none');
ok('seen-header row inserted', !!d.getElementById('seenHdr'));

// drawer opens with evidence band + notes + iNat-obs slot
d.querySelector('#matrix tr.org').click();
ok('drawer opens', d.getElementById('drawer').classList.contains('open'));
ok('drawer has seen-chips', d.querySelectorAll('#drawer .ckchip').length === 10);
ok('drawer has notes + iNat slot', !!d.querySelector('#drawer .noteta') && !!d.querySelector('#drawer .inatobs'));

// notebook: write a species note + journal entry, save
w.__sa.notes['sp:TESTKEY'] = 'a persistent note';
w.__sa.journal['23 Jul|boulders'] = { note: 'left at first light', weather: 'clear, cold' };
w.__sa.save();

// Grinnell export renders the three parts across the trip
w.__openJournal();
const jtxt = d.getElementById('journal').textContent;
ok('journal renders 10 site-days', d.querySelectorAll('#journal .jday').length === 10);
ok('journal has narrative + accounts + checklist', /Journal/.test(jtxt) && /Species accounts/.test(jtxt) && /checklist/i.test(jtxt));
ok('export/import buttons present', !!d.getElementById('expJson') && !!d.getElementById('impJson'));

// references section (embedded, offline)
ok('reference section present', !!d.getElementById('refs') && d.querySelectorAll('#refs ol li').length >= 8);

// ---- boot 2: notebook round-trip survives reload ----
const b2 = boot(makeDom());
ok('boot 2: check survived reload', b2.w.__sa.seen.size === 1, b2.w.__sa.seen.size + '');
ok('boot 2: species note survived', b2.w.__sa.notes['sp:TESTKEY'] === 'a persistent note');
ok('boot 2: journal entry survived', !!(b2.w.__sa.journal['23 Jul|boulders'] && b2.w.__sa.journal['23 Jul|boulders'].note === 'left at first light'));

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
