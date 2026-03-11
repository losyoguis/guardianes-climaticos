const CACHE_VERSION = "guardianes-v3-offline";
const APP_SHELL = [
  "./",
  "./index.html",
  "./mapa.html",
  "./manifest.json",
  "./offline.html",
  "./service-worker.js",
  "./js/rubrica.js",
  "./js/pwa.js",
  "./css/style.css",
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
  "./img/cierre.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
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

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("./index.html")) || (await caches.match("./offline.html")))
    );
    return;
  }

  if (["style","script","worker","image","font"].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then(cached => {
        const networkFetch = fetch(req)
          .then(res => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});