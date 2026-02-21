
const CACHE = 'APP_CACHE';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json',
  '/sw.js'
];
self.addEventListener('install', e => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

 if (url.search || url.hash) return;

  const isAppRoot =
    url.pathname === '/index.html'
    ||url.pathname === '/'
    ||url.pathname.startsWith('/')
    && url.pathname.endsWith('/') 
    && url.pathname !== '/';

  if (!isAppRoot) return;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match('/index.html').then(res => {
        // serve cached HTML (root page)
        if (res) return res;
        // fallback fetch
        return fetch('/index.html');
      })
    )
  );
});
