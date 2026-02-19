// sw.js — Service Worker DM Battlefield
// Coloque em: client/public/sw.js

const CACHE = "dmbattlefield-v1";

const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.png",
];

// Install: pré-cacheia assets essenciais
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: limpa caches antigos
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Network first para API, Cache first para o resto
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Ignora requests não-GET e extensões do browser
  if (e.request.method !== "GET") return;
  if (!e.request.url.startsWith("http")) return;

  // API → sempre vai na rede, nunca cacheia
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Assets do Vite (/assets/*.js, /assets/*.css) → Cache first
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) => hit || fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Fontes Google → Cache first
  if (url.hostname.includes("fonts.g")) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) => hit || fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Navegação (HTML) → Network first, fallback para index.html (SPA)
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match("/index.html"))
  );
});
