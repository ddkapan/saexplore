#!/usr/bin/env node
/* gen_precache.js — regenerate ../../precache-list.js from data.js.
 *
 * Every species photo URL, deduped. The page-side "save photos for offline" walks this list.
 *
 * This exists because the list was once hand-generated and went STALE (1,315 urls for a corpus
 * of 2,501 photos — see CHANGELOG 1.0.47): ~1,186 species were blank offline. Any change to
 * photos in data.js MUST be followed by `node gen_precache.js`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
global.window = global;
require(path.join(ROOT, 'data.js'));

const urls = [];
const seen = new Set();
window.UNIC.forEach(o => {
  const u = o.p && o.p[0];
  if (!u || seen.has(u)) return;
  seen.add(u);
  urls.push(u);
});

const hosts = {};
urls.forEach(u => { try { const h = new URL(u).host; hosts[h] = (hosts[h] || 0) + 1; } catch (e) { } });

const body = '/* Auto-generated thumbnail precache list (' + urls.length + ' urls) — every species photo.\n' +
  ' * Regenerate with: node tools/reconcile/gen_precache.js  (after ANY photo change in data.js)\n' +
  ' * Hosts: ' + Object.keys(hosts).map(h => h + ' ' + hosts[h]).join(' · ') + '\n' +
  ' * All hosts must send Access-Control-Allow-Origin — the precache fetches with cors, and an\n' +
  ' * opaque response caches as a blank image.\n' +
  ' */\n' +
  'self.PRECACHE_URLS=' + JSON.stringify(urls) + ';\n';
fs.writeFileSync(path.join(ROOT, 'precache-list.js'), body);

console.log('precache-list.js: ' + urls.length + ' urls');
Object.keys(hosts).forEach(h => console.log('  ' + h + ': ' + hosts[h]));
const missing = window.UNIC.filter(o => !o.p || !o.p[0]).length;
console.log('species with no photo at all: ' + missing);
