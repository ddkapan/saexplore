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
// skip the first-run "seed specials as tour marks" so the mechanics tests start from a
// known no-marks state (the seeding itself is checked separately, boot with an empty store).
store['sa_specials_seeded'] = '1';
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
dom1.window.NAMES = {
  k2498252: { s: ['Alopochenzz testica'], v: ['Zztest Sheldgoose'], l: { afr: ['Zztestgans'] } },
  // genus-collapse fix: k3242735 is stored at genus rank (s='Astur'); the sidecar
  // resolves it to a species binomial the app must prefer for display + links.
  k3242735: { sp: 'Astur melanoleucus', spii: 424242, ebk: 'blagos1' },
};
dom1.window.NAMES_LANG = { afr: 'Afrikaans' };
// Barcode sidecar (bold.js) stub. [n, z, inst?] = records · South-African share · top holder.
// k2498252 (Egyptian Goose) has corpus src 'ei' — NO genomic evidence — so it proves the
// barcode sidecar ALONE lights the genomic glyph. k3242735 has no named institution.
// k3242735's corpus key is a GENUS key, so it carries a 4th field: the resolved species
// taxonKey. The records link MUST use it — linking by the corpus key would list the whole genus
// (and for the White-fronted Plover, whose key is k1 = Animalia, the entire animal kingdom).
dom1.window.BOLD = {
  k2498252: [267, 9, 'Iziko South African Museum'],
  k3242735: [12, 5, '', 2480631],
};
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

// ---- filter-aware Sources breakdown panel ----
ok('Sources toggle + panel present', !!d.getElementById('srcToggle') && !!d.getElementById('srcPanel'));
d.getElementById('srcToggle').click(); // open it
const srcHtml = d.getElementById('srcPanel').innerHTML;
ok('Sources panel lists all four evidence types', /Museum voucher/.test(srcHtml) && /DNA barcode/.test(srcHtml) && /iNaturalist/.test(srcHtml) && /eBird/.test(srcHtml));
ok('Sources panel shows per-type share + species counts', /% ·/.test(srcHtml) && /spp/.test(srcHtml));
// filter to birds only → eBird share should climb toward 100%
const birdPct = () => { const m = d.getElementById('srcPanel').innerHTML.match(/eBird<\/span><span[^>]*>(\d+)%/); return m ? +m[1] : -1; };
const allBirdsPct = birdPct();
Object.keys(w.__S.taxa).forEach(g => { w.__S.taxa[g] = 0; }); w.__S.taxa.Aves = 1; w.__applyFilters();
ok('Sources panel recomputes on filter (Birds → eBird share rises)', birdPct() > allBirdsPct, birdPct() + '% vs ' + allBirdsPct + '%');
Object.keys(w.__S.taxa).forEach(g => { w.__S.taxa[g] = 1; }); w.__applyFilters();

// ---- DNA-barcode (BOLD via iBOL) sidecar ----
const srcNow = () => d.getElementById('srcPanel').innerHTML;
ok('Sources panel labels the barcode row as BOLD + calls out the South-African share',
  /DNA barcode · BOLD/.test(srcNow()) && /from SA/.test(srcNow()));
