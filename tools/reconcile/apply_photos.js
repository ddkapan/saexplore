#!/usr/bin/env node
/* apply_photos.js — fold photocache/ into data.js, filling the blank photo slots.
 *
 * Unlike names.js / bold.js, photos are NOT a sidecar: `o.p` already exists on every other
 * species, the app reads it everywhere (table, drawer, highlights, tour), and precache-list.js
 * is generated from data.js. So the backfill belongs in data.js itself.
 *
 * Writes o.p = [url, licence, attribution] and, for the silhouettes, o.sil = 1 so the app can
 * label them honestly ("silhouette, not a photo") rather than passing a drawing off as a photo.
 *
 * ONLY fills species that have NO photo. Never overwrites an existing one.
 *
 *   node apply_photos.js            # rewrites ../../data.js in place
 *   node apply_photos.js --dry      # report only
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const CACHE = path.join(__dirname, 'photocache');
const DRY = process.argv.includes('--dry');
const DATA = path.join(ROOT, 'data.js');

global.window = global;
require(DATA);
const UNIC = window.UNIC;

const add = {};
let sil = 0, photo = 0;
UNIC.forEach(o => {
  if (o.p && o.p[0]) return;                        // already has one — never overwrite
  const f = path.join(CACHE, o.k + '.json');
  if (!fs.existsSync(f)) return;
  let r; try { r = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return; }
  if (!r || !r.p || !r.p[0]) return;
  add[o.k] = { p: r.p, sil: r.sil ? 1 : 0 };
  if (r.sil) sil++; else photo++;
});

const keys = Object.keys(add);
console.log('photoless species filled: ' + keys.length + ' (' + photo + ' photos, ' + sil + ' silhouettes)');
const stillBlank = UNIC.filter(o => (!o.p || !o.p[0]) && !add[o.k]).length;
console.log('still blank: ' + stillBlank);
if (DRY || !keys.length) process.exit(0);

// Rewrite data.js by re-serialising the array — the file is one `window.UNIC=[...]` line.
UNIC.forEach(o => {
  const a = add[o.k];
  if (!a) return;
  o.p = a.p;
  if (a.sil) o.sil = 1;
});
const src = fs.readFileSync(DATA, 'utf8');
const rest = src.replace(/^window\.UNIC=\[[\s\S]*?\];\n?/, '');   // keep SMETA / MAPIMG etc.
if (rest === src) { console.error('ABORT: could not find the window.UNIC=[...] assignment.'); process.exit(1); }
fs.writeFileSync(DATA, 'window.UNIC=' + JSON.stringify(UNIC) + ';\n' + rest);
console.log('data.js rewritten (' + (fs.statSync(DATA).size / 1024 / 1024).toFixed(2) + ' MB)');
