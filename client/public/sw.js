// sw.js — Service Worker do DM Battlefield
// Estratégia: Cache First para assets, Network First para API

const CACHE_NAME = "dmbattlefield-v1";
const OFFLINE_URL = "/";

// Assets para pré-cachear no install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.png",
];

// ── Install: pré-cacheia os assets essenciais ──────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Pré-cacheando assets essenciais");
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Força ativação imediata sem esperar reload
  self.skipWaiting();
});

// ── Activate: limpa caches antigos ────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Removendo cache antigo:", name);
            return caches.delete(name);
          })
      )
    )
  );
  // Assume controle imediato de todas as abas abertas
  self.clients.claim();
});

// ── Fetch: estratégia por tipo de request ─────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requests não-HTTP (ex: chrome-extension://)
  if (!request.url.startsWith("http")) return;

  // API → Network First (dados sempre frescos, sem cache)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: "Offline" }), {
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  // Fontes do Google → Cache First (evita requests repetidos)
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
      )
    );
    return;
  }

  // Assets estáticos (JS, CSS, imagens) → Cache First
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
      )
    );
    return;
  }

  // HTML / Navegação → Network First com fallback para index.html (SPA)
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() =>
        caches.match(OFFLINE_URL).then(
          (cached) =>
            cached ||
            new Response("<h1>Offline</h1>", {
              headers: { "Content-Type": "text/html" },
            })
        )
      )
  );
});
