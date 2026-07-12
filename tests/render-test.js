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
const dom1 = makeDom();
// union name sidecar (names.js) stub for k2498252 (Egyptian Goose) — the distinctive
// aliases appear in NO corpus common/scientific name, so they deterministically prove
// OR-search across the union index and the per-species name-expander.
dom1.window.NAMES = { k2498252: { s: ['Alopochenzz testica'], v: ['Zztest Sheldgoose'], l: { afr: ['Zztestgans'] } } };
dom1.window.NAMES_LANG = { afr: 'Afrikaans' };
let { d, w, err } = boot(dom1);
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

// abundance is a multi-select (Venn), not a floor: pick "common" (class 5) only
const beforeAb = visible().length;
d.querySelector('#abChips button[data-ab="5"]').click();
const abOnly = visible().length;
ok('abundance chip filters to one class', abOnly > 0 && abOnly < beforeAb, abOnly + ' of ' + beforeAb);
ok('abundance is multi-select (S.ab set)', !!(w.__S.ab && w.__S.ab.has(5)));
d.querySelector('#abChips button[data-ab="5"]').click(); // toggle off -> no abundance filter
ok('deselecting abundance shows all again', visible().length === beforeAb, visible().length + '');

// text-size stepper present and changes the explorer zoom
ok('text-size control present', !!d.getElementById('textSize'));
const z0 = d.getElementById('app').style.zoom;
d.getElementById('textSize').click();
ok('text-size button changes app zoom', d.getElementById('app').style.zoom !== z0);
d.getElementById('textSize').click(); d.getElementById('textSize').click(); // 3-cycle back to base

// ---- union name index: OR-search across all names + per-species name-expander ----
w.__S.q = 'alopochenzz'; w.__applyFilters(); // synonym alias, in no corpus name
const aHits = visible();
ok('OR-search matches a species via a scientific-synonym alias', aHits.length === 1 && /alopochenzz/.test(aHits[0].dataset.txt), aHits.length + ' hits');
w.__S.q = 'zztestgans'; w.__applyFilters(); // Afrikaans local name
ok('OR-search matches via a local-language (Afrikaans) name', visible().length === 1, visible().length + '');
w.__S.q = 'zztest sheldgoose'; w.__applyFilters(); // English vernacular alias
ok('OR-search matches via an alternate English name', visible().length === 1, visible().length + '');
w.__S.q = 'qwzxnomatchqp'; w.__applyFilters();
ok('OR-search: an unmatched query hides everything', visible().length === 0, visible().length + '');
w.__S.q = ''; w.__applyFilters();
const gRow = d.querySelector('#matrix tr.org[data-txt*="alopochenzz"]');
w.__openDrawer(+gRow.dataset.i);
const dhtml = d.getElementById('drawer').innerHTML;
ok('name-expander block ("Also known as") renders in the drawer', /Also known as/.test(dhtml));
ok('name-expander lists synonym, English + local names by source', /Alopochenzz testica/.test(dhtml) && /Zztest Sheldgoose/.test(dhtml) && /Afrikaans/.test(dhtml) && /Zztestgans/.test(dhtml));
d.querySelector('#drawer .dclose').click();

// hide-absent-at-focus: focusing hides species with no record there; a strip toggle reveals them
d.querySelector('#matrix thead .colh').click(); // focus the first site
const focusedVis = visible().length;
const abst = d.getElementById('absToggle');
ok('hide-absent toggle appears on focus', !!abst && abst.style.display !== 'none');
abst.click(); // show all sites' species
ok('showing all sites reveals more rows', visible().length > focusedVis, focusedVis + ' -> ' + visible().length);
abst.click(); // back to only-at-site
d.querySelector('#matrix thead .colh').click(); // clear focus

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

// Grinnell rework: only species with a field note become accounts
w.__openJournal();
const acctsBefore = d.querySelectorAll('#journal .jaccounts .jacct').length;
const seenCk = Array.from(w.__sa.seen)[0], spk = seenCk.split('|')[0];
w.__sa.notes['sp:' + spk] = 'roosting in the fig at first light'; w.__sa.save();
w.__openJournal();
const acctsAfter = d.querySelectorAll('#journal .jaccounts .jacct').length;
ok('noted species is promoted to a species account', acctsAfter === acctsBefore + 1, acctsBefore + ' -> ' + acctsAfter);
ok('every checklist row has an editable note tray', d.querySelectorAll('#journal .jck').length > 0 && d.querySelectorAll('#journal .jtray').length === d.querySelectorAll('#journal .jck').length);

