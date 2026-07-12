#!/usr/bin/env node
/* pull_ebird.js — fetch the eBird/Clements taxonomy and reduce it to the codes we use.
 *
 * Birds are canonicalised on eBird (not iNat) so exports can join eBird checklists /
 * trip reports — the join key is the eBird species code (already in our corpus, see
 * ebird_codes.json). This pulls eBird's authoritative common + scientific name per code.
 *
 * The whole taxonomy comes back in ONE call (~17k rows). Needs a free eBird API token:
 *   export EBIRD_API_TOKEN=xxxxxxxxxxxx      (get one at https://ebird.org/api/keygen)
 *   node pull_ebird.js
 * Writes ebird_taxonomy.json = { speciesCode: {com, sci, family, order} } for our codes.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.EBIRD_API_TOKEN || process.env.EBIRDAPITOKEN || '';
if (!TOKEN) { console.error('Set EBIRD_API_TOKEN first (https://ebird.org/api/keygen).'); process.exit(2); }

const DIR = __dirname;
const codesMap = require('./ebird_codes.json');           // corpusKey -> speciesCode
const wanted = new Set(Object.values(codesMap));
// Lesser Honeyguide (Indicator minor) has no code in the site data — add its eBird code.
wanted.add('leshon1');

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'x-ebirdapitoken': TOKEN, 'User-Agent': 'saexplore' } }, r => {
      if (r.statusCode !== 200) { rej(new Error('HTTP ' + r.statusCode)); r.resume(); return; }
      let b = ''; r.on('data', d => b += d); r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}

(async () => {
  console.log('fetching full eBird taxonomy (one call)…');
  const tax = await get('https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json');
  console.log('  got', tax.length, 'taxa');
  const out = {};
  for (const t of tax) {
    if (!wanted.has(t.speciesCode)) continue;
    out[t.speciesCode] = {
      com: t.comName || '',
      sci: t.sciName || '',
      family: t.familyComName || t.familySciName || '',
      order: t.order || '',
      cat: t.category || '',
    };
  }
  fs.writeFileSync(path.join(DIR, 'ebird_taxonomy.json'), JSON.stringify(out));
  const hit = Object.keys(out).length;
  console.log('matched', hit, 'of', wanted.size, 'codes →', 'ebird_taxonomy.json');
  const missing = [...wanted].filter(c => !out[c]);
  if (missing.length) console.log('  UNMATCHED codes (check for retired/renamed):', missing.join(' '));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
