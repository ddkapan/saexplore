/* PR-0 migration safety test (v1.0.56). Seeds a PRE-FIX (legacy) localStorage with the old
 * itinerary dates in the journal keys + species notes + organism×site checks, boots the new
 * app, and asserts: schema stamped, journal realigned to the corrected dates, ZERO data lost,
 * a backup stashed, checks/notes/marks untouched, and a re-boot is idempotent.
 * Run:  node tests/migration-test.js   (needs jsdom, like render-test.js)  */
const path = require('path'), fs = require('fs'), vm = require('vm');
const { JSDOM } = require('jsdom');
const ROOT = path.join(__dirname, '..');
let fails = 0; const ok = (n, c, d) => { if (!c) fails++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? '  (' + d + ')' : ''}`); };

// ---- seed a legacy store (NO sa5_schema — predates the fix) ----
const store = {};
const legacyJournal = {
  '20 Jul|kirstenbosch': { note: 'proteas in flower, sugarbirds', weather: 'cool, still' },
  '26 Jul|blyde': { note: 'canyon rim at dawn', extras: [{ n: 'Testus canyonii', xk: 'x1', jk: '26 Jul|blyde' }] },
  '30 Jul|kruger_letaba': { note: 'elephants at the causeway', ebird: ['https://ebird.org/checklist/S111'] },
  '23 Jul|boulders': { note: 'penguins on the boardwalk' }, // boulders date UNCHANGED (23 Jul) — must stay
};
store['sa5_journal'] = JSON.stringify(legacyJournal);
store['sa5_notes'] = JSON.stringify({ 'sp:k2481915': 'a species note that must survive' });
store['sa5_seen'] = JSON.stringify(['k2481915|kirstenbosch', 'k5229384|boulders']);
store['sa5_marks'] = JSON.stringify({ k5229384: 'tour' });
const IN_JOURNAL = Object.keys(legacyJournal).length;

function makeDom() {
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>',
    { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://localhost/saexplore/' });
  Object.defineProperty(dom.window, 'localStorage', {
    value: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    configurable: true
  });
  return dom;
}
function boot(dom) {
  const ctx = dom.getInternalVMContext();
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'), ctx);
  return dom.window;
}

// ---- boot 1: migration should fire ----
const w = boot(makeDom());
const J = w.__sa.journal;
ok('schema stamped to 2 after migration', store['sa5_schema'] === '2', store['sa5_schema']);
ok('a backup key was stashed', Object.keys(store).some(k => /^sa5_backup_/.test(k)));
const bkKey = Object.keys(store).find(k => /^sa5_backup_/.test(k));
const bk = bkKey ? JSON.parse(store[bkKey]) : {};
ok('backup contains the original journal verbatim', bk.sa5_journal === JSON.stringify(legacyJournal));
ok('backup records the source schema', bk._schema_from === 'legacy', bk._schema_from);

ok('ZERO journal loss (in===out count)', Object.keys(J).length === IN_JOURNAL, IN_JOURNAL + ' -> ' + Object.keys(J).length);
ok('kirstenbosch 20 Jul -> 24 Jul', !!J['24 Jul|kirstenbosch'] && /sugarbirds/.test(J['24 Jul|kirstenbosch'].note) && !J['20 Jul|kirstenbosch']);
ok('blyde 26 Jul -> 29 Jul (extras carried)', !!J['29 Jul|blyde'] && (J['29 Jul|blyde'].extras || []).some(x => x.n === 'Testus canyonii'));
ok('kruger_letaba 30 Jul -> 27 Jul (ebird carried)', !!J['27 Jul|kruger_letaba'] && (J['27 Jul|kruger_letaba'].ebird || []).some(u => /S111/.test(u)));
ok('boulders 23 Jul unchanged (no needless remap)', !!J['23 Jul|boulders'] && /penguins/.test(J['23 Jul|boulders'].note));

ok('organism×site checks untouched', w.__sa.seen.has('k2481915|kirstenbosch') && w.__sa.seen.has('k5229384|boulders'));
ok('species note untouched', w.__sa.notes['sp:k2481915'] === 'a species note that must survive');
ok('marks untouched', w.__sa.marks.k5229384 === 'tour');

// ---- boot 2: idempotent — no second migration, journal stable ----
const before = store['sa5_journal'];
const w2 = boot(makeDom());
ok('re-boot is idempotent (schema still 2, journal unchanged)', store['sa5_schema'] === '2' && store['sa5_journal'] === before);
ok('boot 2 still reads the realigned journal', !!w2.__sa.journal['24 Jul|kirstenbosch'] && !w2.__sa.journal['20 Jul|kirstenbosch']);

console.log(`\n${fails === 0 ? 'MIGRATION ALL PASS' : fails + ' FAILURE(S)'}`);
process.exit(fails === 0 ? 0 : 1);
