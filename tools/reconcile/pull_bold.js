#!/usr/bin/env node
/* pull_bold.js — barcode coverage per species, from BOLD's records as published to GBIF (iBOL).
 *
 * WHY THIS SOURCE (all verified 2026-07-12, the short version of a longer diagnosis):
 *
 *  The corpus's "genomic" evidence was never a BOLD pull — it came from GBIF MATERIAL_SAMPLE
 *  occurrences, a thin slice: 210/2,780 species, 363 records, institution usually "?".
 *
 *  Attempt 1 — BOLD's own v4 API. Two blockers:
 *    (a) Only `stats` is live; `specimen`/`combined` (record downloads) return a
 *        "BOLD Public Offline" page. So no bulk pull — it's one call PER SPECIES.
 *    (b) BOLD quotas hard at roughly 300 calls: it then answers with the PLAIN-TEXT line
 *        "You have exceeded your allowed request quota." We cannot pull 2,780 species.
 *        (Watch out: that reply is neither JSON nor HTML. An earlier version of this script
 *        parsed it as a miss and cached 259 species as "0 barcodes" — false zeros. Any
 *        fetch failure here must NEVER be cached. See `one()`.)
 *    (c) Even when it answered, BOLD's `stats?taxon=<name>` matches an exact name string, so
 *        it MISSES synonyms: Protea cynaroides → 2 records. It is also weak on plants.
 *
 *  Attempt 2 — the same BOLD records via GBIF. iBOL (the Barcode of Life consortium) publishes
 *  BOLD's specimens to GBIF as dataset 040c5662… (23.5M records, 865k of them South African).
 *  GBIF matches on the taxonomic BACKBONE, so it catches synonyms and subspecies the name
 *  string misses — Protea cynaroides → 32 records, Ilex mitis → 16. It has no quota, and ONE
 *  call returns the count, the holding institutions and the per-country split. This is the
 *  same underlying data, better matched. So: GBIF/iBOL it is.
 *
 *  What we give up: BOLD's BIN counts (GBIF's BIN dataset keys on BIN pseudo-taxa, not
 *  species, so BINs can't be joined per species). Numbers are therefore "barcode records",
 *  not BINs. We still deep-link to BOLD for the human view.
 *
 * Cache: boldcache/<key>.json — resumable, gitignored. Output: bold.js via build_bold.js.
 *
 *   node pull_bold.js            # pull everything not already cached
 *   node pull_bold.js --limit 40 # smoke test
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '../..');
const DIR = __dirname;
const CACHE = path.join(DIR, 'boldcache');
if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });

global.window = global;
require(path.join(ROOT, 'data.js'));
require(path.join(ROOT, 'names.js'));
const UNIC = window.UNIC, NAMES = window.NAMES || {};
// The TRUE rank of every corpus key, from GBIF (tools/reconcile/check_ranks.js). Do not skip
// this: a corpus key is usually a species key, but 27 are not — 25 genus, one PHYLUM
// (k7707728 = Tracheophyta) and one KINGDOM (k1 = Animalia, the White-fronted Plover).
// Feeding k1 to an occurrence search counts the entire animal kingdom: 22,188,596 "barcodes".
const RANK = require('./rankcache.json');

const IBOL = '040c5662-da76-4782-a48e-cdea1892d14c';
const CONC = 6;
const argLimit = (() => { const i = process.argv.indexOf('--limit'); return i > 0 ? +process.argv[i + 1] : 0; })();

const sleep = ms => new Promise(r => setTimeout(r, ms));
const sciOf = o => { const n = NAMES[o.k]; return (n && n.sp) || o.s || ''; };

function getJSON(url, tries) {
  tries = tries || 0;
  return new Promise(res => {
    const req = https.get(url, { headers: { 'User-Agent': 'saexplore/1.0 (field guide; dkapan@gmail.com)' } }, r => {
      let b = '';
      r.on('data', d => b += d);
      r.on('end', async () => {
        if (r.statusCode === 200) { try { return res(JSON.parse(b)); } catch (e) { /* fall through */ } }
        // NEVER treat a failure as "no data" — back off and retry, else return null and skip.
        if (tries < 4) { await sleep(800 * Math.pow(2, tries)); return res(await getJSON(url, tries + 1)); }
        res(null);
      });
    });
    req.on('error', async () => {
      if (tries < 4) { await sleep(800 * Math.pow(2, tries)); return res(await getJSON(url, tries + 1)); }
      res(null);
    });
    req.setTimeout(30000, () => { req.destroy(); });
  });
}