// Egyptian Goose: corpus src is 'ei' (no genomic) — the sidecar alone must light the glyph.
const egRow = d.querySelector('#matrix tr.org[data-txt*="alopochenzz"]');
const egLit = (egRow.querySelector('td:nth-child(4)').innerHTML.match(/opacity:1[;"]/g) || []).length;
ok('barcode data alone lights the genomic glyph (species has no corpus genomic evidence)', egLit === 3, egLit + ' lit glyphs (expect m off; g+i+e on)');
w.__openDrawer(+egRow.dataset.i);
const bHtml = d.getElementById('drawer').innerHTML;
ok('drawer shows the barcode block with record count', /DNA barcodes · BOLD/.test(bHtml) && /267<\/b> barcode records/.test(bHtml));
ok('drawer calls out the South-African subset', /9<\/b> from South Africa/.test(bHtml));
ok('drawer names the holding institution', /Iziko South African Museum/.test(bHtml));
// BOLD's portal cannot deep-link a species (its parser splits the binomial), so we link the
// records we actually counted: the iBOL dataset on GBIF, keyed by taxonKey.
ok('drawer links to the iBOL records on GBIF (not BOLD\'s dead search URL)',
  /gbif\.org\/occurrence\/search\?dataset_key=040c5662[^"]*taxon_key=2498252/.test(bHtml) && !/boldsystems\.org/.test(bHtml));
d.querySelector('#drawer .dclose').click();
// a species with barcodes but no named depository must not render an empty "mostly at" line
const bgRow = [].slice.call(d.querySelectorAll('#matrix tr.org')).find(r => {
  const cd = r.querySelector('td:nth-child(3) div'); return cd && /Black Goshawk/.test(cd.textContent);
});
w.__openDrawer(+bgRow.dataset.i);
const gHtml = d.getElementById('drawer').innerHTML;
ok('no institution → no dangling "mostly at" line', /12<\/b> barcode records/.test(gHtml) && !/mostly at/.test(gHtml));
// the genus-key trap: link by the RESOLVED species taxonKey, never by the coarse corpus key
ok('coarse corpus key links by the resolved species taxonKey, not the genus/kingdom key',
  /taxon_key=2480631/.test(gHtml) && !/taxon_key=3242735/.test(gHtml));
d.querySelector('#drawer .dclose').click();

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

// ---- genus-collapse fix: prefer the resolved species name (sp) over the bare genus ----
const gcRow = [].slice.call(d.querySelectorAll('#matrix tr.org')).find(r => {
  const cd = r.querySelector('td:nth-child(3) div'); return cd && /Black Goshawk/.test(cd.textContent);
});
ok('genus-collapsed row exists (Black Goshawk)', !!gcRow);
if (gcRow) {
  const tableSci = gcRow.querySelector('td:nth-child(3) div:nth-child(2)').textContent;
  ok('table shows the resolved species, not the genus', tableSci === 'Astur melanoleucus', tableSci);
  w.__openDrawer(+gcRow.dataset.i);
  const drw = d.getElementById('drawer');
  ok('drawer header shows the resolved species', /Astur melanoleucus/.test(drw.querySelector('div[style*=italic]').textContent));
  ok('Wikipedia link points at the species, not the genus', /wiki\/Astur_melanoleucus/.test(drw.innerHTML) && !/wiki\/Astur"/.test(drw.innerHTML));
  ok('resolved species is searchable via OR-search', (function () { w.__S.q = 'astur melanoleucus'; w.__applyFilters(); const n = visible().length; w.__S.q = ''; w.__applyFilters(); return n >= 1; })());
  // eBird canonicalisation: code is the join key — searchable + linked + exported
  ok('bird is searchable by its eBird code', (function () { w.__S.q = 'blagos1'; w.__applyFilters(); const n = visible().length; w.__S.q = ''; w.__applyFilters(); return n === 1; })());
  w.__openDrawer(+gcRow.dataset.i);
  ok('drawer links to the eBird species page (code)', /ebird\.org\/species\/blagos1/.test(d.getElementById('drawer').innerHTML));
  d.querySelector('#drawer .dclose').click();
  // marks are now a DERIVED view of the focal/tour lists — add via the list primitive
  w.__listAdd('tour', 'k3242735'); w.__sa.save();
  const exp = w.__collectNotes();
  ok('export carries the eBird code for referenced birds', exp.ebird && exp.ebird.k3242735 === 'blagos1', JSON.stringify(exp.ebird));
  delete w.__sa.marks.k3242735; w.__sa.save();
}

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
// pick a row that is genuinely UNMARKED — marked species float to the top, so the first row
// may already be a tour pick, and clicking it would cycle it OFF.
const star0Row = [].slice.call(d.querySelectorAll('#matrix tr.org'))
  .find(r => !w.__sa.marks[w.__UNIC[+r.dataset.i].k]);      // unmarked per the MODEL
const star0 = star0Row.querySelector('.markstar');
const star0Key = w.__UNIC[+star0Row.dataset.i].k;
star0.click(); // unmarked -> focal
ok('star marks a species focal', w.__sa.marks[star0Key] === 'focal' && Object.keys(w.__sa.marks).length === marksBefore + 1);
ok('focal/tour toggle chip appears in the strip', d.getElementById('markToggle').style.display !== 'none');
star0.click(); // focal -> tour
ok('star cycles focal -> tour', w.__sa.marks[star0Key] === 'tour');
ok('marked species pinned under a ★ header', !!d.getElementById('markHdr'));
d.getElementById('markToggle').click(); // unpin
ok('unpin removes the pinned header', !d.getElementById('markHdr') && w.__S.showMarks === false);
d.getElementById('markToggle').click(); // re-pin
star0.click(); // tour -> unmarked
ok('star cycles back to unmarked', !w.__sa.marks[star0Key] && Object.keys(w.__sa.marks).length === marksBefore);

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
// ---- PR-K: LISTS — the curation primitive ----
// focal/tour are just two lists; site specials are shipped lists; a filtered view can be frozen
// into a list; a list is itself a filter. Curation is separable from the record (notes/journal).
ok('list store exists with focal + tour as default lists',
  !!w.__LSTORE().l.focal && !!w.__LSTORE().l.tour && w.__LSTORE().ord.indexOf('focal') >= 0);
ok('marks are a DERIVED view of the focal/tour lists', typeof w.__sa.marks === 'object');
// a shipped site list seeds in and is site-scoped (stubbed here — lists.js isn't loaded in jsdom)
w.__mergeLists({ ord: ['site-boulders'], l: { 'site-boulders': { n: 'Boulders', g: '◆', c: '#5e7249', site: 'boulders', it: ['k2481915'], o: 'shipped' } } });
ok('a shipped/imported list merges in, scoped to its site', !!w.__LSTORE().l['site-boulders'] && w.__LSTORE().l['site-boulders'].site === 'boulders');
// merge is a UNION and never destructive
w.__mergeLists({ ord: ['site-boulders'], l: { 'site-boulders': { n: 'Boulders', g: '◆', c: '#5e7249', site: 'boulders', it: ['k2481915', 'k3242735'] } } });
ok('merging the same list again is a UNION, not a clobber',
  w.__LSTORE().l['site-boulders'].it.length === 2 && w.__LSTORE().l['site-boulders'].it.indexOf('k2481915') >= 0);
// a list IS a filter
const beforeList = visible().length;
w.__S.tags.add('site-boulders'); w.__applyFilters();
const onList = visible().length;
ok('a list acts as a filter (narrows to its members)', onList === 2 && onList < beforeList, onList + ' of ' + beforeList);
w.__S.tags.delete('site-boulders'); w.__applyFilters();
// filters make lists: freeze the current view
w.__S.q = 'alopochenzz'; w.__applyFilters();
const frozen = w.__listNew('Test targets', [w.__UNIC[0].k], '');
w.__S.q = ''; w.__applyFilters();
ok('a new list can be created from a view and is "mine"', w.__LSTORE().l[frozen].o === 'mine' && w.__LSTORE().l[frozen].n === 'Test targets');
// curation exports WITHOUT the field notes — the whole point of the split
const le = w.__collectNotes();
ok('export v3 carries the lists', le.v === 3 && !!le.lists && !!le.lists.l.focal);
ok('export still emits a derived marks map (v2 readers keep working)', !!le.marks && typeof le.marks === 'object');
// deleting a shipped list tombstones it so it is not silently re-seeded
w.__renderListMgr();
const lm = d.getElementById('listMgr');
ok('the list manager renders a row per list', !!lm && lm.querySelectorAll('.lmD').length >= 3);
ok('list chips render in the strip', !!d.getElementById('listChips') && d.querySelectorAll('#listChips .tagf').length >= 3);

ok('reference section present', !!d.getElementById('refs') && d.querySelectorAll('#refs ol li').length >= 8);

// ---- top controls: clear of the Dynamic Island, auto-hiding on scroll (issue #57) ----
// The page runs edge-to-edge under the island (viewport-fit=cover + black-translucent status
// bar), so a raw top:8px puts ◐ / A+ UNDERNEATH it, untappable. They must be offset by the
// safe-area inset — and they slide away on scroll-down so the list gets the whole screen.
const css = [].slice.call(d.querySelectorAll('style')).map(s => s.textContent).join('\n');
ok('top controls clear the Dynamic Island (safe-area inset, not a raw top:8px)',
  /#themeToggle\{[^}]*top:calc\([^)]*safe-area-inset-top/.test(css) &&
  /#textSize\{[^}]*top:calc\([^)]*safe-area-inset-top/.test(css));
ok('a .tophide state exists to slide them away', /tophide/.test(css));
const tt = d.getElementById('themeToggle'), tsz = d.getElementById('textSize');
const topHidden = () => tt.classList.contains('tophide') && tsz.classList.contains('tophide');
const setY = y => Object.defineProperty(w, 'scrollY', { value: y, configurable: true });
// while a drawer/journal overlay owns the screen the controls must STAY put
const drw2 = d.getElementById('drawer');
drw2.classList.add('open'); setY(500); w.__topAuto();
ok('an open drawer keeps the top controls visible (no slide-away under an overlay)', !topHidden());
drw2.classList.remove('open');
setY(0); w.__topAuto();
ok('near the top the controls are shown', !topHidden());
setY(400); w.__topAuto();
ok('scrolling DOWN hides the top controls', topHidden());
setY(300); w.__topAuto();
ok('scrolling UP brings them back', !topHidden());
setY(600); w.__topAuto();
ok('scrolling down again re-hides', topHidden());
setY(10); w.__topAuto();
ok('returning near the top always restores them', !topHidden());

// ---- photo backfill: every species has an image, and a silhouette is never sold as a photo ----
const UN = w.__UNIC || [];
ok('no species is left without an image', UN.length ? UN.every(o => o.p && o.p[0]) : true,
  UN.filter(o => !o.p || !o.p[0]).length + ' blank');
const silIdx = UN.findIndex(o => o.sil);
ok('the corpus carries silhouettes, flagged with o.sil', silIdx >= 0, UN.filter(o => o.sil).length + ' silhouettes');
if (silIdx >= 0) {
  const silRow = d.querySelector('#matrix tr.org[data-i="' + silIdx + '"]');
  ok('silhouette thumbnails are contained, not cropped like a photo',
    /object-fit:contain/.test(silRow.querySelector('td:nth-child(2)').innerHTML));
  w.__openDrawer(silIdx);
  const sh = d.getElementById('drawer').innerHTML;
  ok('drawer says plainly that a silhouette is NOT a photo of the species', /Silhouette — no photo of this species is available/.test(sh));
  ok('silhouette credits PhyloPic + CC0', /PhyloPic/.test(sh) && /CC0/i.test(sh));
  ok('silhouette is NOT mislabelled "via iNaturalist"', !/via iNaturalist/.test(sh));
  d.querySelector('#drawer .dclose').click();
}
// a Wikimedia-sourced photo must not claim to come from iNaturalist either (the old hardcoded bug)
const wmIdx = UN.findIndex(o => o.p && /wikimedia/.test(o.p[0]));
if (wmIdx >= 0) {
  w.__openDrawer(wmIdx);
  const wh = d.getElementById('drawer').innerHTML;
  ok('a Wikimedia photo is not credited to iNaturalist', !/via iNaturalist/.test(wh));
  d.querySelector('#drawer .dclose').click();
}

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