// off-DB species: add a plain-text stub to the first day (offline path, no fetch in jsdom)
const jk0 = d.querySelector('#journal .jday').dataset.jk;
w.__addExtra(jk0, 'Testus fabricatus');
ok('added off-DB species appears in the day checklist', /Testus fabricatus/.test(d.getElementById('journal').textContent));
ok('the stub is stored under that day', (w.__sa.journal[jk0].extras || []).some(x => x.n === 'Testus fabricatus'));

// eBird checklist link stored + shown at the day header
w.__sa.journal[jk0].ebird = ['https://ebird.org/checklist/S987654'];
w.__sa.save(); w.__openJournal();
ok('eBird checklist link shows on the day page', /ebird\.org\/checklist\/S987654/.test(d.getElementById('journal').innerHTML));

// ---- PR-C: focal/tour tiers (T1), map layers + zoom (T4), tour speed (T3) ----
const marksBefore = Object.keys(w.__sa.marks).length;
const star0 = d.querySelector('#matrix tr.org .markstar');
star0.click(); // unmarked -> focal
ok('star marks a species focal', Object.keys(w.__sa.marks).length === marksBefore + 1);
ok('focal/tour toggle chip appears in the strip', d.getElementById('markToggle').style.display !== 'none');
star0.click(); // focal -> tour
ok('star cycles focal -> tour', Object.values(w.__sa.marks).indexOf('tour') >= 0);
ok('marked species pinned under a ★ header', !!d.getElementById('markHdr'));
d.getElementById('markToggle').click(); // unpin
ok('unpin removes the pinned header', !d.getElementById('markHdr') && w.__S.showMarks === false);
d.getElementById('markToggle').click(); // re-pin
star0.click(); // tour -> unmarked
ok('star cycles back to unmarked', Object.keys(w.__sa.marks).length === marksBefore);

ok('map zoom controls present', !!d.getElementById('zIn') && !!d.getElementById('zOut'));
d.querySelector('.segbtn[data-region="cape"]').click();
ok('Cape map exposes 3 selectable layers', d.querySelectorAll('#mapSurface .lyr').length === 3, d.querySelectorAll('#mapSurface .lyr').length + '');
d.querySelector('#mapSurface .lyr[data-l="satellite"]').click();
ok('selecting a layer sets S.layer', w.__S.layer === 'satellite');
d.querySelector('.segbtn[data-region="all"]').click();

ok('tour speed control present', !!d.getElementById('tSpeed') && !!d.getElementById('tSpeedLab'));
const spd0 = w.__S.tourMs;
d.getElementById('tFast').click();
ok('faster button lowers the interval', w.__S.tourMs < spd0, spd0 + ' -> ' + w.__S.tourMs);
d.getElementById('tSlow').click();
ok('slower button restores the interval', w.__S.tourMs === spd0);

// importing a favorites JSON applies marks AND lights the strip chip (also seeds the reload test)
w.__importJSON(JSON.stringify({ v: 2, app: 'saexplore', marks: { k5229384: 'tour', MARKTESTKEY: 'tour' } }));
ok('importing favorites applies marks + shows the focal/tour chip', w.__sa.marks['k5229384'] === 'tour' && d.getElementById('markToggle').style.display !== 'none');

// references section (embedded, offline)
ok('reference section present', !!d.getElementById('refs') && d.querySelectorAll('#refs ol li').length >= 8);

// ---- boot 2: notebook round-trip survives reload ----
const b2 = boot(makeDom());
ok('boot 2: check survived reload', b2.w.__sa.seen.size === 1, b2.w.__sa.seen.size + '');
ok('boot 2: species note survived', b2.w.__sa.notes['sp:TESTKEY'] === 'a persistent note');
ok('boot 2: journal entry survived', !!(b2.w.__sa.journal['23 Jul|boulders'] && b2.w.__sa.journal['23 Jul|boulders'].note === 'left at first light'));
ok('boot 2: off-DB stub survived reload', Object.keys(b2.w.__sa.journal).some(jk => (b2.w.__sa.journal[jk].extras || []).some(x => x.n === 'Testus fabricatus')));
ok('boot 2: eBird link survived reload', Object.keys(b2.w.__sa.journal).some(jk => (b2.w.__sa.journal[jk].ebird || []).some(u => /S987654/.test(u))));
ok('boot 2: focal/tour marks survived reload', b2.w.__sa.marks['MARKTESTKEY'] === 'tour');

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
