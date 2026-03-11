const CACHE_VERSION = "guardianes-v6-freshboot";
const PRECACHE = [
  "./",
  "./manifest.json",
  "./offline.html",
  "./service-worker.js",
  "./js/pwa.js",
  "./js/rubrica.js",
  "./favicon.ico",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./img/intro.png",
  "./img/map.png",
  "./img/briefing.png",
  "./img/alert.png",
  "./img/vision.png",
  "./img/command.png",
  "./img/causas.png",
  "./img/consecuencias.png",
  "./img/sol.png",
  "./img/cierre.png",
  "./assets/medellin_map.png"
];

function networkFirst(request, fallback) {
  return fetch(request)
    .then(response => {
      const copy = response.clone();
      caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
      return response;
    })
    .catch(async () => (await caches.match(request)) || (fallback ? await caches.match(fallback) : null));
}

function cacheFirst(request) {
  return caches.match(request).then(cached => {
    if(cached) return cached;
    return fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
      return response;
    });
  });
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if(event.data && event.data.type === "SKIP_WAITING"){
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, "./index.html"));
    return;
  }

  if (["script","style","worker"].includes(req.destination)) {
    event.respondWith(networkFirst(req));
    return;
  }

  if (["image","font"].includes(req.destination)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(
    fetch(req).catch(async () => (await caches.match(req)) || (await caches.match("./offline.html")))
  );
});
