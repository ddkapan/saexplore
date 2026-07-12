#!/usr/bin/env node
/* build_names.js — assemble the union NAME sidecar (../../names.js).
 *
 * Reads the GBIF vernacular-name + synonym caches (vcache/, scache/) pulled per
 * corpus usageKey and folds them into window.NAMES, keyed by corpus key:
 *
 *   window.NAMES = { "k2498252": { s:[synonym sci names], v:[English vernaculars],
 *                                  l:{afr:[…], zul:[…]} }, … }
 *
 * Principle (union, never exclude — docs/NAME_BACKBONE.md): every alias we find is
 * KEPT and placed "to the right" of the corpus name as provenance. A key is emitted
 * only when it adds ≥1 alias beyond the corpus common/scientific name — the corpus
 * name itself is already in the row haystack, so we don't repeat it.
 *
 * Scope note: `v` carries English vernaculars; `l` carries the local/indigenous
 * columns the field guide wants — the SA official languages. Other foreign-language
 * vernaculars (Finnish, etc.) are left in the cache, not shipped: they add size and
 * search noise without helping a Southern Africa trip. The full multilingual union is
 * a one-line whitelist change away (BACKLOG A/P1) — the cache is retained.
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const meta = require('./idmeta.json');
const idmap = require('./idmap.json').idmap;

// Corpus (for the field common/scientific we already ship — don't repeat those).
const vm = require('vm');
const c = { window: {}, console };
vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(DIR, '../../data.js'), 'utf8'), c);
const U = c.window.UNIC;

// SA official languages (ISO 639-3 as GBIF emits them) → display label.
const SA = {
  afr: 'Afrikaans', zul: 'isiZulu', xho: 'isiXhosa', nso: 'Sepedi',
  sot: 'Sesotho', tsn: 'Setswana', ssw: 'siSwati', ven: 'Tshivenḓa',
  tso: 'Xitsonga', nbl: 'isiNdebele',
};
// 2-letter fallbacks GBIF sometimes uses.
const A2 = { af: 'afr', zu: 'zul', xh: 'xho', st: 'sot', tn: 'tsn', ss: 'ssw', ve: 'ven', ts: 'tso', nr: 'nbl', en: 'eng' };

const norm = s => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const cap = (arr, n) => arr.slice(0, n);

function readJSON(f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } }

const NAMES = {};
const langSeen = {};
let withSyn = 0, withVern = 0, withLocal = 0;

for (const o of U) {
  const raw = String(o.k).replace(/^k/, '');
  if (!/^\d+$/.test(raw)) continue;
  const have = new Set([norm(o.c), norm(o.s)].filter(Boolean));

  // ---- synonyms (scientific aliases) ----
  const syn = [];
  const sj = readJSON(path.join(DIR, 'scache', raw + '.json'));
  if (sj && sj.results) {
    for (const r of sj.results) {
      const nm = (r.canonicalName || r.scientificName || '').trim();
      if (!nm) continue;
      const key = norm(nm);
      if (have.has(key)) continue;
      have.add(key);
      if (!syn.some(x => norm(x) === key)) syn.push(nm);
    }
  }
  // GBIF-current canonical, if it drifted from our scientific (the Bubulcus↔Ardea cases).
  const acc = idmap[o.k];
  const gbif = acc && meta[acc] && meta[acc].gbif;
  if (gbif && meta[acc].rank === 'SPECIES' && !have.has(norm(gbif))) {
    have.add(norm(gbif)); syn.unshift(gbif);
  }

  // ---- vernaculars (English + SA local) ----
  const vern = [];
  const local = {};
  const vj = readJSON(path.join(DIR, 'vcache', raw + '.json'));
  if (vj && vj.results) {
    for (const r of vj.results) {
      let lang = (r.language || '').toLowerCase();
      if (A2[lang]) lang = A2[lang];
      const nm = (r.vernacularName || '').trim();
      if (!nm) continue;
      langSeen[lang] = (langSeen[lang] || 0) + 1;
      const key = norm(nm);
      if (lang === 'eng') {
        if (have.has(key)) continue; have.add(key);
        if (!vern.some(x => norm(x) === key)) vern.push(nm);
      } else if (SA[lang]) {
        (local[lang] = local[lang] || []);
        if (!local[lang].some(x => norm(x) === key)) local[lang].push(nm);
      }
    }
  }

  const rec = {};
  if (syn.length) { rec.s = cap(syn, 8); withSyn++; }
  if (vern.length) { rec.v = cap(vern, 6); withVern++; }
  const lk = Object.keys(local);
  if (lk.length) { rec.l = {}; lk.forEach(k => rec.l[k] = cap(local[k], 4)); withLocal++; }
  if (rec.s || rec.v || rec.l) NAMES[o.k] = rec;
}

// ---- genus-collapse fix (genus_fix.json) ----------------------------------
// Some corpus records were matched to a GBIF *genus* key during the build (recent
// splits: Accipiter→Aerospiza/Astur/Tachyspiza, etc.), so o.s is a bare genus and the
// account/Wikipedia pull the genus article — hiding the species. We resolve each to its
// species and attach `sp` (species binomial the app prefers for display + Wikipedia) and,
// where the corpus iNat id was itself a genus / the wrong species, `spii` (species iNat
// id, to override the "Normally" fetch). Union, never exclude: the genus stays in the row
// haystack; the species name is *added* and preferred. See docs/BACKLOG.md §C.
let fixApplied = 0, fixSkip = 0;
try {
  const fix = require('./genus_fix.json');
  for (const k of Object.keys(fix)) {
    const f = fix[k];
    if (f.skip || f.unresolved || (!f.sp && !f.spii)) { fixSkip++; continue; }
    const rec = NAMES[k] || (NAMES[k] = {});
    if (f.sp) rec.sp = f.sp;      // corpus o.s was a bare genus → prefer this species name
    if (f.spii) rec.spii = f.spii; // corpus o.ii was a genus / wrong species → use this for the account + links
    fixApplied++;
  }
} catch (e) { console.log('  (no genus_fix.json — skipping genus-collapse fix)'); }

const out = 'window.NAMES=' + JSON.stringify(NAMES) + ';\n' +
  'window.NAMES_LANG=' + JSON.stringify(SA) + ';\n';
fs.writeFileSync(path.join(DIR, '../../names.js'), out);

const bytes = Buffer.byteLength(out);
console.log('genus-collapse fix: applied', fixApplied, '| skipped', fixSkip);
console.log('NAMES keys:', Object.keys(NAMES).length, 'of', U.length);
console.log('  with synonyms:', withSyn, '| with English vernacular:', withVern, '| with SA local:', withLocal);
console.log('  names.js size:', (bytes / 1024).toFixed(1), 'KB');
const top = Object.entries(langSeen).sort((a, b) => b[1] - a[1]).slice(0, 20);
console.log('  languages seen (top 20):', top.map(x => x[0] + ':' + x[1]).join(' '));
