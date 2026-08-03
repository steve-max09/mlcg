const CACHE_NAME = "mlcg-cache-v15";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./js/main.js",
  "./manifest.json",
  "./assets/loxams/Chauffage mobile fioul 50 000 kcal.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/sounds/ui/button-click.mp3",
  "./assets/sounds/ui/tower-destroyed.mp3",
  "./assets/sounds/ui/victory.mp3",
  "./assets/sounds/ui/defeat.mp3",
  "./assets/sounds/units/chauffage-spawn.mp3",
  "./assets/sounds/units/chauffage-attack.mp3",
  "./assets/sounds/units/chauffage-death.mp3",
  "./assets/sounds/units/broyeur-spawn.mp3",
  "./assets/sounds/units/broyeur-attack.mp3",
  "./assets/sounds/units/minipelle-attack.mp3",
  "./assets/sounds/units/tombereau-spawn.mp3",
  "./assets/sounds/units/tombereau-attack.mp3",
  "./assets/sounds/units/compacteur-attack.mp3",
  "./assets/sounds/units/motobineuse-attack.mp3",
  "./assets/sounds/units/motobineuse-death.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        }).catch(() => cached)
      );
    })
  );
});