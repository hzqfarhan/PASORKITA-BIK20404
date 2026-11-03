/* PASOR caches the public preview shell only. Never add authenticated API data here. */
const BUILD_VERSION = '7541f0e240f3';
const CACHE_NAME = `pasor-shell-${BUILD_VERSION}`;
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/accounts.css",
  "/app.js",
  "/assets/books.jpg",
  "/assets/calculator.jpg",
  "/assets/camera.jpg",
  "/assets/campus-orbit.svg",
  "/assets/design.jpg",
  "/assets/favicon.svg",
  "/assets/headphones.jpg",
  "/assets/hero-scene.svg",
  "/assets/jakarta-latin.woff2",
  "/assets/lowpoly-icons.svg",
  "/assets/manrope-latin.woff2",
  "/assets/matcha.jpg",
  "/assets/nasi.jpg",
  "/assets/sneakers.jpg",
  "/atmosphere.css",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/loading.css",
  "/manifest.webmanifest",
  "/pwa.css",
  "/reviews.css",
  "/styles.css"
];
const STATIC_FILES = new Set(['/app.js', '/styles.css', '/accounts.css', '/atmosphere.css', '/reviews.css', '/pwa.css', '/manifest.webmanifest']);

function publicAsset(url) {
  return url.origin === self.location.origin && !url.searchParams.has('_rsc') && (
    STATIC_FILES.has(url.pathname) || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/_next/static/')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload', credentials: 'same-origin' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('pasor-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS' || !Array.isArray(event.data.urls)) return;
  const urls = [...new Set(event.data.urls.filter((value) => typeof value === 'string' && value.length < 4096))].slice(0, 400).filter((value) => {
    try { return publicAsset(new URL(value, self.location.origin)); } catch { return false; }
  });
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const results = await Promise.allSettled(urls.map(async (value) => {
      const url = new URL(value, self.location.origin);
      if (await cache.match(url.href)) return;
      const response = await fetch(new Request(url.href, { credentials: 'same-origin' }));
      if (!response.ok || response.type !== 'basic') throw new Error('Public asset was not available.');
      await cache.put(url.href, response);
    }));
    event.ports[0]?.postMessage({ type: 'CACHE_COMPLETE', ok: results.every((result) => result.status === 'fulfilled') });
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.headers.get('RSC') === '1' || url.searchParams.has('_rsc')) return;
  if (/^\/(?:api|auth|signin|signout|callback)(?:\/|$)/.test(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (url.pathname === '/' && response.ok && response.type === 'basic') await cache.put('/', response.clone());
        if (url.pathname === '/' && !response.ok) return await cache.match('/') || response;
        return response;
      } catch {
        return (url.pathname === '/' && await cache.match('/')) || await cache.match('/offline.html') || new Response('PASOR is offline. Reconnect to visit this page.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }

  if (!publicAsset(url)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
    return response;
  })());
});
