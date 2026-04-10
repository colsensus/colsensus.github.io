const CACHE_NAME = 'orion_app';

// install → cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/favicon.png',
        '/index.html',
        '/manifest.json',
        '/sw.js'
      ]);
    })
  );
});

// activate
self.addEventListener('activate', e => {
  self.clients.claim();
});

// fetch handler (PROXY + CACHE)
self.addEventListener('fetch', event => {
const url = new URL(event.request.url);

  // proxy endpoint
  if (url.pathname === '/proxy') {
const target = url.searchParams.get('url');
event.respondWith(proxyFetch(target));
    return;
  }

  // normal caching
  event.respondWith(
    caches.match(event.request).then(res => {
  return res || fetch(event.request);
    })
  );
});

// proxy function
async function proxyFetch(target) {
  const cache = await caches.open('api-cache');

  try {
  const response =await fetch(target);

    const clone = response.clone();
    cache.put(target, clone);

    return response;

  } catch (e) {
    // offline fallback
    const cached = await cache.match(target);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}