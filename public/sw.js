/* عامل الخدمة — الشبكة أولاً، والتخزين احتياطي للعمل دون اتصال */
const CACHE = 'talameethi-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  /* نترك صفحات التنقل للمتصفح دائماً كي لا تُعرض نسخة قديمة */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req)),
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (
          res &&
          res.status === 200 &&
          (res.type === 'basic' || res.type === 'cors')
        ) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
