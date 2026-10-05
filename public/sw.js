const CACHE_NAME = "kc-app-v2";
const STATIC_ASSETS = [
  "/",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
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

// Fetch: network-first with cache fallback (ignoring Next.js internal calls)
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 1. Skip non-GET requests
  if (request.method !== "GET") return;

  // 2. Skip Server Actions, Next.js internal chunks, HMR, APIs and Auth
  const url = new URL(request.url);
  const isServerAction = request.headers.has("next-action");
  const isRsc = request.headers.has("rsc") || url.searchParams.has("_rsc");
  const isNextInternal =
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.includes("__next");

  if (isServerAction || isRsc || isNextInternal) {
    return;
  }

  // 3. Network-First con fallback seguro
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(request, clone);
            } catch {
              // Ignore cache errors
            }
          });
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || new Response("Offline", { status: 503 });
      })
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || "Kelly's Cake", {
      body: data.body || "Tienes una nueva notificación",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/admin" },
      vibrate: [200, 100, 200],
    })
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/admin";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes("/admin"));
        if (existing) {
          return existing.focus();
        }
        return self.clients.openWindow(url);
      })
  );
});
