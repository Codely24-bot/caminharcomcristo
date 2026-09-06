/* ============================================================
   IGREJA CAMINHAR — Service Worker (PWA)
   Cache-first para estáticos, network-first para páginas,
   com fallback offline para a página inicial.
   ============================================================ */
"use strict";

const CACHE_PREFIX = "igrejacaminhar-v3";
const PRECACHE_URLS = [
  "/",
  "/static/css/style.css?v=9",
  "/static/css/responsive.css?v=9",
  "/static/js/main.js?v=9",
  "/static/images/pwa/icon-192.png",
  "/static/images/pwa/icon-512.png",
  "/static/images/pwa/icon-maskable-512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_PREFIX)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX.split("-v")[0]) && key !== CACHE_PREFIX)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Páginas (navegação): network-first, cai no cache se offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_PREFIX).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/"))
      )
    );
    return;
  }

  // Manifest
  if (url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_PREFIX).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Estáticos: cache-first com revalidação em segundo plano
  if (url.pathname.startsWith("/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_PREFIX).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});

/* ============================================================
   Notificações push (Web Push / VAPID)
   ============================================================ */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }

  const title = data.title || "Igreja Caminhar";
  const options = {
    body: data.body || "Não perca os próximos cultos e eventos!",
    icon: "/static/images/pwa/icon-192.png",
    badge: "/static/images/pwa/icon-192.png",
    vibrate: [100, 60, 100],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  let target = "/";
  if (event.notification.data && event.notification.data.url) {
    target = event.notification.data.url;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.focus();
          if (client.url === target) return;
          return client.navigate(target);
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
    })
  );
});