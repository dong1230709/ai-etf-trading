const CACHE_NAME = 'ai-etf-trading-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const API_CACHE_NAME = 'api-cache-v1';
const API_CACHE_DURATION = 5 * 60 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
  }
});

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    const cachedTime = cached.headers.get('cached-time');
    if (cachedTime && Date.now() - parseInt(cachedTime) < API_CACHE_DURATION) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('cached-time', Date.now().toString());
      
      const cachedResponse = new Response(await response.clone().text(), {
        status: response.status,
        statusText: response.statusText,
        headers
      });
      
      cache.put(request, cachedResponse);
    }
    return response;
  } catch (error) {
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ error: '网络错误' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response);
        });
      }
    }).catch(() => {});
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('加载失败', { status: 503 });
  }
}

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
