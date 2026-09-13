/* GLoW service worker.
 * Goal: the Tabata timer and an active workout keep working with no network.
 * Strategy:
 *   - navigation requests: network first, fall back to cached shell, then /offline
 *   - static assets: stale-while-revalidate
 *   - everything else (POST, server actions, API): straight to the network
 */
/* The page registers this worker as /sw.js?v=<build id>, so each deployment
 * gets its own cache namespace and the previous one is dropped on activate.
 * Without that the caches from the very first install would live forever. */
const VERSION = `glow-${new URL(self.location.href).searchParams.get('v') || 'dev'}`;
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;

/* Routes that must survive a dead connection. */
const PRECACHE_ROUTES = ['/offline', '/timer', '/workout', '/manifest.webmanifest', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ROUTES).catch(() => undefined)),
  );
  /* Deliberately no skipWaiting() here. A page that is already open would
   * otherwise start being served assets from a different build. The new worker
   * waits until the page asks for it, and the page reloads as it takes over. */
});

/* Drops the caches of every other deployment. */
function purgeOtherVersions() {
  return caches
    .keys()
    .then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('glow-') && !key.startsWith(VERSION))
          .map((key) => caches.delete(key)),
      ),
    );
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'glow:skip-waiting') self.skipWaiting();
  /* A page loading under this worker is the first moment the previous one is
   * certainly gone. Anything it re-cached on its way out can go now; purging
   * only on activate leaves that behind, one dead cache per deployment. */
  if (event.data?.type === 'glow:tidy') event.waitUntil(purgeOtherVersions());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    purgeOtherVersions().then(() => self.clients.claim()),
  );
});

function isAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:css|js|woff2?|png|svg|jpg|webp|ico)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          /* Only keep a page that actually loaded. Caching a 404 or a 500 -
           * which is what a page returns while a deployment is still going out
           * - pins that failure in place, and the visitor keeps being served it
           * long after the real page is live. */
          if (response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match('/offline');
          return (
            offline ??
            new Response('<!doctype html><meta charset="utf-8"><p>אין חיבור לאינטרנט</p>', {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
              status: 503,
            })
          );
        }),
    );
    return;
  }

  if (isAsset(url)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? network;
      }),
    );
  }
});

/* Wakes the page so it can flush its pending-workout queue. */
self.addEventListener('sync', (event) => {
  if (event.tag !== 'glow-sync-workouts') return;
  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => client.postMessage({ type: 'glow:flush-queue' }));
    }),
  );
});
