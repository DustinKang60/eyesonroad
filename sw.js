const CACHE_NAME = 'eyes-on-road-v3-6';  // v3.6: 캐시 갱신
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './signals.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  // API 요청은 캐시 건드리지 않음
  if (url.includes('t-data.seoul.go.kr') || url.includes('workers.dev')) {
    event.respondWith(fetch(event.request));
    return;
  }
  // 그 외: 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
