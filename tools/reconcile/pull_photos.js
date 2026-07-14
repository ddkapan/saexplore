#!/usr/bin/env node
/* pull_photos.js — find a CC-licensed photo for the 270 species that have none.
 *
 * WHY: 270 of 2,780 species render as a blank grey square. CC images DO exist for them — the
 * photoless beetle Promeces longipes has 872 GBIF occurrences WITH images, the first CC BY-NC
 * from iNaturalist. They were missed because the corpus only took iNaturalist's *taxon default
 * photo*; a species with no default photo got nothing, even when its OBSERVATIONS have photos.
 *
 * SOURCE CHAIN (first hit wins):
 *   1. GBIF occurrence media (mediaType=StillImage) — by far the richest. In practice these are
 *      iNaturalist observation photos, i.e. the same CORS-friendly host we already precache.
 *   2. Wikimedia Commons — by species name.
 *   3. PhyloPic — a CC0 silhouette, so nothing is ever blank offline.
 *
 * TWO HARD RULES:
 *   • SPECIES-EXACT. A genus/kingdom taxonKey returns photos of the WRONG ANIMAL. 27 corpus keys
 *     are coarse (25 genus, 1 phylum, 1 KINGDOM — the plover is k1 = Animalia). We reuse
 *     rankcache.json and re-resolve by name, exactly as pull_bold.js does. A wrong photo is worse
 *     than no photo.
 *   • CORS-ONLY HOSTS. The offline precache fetches with cors; an image from a host without
 *     Access-Control-Allow-Origin caches as a blank. So we only accept known-good hosts.
 *
 * Licences: CC only (cc0/by/by-sa/by-nc/by-nc-sa/by-nc-nd), matching the corpus's existing
 * discipline. Anything else (©, unspecified) is refused.
 *
 * Cache: photocache/<key>.json (resumable, gitignored). Failures are NEVER cached.
 * Output: photos.json → folded into data.js by apply_photos.js.
 *
 *   node pull_photos.js [--limit N]
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '../..');
const CACHE = path.join(__dirname, 'photocache');
if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });

global.window = global;
require(path.join(ROOT, 'data.js'));
require(path.join(ROOT, 'names.js'));
const UNIC = window.UNIC, NAMES = window.NAMES || {};
const RANK = require('./rankcache.json');

const argLimit = (() => { const i = process.argv.indexOf('--limit'); return i > 0 ? +process.argv[i + 1] : 0; })();
const CONC = 5;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sciOf = o => { const n = NAMES[o.k]; return (n && n.sp) || o.s || ''; };
const isBinomial = s => /^[A-Z][a-z-]+ [a-z][a-z-]+$/.test((s || '').trim());

function get(url, tries, headers, hops) {
  tries = tries || 0; hops = hops || 0;
  return new Promise(res => {
    const req = https.get(url, { headers: Object.assign({ 'User-Agent': 'saexplore/1.0 (field guide; dkapan@gmail.com)' }, headers || {}) }, r => {
      // PhyloPic's API answers 307 on every path. Without following redirects it looks like a
      // dead API and the whole silhouette fallback silently never fires.
      if ([301, 302, 303, 307, 308].includes(r.statusCode) && r.headers.location && hops < 4) {
        r.resume();
        const next = new URL(r.headers.location, url).toString();
        return get(next, tries, headers, hops + 1).then(res);
      }
      let b = '';
      r.on('data', d => b += d);
      r.on('end', async () => {
        if (r.statusCode === 200) { try { return res(JSON.parse(b)); } catch (e) { } }
        if (tries < 3) { await sleep(700 * Math.pow(2, tries)); return res(await get(url, tries + 1, headers)); }
        res(null);                                   // failure → caller must NOT cache
      });
    });
    req.on('error', async () => {
      if (tries < 3) { await sleep(700 * Math.pow(2, tries)); return res(await get(url, tries + 1, headers)); }
      res(null);
    });
    req.setTimeout(30000, () => req.destroy());
  });
}

// ---- licences: CC only, normalised to the corpus's short codes ----
function licOf(s) {
  s = String(s || '').toLowerCase();
  if (/publicdomain\/zero|cc0/.test(s)) return 'cc0';
  if (/licenses\/by-nc-sa/.test(s)) return 'cc-by-nc-sa';
  if (/licenses\/by-nc-nd/.test(s)) return 'cc-by-nc-nd';
  if (/licenses\/by-nc/.test(s)) return 'cc-by-nc';
  if (/licenses\/by-sa/.test(s)) return 'cc-by-sa';
  if (/licenses\/by-nd/.test(s)) return 'cc-by-nd';
  if (/licenses\/by/.test(s)) return 'cc-by';
  if (/public\s*domain|publicdomain/.test(s)) return 'pd';
  return '';                                          // ©/unknown → refuse
}

// ---- hosts we can actually cache offline (verified Access-Control-Allow-Origin: *) ----
const OK_HOST = /^(inaturalist-open-data\.s3\.amazonaws\.com|static\.inaturalist\.org|upload\.wikimedia\.org|images\.phylopic\.org)$/;
// iNat serves /photos/<id>/original.jpg — take the square thumb instead, KEEPING the extension
// (square.jpeg 404s when the original is .jpg; that mistake would have blanked every backfill).
function thumb(u) {
  const m = u.match(/^(https:\/\/(?:inaturalist-open-data\.s3\.amazonaws\.com|static\.inaturalist\.org)\/photos\/\d+\/)[a-z]+(\.[a-z]+)$/i);
  return m ? (m[1] + 'square' + m[2]) : u;
}
function hostOf(u) { try { return new URL(u).host; } catch (e) { return ''; } }

// ---- taxonKey, species-exact (same guard as pull_bold.js) ----
const keyCache = {};
async function matchSpecies(nm) {
  if (keyCache[nm] !== undefined) return keyCache[nm];
  const j = await get('https://api.gbif.org/v1/species/match?name=' + encodeURIComponent(nm));
  keyCache[nm] = (j && j.usageKey && j.rank === 'SPECIES') ? j.usageKey : 0;
  return keyCache[nm];
}
async function taxonKeyFor(o) {
  const rank = RANK[o.k];
  if (rank === 'SPECIES' || rank === 'SUBSPECIES') return +String(o.k).replace(/^k/, '');
  const n = NAMES[o.k] || {};
  const cands = [sciOf(o), o.s].concat(n.s || []).filter(isBinomial);
  for (const nm of cands) { const k = await matchSpecies(nm); if (k) return k; }
  return 0;   // no species key → fall back to name-based sources only
}

// ---- 1. GBIF occurrence media ----
async function fromGBIF(tk) {
  if (!tk) return null;
  const j = await get('https://api.gbif.org/v1/occurrence/search?taxonKey=' + tk +
    '&mediaType=StillImage&limit=40');
  if (!j || !j.results) return null;
  const cands = [];
  j.results.forEach(r => (r.media || []).forEach(m => {
    const u = m.identifier || '';
    const lic = licOf(m.license);
    if (!u || !lic) return;
    if (!OK_HOST.test(hostOf(u))) return;            // must be cacheable offline
    const who = m.rightsHolder || m.creator || '';
    cands.push({ u: thumb(u), lic: lic, who: who, pub: m.publisher || '' });
  }));
  if (!cands.length) return null;
  // prefer the most permissive licence, then a named author
  const rank = { cc0: 0, 'cc-by': 1, 'cc-by-sa': 2, pd: 2, 'cc-by-nc': 3, 'cc-by-nc-sa': 4, 'cc-by-nc-nd': 5, 'cc-by-nd': 5 };
  cands.sort((a, b) => (rank[a.lic] - rank[b.lic]) || ((b.who ? 1 : 0) - (a.who ? 1 : 0)));
  const c = cands[0];
  const attr = (c.who ? '(c) ' + c.who + ', some rights reserved' : 'some rights reserved') +
    (c.pub ? ' · via ' + c.pub : ' · via GBIF');
  return { p: [c.u, c.lic, attr], src: 'gbif' };
}

// ---- 2. Wikimedia Commons ----
// DANGER: a Commons free-text search happily returns a photo of a DIFFERENT species. So we only
// accept a file whose TITLE carries a name we know to be this species: the accepted name, the
// resolved name, or a names.js synonym. If the title uses some other genus, we ask GBIF whether
// that name resolves to the same species (that is how Elaiophis inornatus legitimately matches
// "Lycodonomorphus_inornatus.jpg" — same snake, older genus). Anything else is refused.
// A wrong photo is worse than no photo: Shannon would key off it in the field.
async function commonsNameOK(title, o, tk, known) {
  const t = title.toLowerCase().replace(/[_\-%\d]+/g, ' ');
  if (known.some(n => t.includes(n.toLowerCase()))) return true;
  const m = t.match(/([a-z]{4,})\s+([a-z]{4,})/);            // a "genus epithet" pair in the title
  if (!m || !tk) return false;
  const ourEpithet = (sciOf(o).split(' ')[1] || '').toLowerCase();
  if (m[2] !== ourEpithet) return false;                      // epithet must match ours
  const cand = m[1][0].toUpperCase() + m[1].slice(1) + ' ' + m[2];
  const j = await get('https://api.gbif.org/v1/species/match?name=' + encodeURIComponent(cand));
  if (!j) return false;
  const key = j.acceptedUsageKey || j.usageKey;
  return !!key && key === tk;                                // same species → it's a synonym
}
async function fromCommons(o, tk, known) {
  const name = sciOf(o);
  if (!name) return null;
  const j = await get('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search' +
    '&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + name) + '&gsrlimit=6&gsrnamespace=6' +
    '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=250');
  const pages = j && j.query && j.query.pages;
  if (!pages) return null;
  for (const id of Object.keys(pages)) {
    const pg = pages[id];
    const ii = (pg.imageinfo || [])[0];
    if (!ii) continue;
    const em = ii.extmetadata || {};
    const lic = licOf((em.LicenseUrl && em.LicenseUrl.value) || (em.License && em.License.value) || '');
    if (!lic) continue;
    const u = ii.thumburl || ii.url;
    if (!u || !OK_HOST.test(hostOf(u))) continue;
    if (!await commonsNameOK(pg.title || u, o, tk, known)) continue;   // ← the wrong-species guard
    const who = ((em.Artist && em.Artist.value) || '').replace(/<[^>]*>/g, '').trim().slice(0, 60);
    return { p: [u, lic, (who ? '(c) ' + who + ', ' : '') + 'via Wikimedia Commons'], src: 'commons' };
  }
  return null;
}

// ---- 3. PhyloPic — a CC0 silhouette, so nothing is ever blank offline ----
// The truly obscure species (Cephalelus leafhoppers, Tolypocladium fungi) have no CC photo
// anywhere, so we fall back to a silhouette of the nearest taxon we DO have: genus → family →
// order → class → group. It is honestly labelled a silhouette, never passed off as a photo.
// NOTE: filter_name must be LOWERCASE — PhyloPic silently returns 0 items otherwise.
let PP_BUILD = 0;
async function ppBuild() {
  if (PP_BUILD) return PP_BUILD;
  const j = await get('https://api.phylopic.org/');
  PP_BUILD = (j && j.build) || 0;
  return PP_BUILD;
}
// A handful of corpus records carry NO family/order/class (manually-added stubs). Without higher
// taxa the silhouette ladder falls all the way to 'biota' — a generic blob for what is actually a
// snake. So: ask GBIF for the species' higher taxonomy, and for names GBIF doesn't know either,
// fall back to a tiny hand-verified map.
const HAND_TAXA = {
  // Olive House Snake. GBIF's backbone has no `Elaiophis`; Commons files it under the older
  // Lycodonomorphus inornatus, which is the same snake (confirmed while validating the photo).
  'Elaiophis inornatus': { f: 'Lamprophiidae', o: 'Squamata', cl: 'Reptilia' },
};
async function higherTaxa(o) {
  if (o.f || o.o || o.cl) return { f: o.f, o: o.o, cl: o.cl };
  const sci = sciOf(o);
  if (HAND_TAXA[sci]) return HAND_TAXA[sci];
  const j = await get('https://api.gbif.org/v1/species/match?name=' + encodeURIComponent(sci));
  if (j && (j.family || j.order || j.class)) return { f: j.family, o: j.order, cl: j.class };
  return { f: '', o: '', cl: '' };
}

async function fromPhyloPic(o) {
  const build = await ppBuild();
  if (!build) return null;
  const sci = sciOf(o);
  const ht = await higherTaxa(o);
  // Last resort: the corpus group. A few records carry no family/order/class at all (the Olive
  // House Snake is one), and 'Other' is not a taxon PhyloPic knows — so map the group to a real
  // clade, ending at 'biota' (all life). This is what guarantees no row is ever blank offline.
  const GROUP_PP = {
    Aves: 'aves', Mammalia: 'mammalia', Reptilia: 'squamata', Amphibia: 'amphibia',
    Actinopterygii: 'actinopterygii', Insecta: 'insecta', Arachnida: 'arachnida',
    Mollusca: 'mollusca', Plantae: 'tracheophyta', Other: 'biota'
  };
  const ladder = [(sci.split(' ')[0] || ''), ht.f, ht.o, ht.cl, GROUP_PP[o.g], 'biota'].filter(Boolean);
  for (const taxon of ladder) {
    const nodes = await get('https://api.phylopic.org/nodes?filter_name=' + encodeURIComponent(String(taxon).toLowerCase()) +
      '&build=' + build + '&page=0');
    const item = nodes && nodes._links && nodes._links.items && nodes._links.items[0];
    if (!item) continue;
    const node = await get('https://api.phylopic.org' + item.href);
    const pi = node && node._links && node._links.primaryImage;
    if (!pi) continue;
    const img = await get('https://api.phylopic.org' + pi.href);
    const files = (img && img._links && img._links.rasterFiles) || [];
    const small = files[files.length - 1] || files[0];        // smallest raster
    if (!small || !small.href || !OK_HOST.test(hostOf(small.href))) continue;
    const who = (img && img.attribution) || '';
    return { p: [small.href, 'cc0', 'silhouette of ' + taxon + (who ? ' · ' + who : '') + ' · PhyloPic (CC0)'], src: 'phylopic', silhouette: 1 };
  }
  return null;
}

async function one(o) {
  const f = path.join(CACHE, o.k + '.json');
  if (fs.existsSync(f)) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { } }
  const name = sciOf(o);
  const tk = await taxonKeyFor(o);
  const n = NAMES[o.k] || {};
  const known = [name, o.s].concat(n.s || []).filter(isBinomial);   // every name we accept as "this species"
  let hit = await fromGBIF(tk);
  if (!hit) hit = await fromCommons(o, tk, known);
  if (!hit) hit = await fromPhyloPic(o);
  if (!hit) return null;                              // NOT cached — re-runnable
  const rec = { k: o.k, name: name, tk: tk, p: hit.p, src: hit.src, sil: hit.silhouette ? 1 : 0 };
  fs.writeFileSync(f, JSON.stringify(rec));
  return rec;
}

(async () => {
  let list = UNIC.filter(o => !o.p || !o.p[0]);
  if (argLimit) list = list.slice(0, argLimit);
  const todo = list.filter(o => !fs.existsSync(path.join(CACHE, o.k + '.json')));
  console.log('photoless: ' + list.length + ' · cached: ' + (list.length - todo.length) + ' · to pull: ' + todo.length);

  let i = 0, done = 0, none = 0;
  const by = {};
  async function worker() {
    while (i < todo.length) {
      const o = todo[i++];
      const r = await one(o);
      done++;
      if (!r) none++; else by[r.src] = (by[r.src] || 0) + 1;
      if (done % 40 === 0 || done === todo.length) console.log(done + '/' + todo.length + ' · ' + JSON.stringify(by) + ' · none: ' + none);
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  console.log('\nDONE. found: ' + JSON.stringify(by) + ' · still none: ' + none);
})();
