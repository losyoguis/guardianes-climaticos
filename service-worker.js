const CACHE_VERSION = "guardianes-v11-scroll-responsive";
const APP_SHELL = [
  "./",
  "./index.html",
  "./mapa.html",
  "./manifest.json",
  "./offline.html",
  "./service-worker.js",
  "./js/app.js",
  "./js/rubrica.js",
  "./js/pwa.js",
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
  "./img/propuesta-ambiental.png",
  "./assets/medellin_map.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .catch(() => Promise.resolve())
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  event.respondWith((async () => {
    try {
      const network = await fetch(req);
      const copy = network.clone();
      const cache = await caches.open(CACHE_VERSION);
      cache.put(req, copy).catch(() => {});
      return network;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === "navigate") {
        return (await caches.match("./index.html")) || (await caches.match("./offline.html"));
      }
      throw err;
    }
  })());
});
