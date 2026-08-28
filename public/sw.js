const VERSION = 'continuity-v6';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = [
  '/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icons/icon.svg',
  '/assets/app.js', '/assets/app.css',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png',
  '/assets/continuity-desk.webp', '/fonts/atkinson-400.woff2', '/fonts/bitter.woff2',
  '/privacy/', '/terms/', '/legal.css'
];

self.addEventListener('install', (event) => {
  const requests = PRECACHE.map((url) => new Request(url, { cache: 'reload' }));
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(requests)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) await (await caches.open(RUNTIME)).put(event.request, response.clone());
        return response;
      } catch {
        return (await caches.match(event.request, { ignoreSearch: true, ignoreVary: true })) || (await caches.match('/', { ignoreVary: true })) || (await caches.match('/offline.html', { ignoreVary: true }));
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) await (await caches.open(RUNTIME)).put(event.request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});
