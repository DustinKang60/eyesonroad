/* 전방주시철저 · Eyes on Road · Service Worker
   작은앱공방 · 강종훈 · v1.0.0 */

const CACHE_NAME = 'eyes-on-road-v1';

// 오프라인 캐시할 정적 파일
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
// API 요청(t-data, kakao) → 항상 네트워크 우선
// 정적 파일 → 캐시 우선
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // T-Data / 카카오 API → 네트워크만 (캐시 안 함)
  if (url.includes('t-data.seoul.go.kr') || url.includes('dapi.kakao.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 정적 자산 → 캐시 우선, 실패 시 네트워크
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // GET 요청만 캐시
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
