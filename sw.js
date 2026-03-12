const CACHE_NAME = 'eyes-on-road-v3-2';  // index.html v3.2.0 대응

const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './signals.json',
];

// 설치: 핵심 파일 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

// 활성화: 이전 버전 캐시 삭제
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

// 네트워크 요청 처리
// API 호출은 캐시하지 않고 항상 네트워크 직접 사용
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