// GBIF taxonKey. Our corpus key IS a GBIF key (k2498252 → 2498252) — but for the 28
// genus-collapsed records it is a GENUS key, and counting a whole genus would wildly
// overcount. Resolve those to a SPECIES key by name first.
//
// The catch (found the hard way): our resolved name is often a RECENT SPLIT that GBIF's backbone
// hasn't adopted — `Astur melanoleucus` matches back to rank GENUS (matchType HIGHERRANK), which
// we must refuse. The union rule saves us: the older synonym IS in the backbone
// (`Accipiter melanoleucus` → 2480631, SPECIES, EXACT), and a GBIF taxonKey search covers the
// synonymy anyway. So try the accepted name, then every synonym, and take the first SPECIES hit.
const keyCache = {};
async function matchSpecies(nm) {
  if (keyCache[nm] !== undefined) return keyCache[nm];
  const j = await getJSON('https://api.gbif.org/v1/species/match?name=' + encodeURIComponent(nm));
  const k = (j && j.usageKey && j.rank === 'SPECIES') ? j.usageKey : 0;   // rank must be SPECIES
  keyCache[nm] = k;
  return k;
}
async function taxonKeyFor(o) {
  const raw = +String(o.k).replace(/^k/, '');
  const rank = RANK[o.k];
  // Only a verified SPECIES/SUBSPECIES key may be used directly. Anything coarser (or unknown)
  // must be re-resolved by NAME — never by the key.
  if (rank === 'SPECIES' || rank === 'SUBSPECIES') return raw;
  const n = NAMES[o.k] || {};
  // include the corpus's own name: for k1 the KEY is Animalia but o.s is a perfectly good
  // binomial (Charadrius marginatus), and that is what the backbone actually knows.
  const cands = [sciOf(o), o.s].concat(n.s || []).filter(s => /^[A-Z][a-z-]+ [a-z][a-z-]+$/.test(s || ''));
  for (const nm of cands) { const k = await matchSpecies(nm); if (k) return k; }
  // ~26 species end up here and get NO barcode data. That is deliberate. They are genus-collapsed
  // precisely BECAUSE the GBIF backbone has no species record for them, so there is no species
  // taxonKey to ask for — it's circular. The tempting fallbacks are both wrong:
  //   • full-text `q=Oxythyrea marginalis` → 1,225 records, but they're O. albopicta, O. cinctella…
  //     (it silently degrades to the genus — the exact overcount we refuse);
  //   • `species/search` → no exact canonical match either; the backbone simply lacks them.
  // Under-reporting 0.9% of the corpus beats inventing a genus-wide number for it.
  return 0;
}

// "mined from genbank, ncbi" is a data provenance note, not a depository — never show it.
const NOT_A_DEPOSITORY = /genbank|ncbi|unknown|n\/a|^\?$/i;
function tidyInst(s) {
  s = String(s || '').trim();
  if (!s || NOT_A_DEPOSITORY.test(s)) return '';
  if (s.length > 44) s = s.slice(0, 42).replace(/[,\s]+$/, '') + '…';
  return s.replace(/\b[a-z]/g, c => c.toUpperCase());   // these arrive lower-cased
}

async function one(o) {
  const f = path.join(CACHE, o.k + '.json');
  if (fs.existsSync(f)) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { /* refetch */ } }

  const tk = await taxonKeyFor(o);
  if (!tk) return null;                        // unresolvable → do NOT cache, just skip

  const url = 'https://api.gbif.org/v1/occurrence/search?datasetKey=' + IBOL + '&taxonKey=' + tk +
    '&limit=0&facet=institutionCode&facet=country&facetLimit=40';
  const j = await getJSON(url);
  if (!j || typeof j.count !== 'number') return null;   // failure → NOT cached (the old bug)

  const rec = { k: o.k, name: sciOf(o), tk: tk, n: j.count, z: 0, inst: '' };
  (j.facets || []).forEach(fc => {
    if (fc.field === 'COUNTRY') { const za = (fc.counts || []).find(c => c.name === 'ZA'); if (za) rec.z = za.count; }
    if (fc.field === 'INSTITUTION_CODE') {
      const top = (fc.counts || []).map(c => tidyInst(c.name)).filter(Boolean)[0];
      if (top) rec.inst = top;
    }
  });
  fs.writeFileSync(f, JSON.stringify(rec));
  return rec;
}

(async () => {
  let list = UNIC.slice();
  if (argLimit) list = list.slice(0, argLimit);
  const todo = list.filter(o => !fs.existsSync(path.join(CACHE, o.k + '.json')));
  console.log('species: ' + list.length + ' · cached: ' + (list.length - todo.length) + ' · to pull: ' + todo.length);

  let i = 0, done = 0, hit = 0, failed = 0, t0 = Date.now();
  async function worker() {
    while (i < todo.length) {
      const o = todo[i++];
      const r = await one(o);
      done++;
      if (r === null) failed++; else if (r.n > 0) hit++;
      if (done % 100 === 0 || done === todo.length) {
        const el = (Date.now() - t0) / 1000, rate = done / el;
        console.log(done + '/' + todo.length + ' · ' + hit + ' barcoded · ' + failed + ' failed · ' +
          rate.toFixed(1) + '/s · eta ' + Math.round((todo.length - done) / Math.max(rate, .01) / 60) + 'm');
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  console.log('\nPULL DONE. failures (not cached, re-run to retry): ' + failed);
})();
