/* Southern Africa Species Explorer — service worker

   OFFLINE MODEL (rewritten 1.0.32 to fix cache loss on updates):
   - Two caches, on purpose:
       SHELL_CACHE  (versioned)  — the small app shell: index.html, data.js, names.js,
                                   app.js, manifest, icon. Re-fetched when the version bumps.
       MEDIA_CACHE  (stable)     — every image + account response. NEVER wiped on a version
                                   bump, so the ~1,300 bird thumbnails don't vanish (and don't
                                   re-download) each time we ship code.
   - Install caches the shell item-by-item (one bad URL can't nuke the whole cache) and only
     takes over (skipWaiting) AFTER the shell is safely stored. Image precache is best-effort,
     chunked, and never blocks or fails the install.
   - Activate deletes only OLD shell caches — never the media cache.
   This is why "content disappeared from the cache" happened before: a single versioned cache
   was deleted on every bump and re-populated by a precache that could be interrupted offline.

   Bump SHELL_CACHE when data.js / names.js / app.js / index.html change. */
importScripts('./precache-list.js');

var SHELL_CACHE = 'sa-shell-v17';   // ← bump on shell change
var MEDIA_CACHE = 'sa-media-v1';    // ← stable; keep across shell bumps
var SHELL = ['./', './index.html', './data.js', './names.js', './app.js', './manifest.json', './icon.svg'];

// Cache the shell resiliently: per-item, so one failed URL doesn't reject the whole install.
function cacheShell(c) {
  return Promise.all(SHELL.map(function (u) {
    return c.add(new Request(u, { cache: 'reload' })).catch(function () { /* network-first recovers online */ });
  }));
}

// Chunked, resumable image precache: skip anything already cached (survives version bumps),
// small concurrency, every failure swallowed. Returns when the whole list has been attempted.
function precacheImages(cache, urls, onProgress) {
  var i = 0, done = 0, CONC = 6;
  function worker() {
    if (i >= urls.length) return Promise.resolve();
    var u = urls[i++];
    return cache.match(u).then(function (hit) {
      if (hit) return;
      return cache.add(new Request(u, { mode: 'no-cors' })).catch(function () {});
    }).then(function () { done++; if (onProgress && done % 25 === 0) onProgress(done); return worker(); });
  }
  var ws = []; for (var k = 0; k < CONC && k < urls.length; k++) ws.push(worker());
  return Promise.all(ws);
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(cacheShell).then(function () {
      // best-effort thumbnail precache into the STABLE media cache — never blocks/fails install
      caches.open(MEDIA_CACHE).then(function (m) {
        return precacheImages(m, self.PRECACHE_URLS || []);
      }).catch(function () {});
    }).then(function () { return self.skipWaiting(); })   // take over only after the shell is safe
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        // delete only stale SHELL caches — the media cache is intentionally kept
        if (k !== SHELL_CACHE && k !== MEDIA_CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // App shell: NETWORK-FIRST so a new deploy is picked up online; fall back to cache offline.
    e.respondWith(
      fetch(e.request).then(function (resp) {
        var copy = resp.clone();
        caches.open(SHELL_CACHE).then(function (c) { c.put(e.request, copy); });
        return resp;
      }).catch(function () {
        return caches.match(e.request).then(function (hit) {
          if (hit) return hit;
          if (e.request.mode === 'navigate') return caches.match('./index.html');
          return new Response('', { status: 504 });
        });
      })
    );
  } else {
    // External media / accounts: CACHE-FIRST for speed + offline; runtime-cache into MEDIA_CACHE.
    e.respondWith(
      caches.match(e.request).then(function (hit) {
        if (hit) return hit;
        return fetch(e.request).then(function (resp) {
          if (/inaturalist|wikimedia|gbif|ebird|wikipedia/.test(url.href)) {
            var copy = resp.clone();
            caches.open(MEDIA_CACHE).then(function (c) { c.put(e.request, copy); });
          }
          return resp;
        }).catch(function () { return new Response('', { status: 504 }); });
      })
    );
  }
});

// ---- app <-> worker messages: offline-readiness status + on-demand "save for offline" ----
self.addEventListener('message', function (e) {
  var d = e.data || {}, src = e.source;
  if (d.type === 'cache-status') {
    Promise.all([
      caches.open(SHELL_CACHE).then(function (c) { return c.keys(); }),
      caches.open(MEDIA_CACHE).then(function (c) { return c.keys(); })
    ]).then(function (r) {
      src && src.postMessage({
        type: 'cache-status',
        shell: r[0].length, shellTotal: SHELL.length,
        media: r[1].length, mediaTotal: (self.PRECACHE_URLS || []).length
      });
    });
  } else if (d.type === 'save-offline') {
    caches.open(MEDIA_CACHE).then(function (m) {
      return precacheImages(m, self.PRECACHE_URLS || [], function (n) {
        src && src.postMessage({ type: 'save-progress', done: n, total: (self.PRECACHE_URLS || []).length });
      });
    }).then(function () { src && src.postMessage({ type: 'save-offline-done' }); });
  }
});
