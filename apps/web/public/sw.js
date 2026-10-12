// NEEDX service worker — hand-rolled, no Workbox dependency.
//
// Strategy:
//  - App shell (/, /offline, static assets under /_next/static, /icons/*):
//    cache-first, so repeat visits and poor connections are fast.
//  - Everything else (API calls, auth pages, dashboards, payments, orders,
//    messages): network-only, per spec's "do NOT blindly cache payments,
//    orders, private messages, authentication, sensitive account data."
//  - Navigation requests that fail (offline, no cache entry): fall back to
//    the /offline page instead of a browser error screen.

const CACHE_NAME = 'needx-shell-v1';
const OFFLINE_URL = '/offline';

const NEVER_CACHE_PATTERNS = [
  /^\/api\//,
  /^\/dashboard/,
  /^\/provider/,
  /^\/admin/,
  /^\/login/,
  /^\/register/,
  /^\/forgot-password/,
  /^\/verify/,
  /^\/pay\//,
];

const PRECACHE_URLS = ['/', OFFLINE_URL];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isNeverCache(url) {
  return NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname === '/manifest.webmanifest';
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // never intercept mutating requests

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never cache cross-origin (API, sockets)

  if (isNeverCache(url)) {
    return; // let the browser handle it directly — no cache involvement at all
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(request)) || (await cache.match(OFFLINE_URL));
        }),
    );
  }
});
