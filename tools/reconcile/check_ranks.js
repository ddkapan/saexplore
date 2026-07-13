#!/usr/bin/env node
/* check_ranks.js — what RANK is each corpus key, really?
 *
 * The corpus key doubles as a GBIF taxonKey (k2498252 → 2498252). That is only safe if the key
 * is a SPECIES. It is not always: 28 are genus keys (genus_fix.json), and at least one — the
 * White-fronted Plover — is `k1`, i.e. GBIF's ANIMALIA. Passing that as a taxonKey to an
 * occurrence search counts the whole kingdom (22.2M barcode records instead of a few dozen).
 *
 * So: verify the rank of every corpus key before ever using it as a taxonKey.
 * Writes rankcache.json = { corpusKey: rank }.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '../..');
global.window = global;
require(path.join(ROOT, 'data.js'));
const UNIC = window.UNIC;
const OUT = path.join(__dirname, 'rankcache.json');
const cache = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

function getJSON(url, tries) {
  tries = tries || 0;
  return new Promise(res => {
    const req = https.get(url, { headers: { 'User-Agent': 'saexplore/1.0 (dkapan@gmail.com)' } }, r => {
      let b = '';
      r.on('data', d => b += d);
      r.on('end', async () => {
        if (r.statusCode === 200) { try { return res(JSON.parse(b)); } catch (e) {} }
        if (r.statusCode === 404) return res({ rank: 'MISSING' });
        if (tries < 3) { await new Promise(s => setTimeout(s, 600 * (tries + 1))); return res(await getJSON(url, tries + 1)); }
        res(null);
      });
    });
    req.on('error', async () => {
      if (tries < 3) { await new Promise(s => setTimeout(s, 600 * (tries + 1))); return res(await getJSON(url, tries + 1)); }
      res(null);
    });
    req.setTimeout(25000, () => req.destroy());
  });
}

(async () => {
  const todo = UNIC.filter(o => !cache[o.k]);
  console.log('keys: ' + UNIC.length + ' · cached: ' + (UNIC.length - todo.length) + ' · to check: ' + todo.length);
  let i = 0, done = 0;
  async function worker() {
    while (i < todo.length) {
      const o = todo[i++];
      const key = String(o.k).replace(/^k/, '');
      const j = await getJSON('https://api.gbif.org/v1/species/' + key);
      if (j && j.rank) cache[o.k] = j.rank;          // failures simply stay unrecorded
      if (++done % 250 === 0) { console.log(done + '/' + todo.length); fs.writeFileSync(OUT, JSON.stringify(cache)); }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  fs.writeFileSync(OUT, JSON.stringify(cache));

  const byRank = {};
  UNIC.forEach(o => { const r = cache[o.k] || 'UNKNOWN'; byRank[r] = (byRank[r] || 0) + 1; });
  console.log('\nRANKS:', JSON.stringify(byRank, null, 1));
  const bad = UNIC.filter(o => cache[o.k] && cache[o.k] !== 'SPECIES' && cache[o.k] !== 'SUBSPECIES');
  console.log('\nNON-SPECIES corpus keys (' + bad.length + ') — must NOT be used as a taxonKey:');
  bad.slice(0, 40).forEach(o => console.log('  ' + o.k + '  ' + cache[o.k].padEnd(10) + (o.c || '') + ' / ' + o.s));
})();
