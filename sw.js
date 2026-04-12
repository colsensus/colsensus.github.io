const CACHE_NAME = 'orion_app';
const ACACHE = 'api-cache';
const CACHE_LIST = [
 '/',
'/favicon.png',
'/index.html',
'/manifest.json',
'/sw.js'  
  ];
  
self.addEventListener('install', e => {

e.waitUntil(
caches.open(CACHE_NAME).then(cache => {
return cache.addAll(CACHE_LIST);
    })
  );
});

// activate
self.addEventListener('activate', e => {
  self.clients.claim();
});

// fetch handler (PROXY + CACHE)
self.addEventListener('fetch',event => {
const url = new URL(event.request.url);
if (url.pathname === '/proxy'){
const request=url.searchParams.get('url');
event.respondWith(proxyFetch(request));
    return;
  }
if (url.pathname.endsWith('/')) {
  event.respondWith(
  caches.match('/index.html').then(res =>{return res||fetch('/index.html');
      }));
return;
}
event.respondWith(
caches.match(event.request).then(res =>{
return res || fetch(event.request)}));
});

// proxy function
async function proxyFetch(request) {
const cache=await caches.open(ACACHE);

  try {
  const response =await fetch(request);
    const clone = response.clone();
    cache.put(request, clone);
    return response;
  } catch (e) {
    // offline fallback
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}