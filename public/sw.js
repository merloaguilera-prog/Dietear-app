const CACHE_VERSION = "dietear-shell-v2";
const APP_SHELL = ["/offline.html", "/icons/icon-192.png", "/icons/icon-512.png"];
const NAVIGATION_TIMEOUT_MS = 10000;

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("dietear-shell-") && key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function remember(request, response) {
  if (!response.ok || response.status === 206) return;
  try {
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response);
  } catch {
    // A full/blocked cache must not turn a successful request into an error.
  }
}

async function cached(request) {
  try {
    const cache = await caches.open(CACHE_VERSION);
    return await cache.match(request);
  } catch {
    return undefined;
  }
}

// A stalled connection does not reject fetch by itself. Bound the wait so a
// returning user can recover even when Android still reports being online.
async function fetchNavigation(request) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      fetch(request, { signal: controller.signal }),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("Navigation timed out"));
        }, NAVIGATION_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Next.js flight/prefetch data is deployment-specific and must reach Next.js.
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    const response = fetchNavigation(request).then(result => {
      if (result.headers.get("content-type")?.includes("text/html")) {
        event.waitUntil(remember(request, result.clone()));
      }
      return result;
    }).catch(async () => (await cached(request)) || (await cached("/offline.html")) || new Response(
      '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DIETEAR · Reintentar</title><body><main><h1>DIETEAR</h1><p>Sin conexión o la conexión tarda demasiado. Tus datos guardados siguen en este dispositivo.</p><a href="">Volver a intentar</a></main></body></html>',
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
    ));
    event.respondWith(response);
    return;
  }

  // Only hashed Next.js assets are immutable. Images and the manifest can change
  // at the same URL; use the network first so updates are visible immediately.
  const immutable = url.pathname.startsWith("/_next/static/");
  const asset = immutable || ["image", "font", "style", "script"].includes(request.destination) || APP_SHELL.includes(url.pathname);
  if (!asset) return;
  const response = (async () => {
    if (immutable) {
      const hit = await cached(request);
      if (hit) return hit;
    }
    try {
      const result = await fetch(request);
      event.waitUntil(remember(request, result.clone()));
      return result;
    } catch (error) {
      const hit = await cached(request);
      if (hit) return hit;
      throw error;
    }
  })();
  event.respondWith(response);
});
