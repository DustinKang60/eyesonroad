/* 전방주시철저 · Eyes on Road · Service Worker
   작은앱공방 · 강종훈 · v2.1.0 */
const CACHE_NAME = 'eyes-on-road-v2-1';  // index.html v2.1.0 대응
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
];
// ── 설치 ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});
// ── 활성화 (구버전 캐시 정리) ───────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});
// ── 패치 전략 ──────────────────────────
// T-Data API / Cloudflare 프록시 → 네트워크 전용 (캐시 안 함)
// 정적 파일 → 캐시 우선, 실패 시 네트워크
self.addEventListener('fetch', event => {
  const url = event.request.url;
  // API 요청 → 네트워크만
  if (url.includes('t-data.seoul.go.kr') || url.includes('workers.dev')) {
    event.respondWith(fetch(event.request));
    return;
  }
  // 정적 자산 → 캐시 우선
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
