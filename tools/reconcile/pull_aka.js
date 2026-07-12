#!/usr/bin/env node
/* pull_aka.js — restore "Also known as" for genus-collapsed records.
 *
 * The coarse-key guard (build_names.js) skips GBIF synonyms/vernaculars when the corpus
 * key is a genus (they'd be genus-level names). But these records DO resolve to a species
 * (names.js `sp`), so we pull the SPECIES' aliases instead: match sp → species usageKey →
 * /synonyms + /vernacularNames. Output aka_fix.json = { corpusKey: {s[], v[], l{}} },
 * folded into names.js by build_names.js. Union, never exclude.
 */
const fs = require('fs'), https = require('https');
const lost = require('/tmp/lost_aka.json');   // [{k, c, sp, rank}]
const SA = { afr: 1, zul: 1, xho: 1, nso: 1, sot: 1, tsn: 1, ssw: 1, ven: 1, tso: 1, nbl: 1 };
const A2 = { af: 'afr', zu: 'zul', xh: 'xho', st: 'sot', tn: 'tsn', ss: 'ssw', ve: 'ven', ts: 'tso', nr: 'nbl', en: 'eng' };
const norm = s => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
function get(u) { return new Promise(res => { https.get(u, { headers: { 'User-Agent': 'saexplore' } }, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => { try { res(JSON.parse(b)); } catch { res(null); } }); }).on('error', () => res(null)); }); }

(async () => {
  const out = {};
  for (const rec of lost) {
    const epithet = norm(rec.sp).split(' ')[1] || '';
    const m = await get('https://api.gbif.org/v1/species/match?name=' + encodeURIComponent(rec.sp));
    let key = m && (m.rank === 'SPECIES' ? m.usageKey : m.acceptedUsageKey);
    let oldName = '';
    if (!key) {
      // GBIF backbone lag: the modern binomial matches only to genus. Find the species by
      // shared epithet via search — it lives under its old-genus (accepted) name in GBIF.
      // Include synonyms: the modern binomial is often only in source checklists (no nubKey),
      // while the OLD-genus name is a backbone synonym WITH a nubKey we can pull aliases from.
      const sr = await get('https://api.gbif.org/v1/species/search?q=' + encodeURIComponent(rec.sp) + '&rank=SPECIES&limit=20');
      const hit = (sr && sr.results || []).find(r => r.nubKey && r.canonicalName && norm(r.canonicalName).split(' ')[1] === epithet);
      if (hit) { key = hit.nubKey; oldName = hit.canonicalName; }
    }
    if (!key) { console.log('  no species key for', rec.sp); continue; }
    const have = new Set([norm(rec.c), norm(rec.sp)]);
    const s = [], v = [], l = {};
    if (oldName && !have.has(norm(oldName))) { have.add(norm(oldName)); s.push(oldName); }  // old-genus binomial
    const sj = await get('https://api.gbif.org/v1/species/' + key + '/synonyms?limit=100');
    (sj && sj.results || []).forEach(r => { const nm = (r.canonicalName || r.scientificName || '').trim(); const k = norm(nm); if (nm && !have.has(k)) { have.add(k); if (!s.some(x => norm(x) === k)) s.push(nm); } });
    const vj = await get('https://api.gbif.org/v1/species/' + key + '/vernacularNames?limit=100');
    (vj && vj.results || []).forEach(r => { let lang = (r.language || '').toLowerCase(); if (A2[lang]) lang = A2[lang]; const nm = (r.vernacularName || '').trim(); if (!nm) return; const k = norm(nm); if (lang === 'eng') { if (!have.has(k)) { have.add(k); if (!v.some(x => norm(x) === k)) v.push(nm); } } else if (SA[lang]) { (l[lang] = l[lang] || []); if (!l[lang].some(x => norm(x) === k)) l[lang].push(nm); } });
    const r = {};
    if (s.length) r.s = s.slice(0, 8);
    if (v.length) r.v = v.slice(0, 6);
    if (Object.keys(l).length) { r.l = {}; Object.keys(l).forEach(k => r.l[k] = l[k].slice(0, 4)); }
    if (r.s || r.v || r.l) out[rec.k] = r;
    console.log(rec.c || rec.sp, '→ sp key', key, '|', (r.s || []).length, 'syn,', (r.v || []).length, 'eng,', Object.keys(r.l || {}).length, 'SA-lang');
  }
  fs.writeFileSync(__dirname + '/aka_fix.json', JSON.stringify(out));
  console.log('\nwrote aka_fix.json for', Object.keys(out).length, 'records');
})();
