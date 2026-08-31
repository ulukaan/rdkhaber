self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("rdk-static-v1").then((cache) => cache.addAll(["/brand/logo.png", "/brand/favicon.png"])));
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request).catch(() => cached)),
  );
});
