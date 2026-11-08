/* ============================================================
 * Ethiopian Insurance Corporation — Service Worker
 *
 * Strategy:
 *  - Shell (HTML, CSS, manifest, icons, vendor/xlsx.full.min.js):
 *      cache-first. Pre-cached on install.
 *  - Font files (./fonts/*.woff2): stale-while-revalidate. Lazy-cached
 *      on first fetch. They're versioned by Google Fonts; safe to keep.
 *  - JSON data files (./data/*.json): network-first with cache fallback.
 *      Updates flow through automatically when online; offline uses
 *      the last-seen copy.
 *  - index.html itself: network-first with cache fallback so a new
 *      deploy replaces the old shell, but offline still loads.
 *  - Cross-origin requests (none expected): passthrough, no cache.
 * ============================================================ */

const CACHE_VERSION = 'eic-v5.0.0';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const DATA_CACHE  = `data-${CACHE_VERSION}`;
const FONT_CACHE  = `fonts-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './fonts.css',
  './README.md',
  './vendor/xlsx.full.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
  './icons/eic-logo.png',
];

/* ---------- install: pre-cache the shell only (data + fonts cached lazily) ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((c) => c.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[sw] install failed:', err))
  );
});

/* ---------- activate: clear old caches, claim clients ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![SHELL_CACHE, DATA_CACHE, FONT_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------- fetch: route by URL ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* Only handle same-origin requests. Anything else (e.g. an errant
     Google Fonts call) is passed straight to the network. */
  if (url.origin !== self.location.origin) return;

  /* 1. index.html — network-first with cache fallback (so deploys take effect
     on next reload when online, but offline still works). */
  if (url.pathname.endsWith('/index.html') || url.pathname === '/' ||
      url.pathname.endsWith('/insurance-renewal-manager/') ||
      url.pathname === '/insurance-renewal-manager/index.html') {
    event.respondWith(networkFirst(req, SHELL_CACHE));
    return;
  }

  /* 2. data/*.json — network-first with cache fallback. Updates flow through. */
  if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(req, DATA_CACHE, 30 * 24 * 60 * 60 /* 30d */));
    return;
  }

  /* 3. fonts/*.woff2 + fonts.css — stale-while-revalidate. */
  if (url.pathname.endsWith('.woff2') || url.pathname.endsWith('/fonts.css')) {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
    return;
  }

  /* 4. Other shell assets (manifest, icons, vendor/xlsx.full.min.js, README) — cache-first. */
  if (
    url.pathname.endsWith('/manifest.json') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('/vendor/xlsx.full.min.js') ||
    url.pathname.endsWith('/README.md')
  ) {
    event.respondWith(cacheFirst(req, SHELL_CACHE));
    return;
  }

  /* 5. Hash-routed navigation requests (e.g. #policies, #alerts) — these are
     same-URL document navigations, so they fall through to the network-first
     HTML handler above via the index.html match. If we got here it's a
     non-GET request or something unexpected — pass through. */
});

/* ============================================================
 * Caching strategies
 * ============================================================ */

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (e) {
    return cached || Response.error();
  }
}

async function networkFirst(req, cacheName, maxAgeSec = null) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic') {
      const clone = res.clone();
      if (maxAgeSec) {
        // Stash a timestamp header so we can age it later
        const ts = new Headers(res.headers);
        ts.set('x-cached-at', Math.floor(Date.now() / 1000).toString());
        const stamped = new Response(await res.clone().blob(), { status: res.status, statusText: res.statusText, headers: ts });
        cache.put(req, stamped.clone());
      } else {
        cache.put(req, clone);
      }
    }
    return res;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) {
      if (maxAgeSec) {
        const ts = parseInt(cached.headers.get('x-cached-at') || '0', 10);
        const ageSec = Math.floor(Date.now() / 1000) - ts;
        const warn = new Headers(cached.headers);
        warn.set('x-cache-age', ageSec.toString());
        warn.set('x-offline', '1');
        return new Response(cached.body, { status: cached.status, statusText: cached.statusText, headers: warn });
      }
      return cached;
    }
    return Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}

/* ---------- message handler: skipWaiting on demand (for the "Apply update" button) ---------- */
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
