const CACHE = "dmbattlefield-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(["/", "/index.html", "/manifest.json", "/favicon.png"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (!e.request.url.startsWith("http")) return;

  const url = new URL(e.request.url);

  if (url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(e.request));
    return;
  }

  if (url.pathname.startsWith("/assets/") || url.hostname.includes("fonts.g")) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) => hit || fetch(e.request).then((res) => {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match("/index.html"))
  );
});