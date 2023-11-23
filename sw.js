const cacheName = 'haquers-v0.0.1';

// Precache selected content
const precache = [
  '/',
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(async cache => {
    await cache.addAll(precache);
    await cache.put('/404', await fetch('/404'));
  }))
});

// Allow current page to preload, delete stale caches
self.addEventListener("activate", event => {
  event.waitUntil(self.registration.navigationPreload.enable());
  // .then(() => Promise.all(oldVersions.map(cache => caches.delete(cache)))));
});

// Fetch from network if available, fallback to cache
self.addEventListener("fetch", event => {
  event.respondWith(caches.open(cacheName).then(async cache => {
    try {
      // Online
      let response = await event.preloadResponse || await fetch(event.request);
      cache.put(event.request, response.clone());
      return response;
    } catch {
      // Offline
      return await cache.match(event.request) || await cache.match('/404');
    }
  }));
});
