self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("gymspire-v1").then((cache) => {
      return cache.addAll(["/dashboard", "/img/gymspirelogo.png"]);
    }),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
