/* Southern Africa Species Explorer — service worker
   Precaches the app shell (index.html + data.js + app.js) and all matrix
   thumbnails on install, and runtime-caches iNaturalist / Wikimedia medium
   photos, Wikipedia/iNat account responses, and GBIF/eBird links as they are
   viewed. After the first online load + "Add to Home Screen", the app works
   fully offline. Bump CACHE when data.js or app.js change. */
importScripts('./precache-list.js');

var CACHE = 'sa-explorer-v2';
var SHELL = ['./', './index.html', './data.js', './app.js', './manifest.json', './icon.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL).then(function () {
        var urls = self.PRECACHE_URLS || [];
        // Cache thumbnails opaquely; ignore individual failures so install still completes.
        return Promise.all(urls.map(function (u) {
          return c.add(new Request(u, { mode: 'no-cors' })).catch(function () {});
        }));
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (resp) {
        // Runtime-cache the external data the app relies on (photos, accounts, links).
        if (/inaturalist|wikimedia|gbif|ebird|wikipedia/.test(url)) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return resp;
      }).catch(function () {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504 });
      });
    })
  );
});
