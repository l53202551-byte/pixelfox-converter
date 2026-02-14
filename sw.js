const CACHE_NAME = "pixelfox-converter-v2";
const FONT_CACHE_NAME = "pixelfox-fonts-v1";
const SYNC_TAG = "pixelfox-convert-queue";
const DEBUG = true;
const OFFLINE_FALLBACK = "/offline.html";

const APP_SHELL = [
  "/",
  "/index.html",
  "/offline.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/assets/images/favicon-16.png",
  "/assets/images/favicon-32.png",
  "/assets/images/favicon-48.png",
  "/assets/images/favicon-64.png",
  "/assets/images/icon-180.png",
  "/assets/images/icon-192.png",
  "/assets/images/icon-512.png",
];

const FONT_SHELL = [
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap",
];

function log(...args) {
  if (!DEBUG) return;
  console.log("[SW]", ...args);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) =>
        Promise.all(
          APP_SHELL.map((url) =>
            cache.add(url).catch(() => {
              log("skip shell asset", url);
            })
          )
        )
      ),
      caches.open(FONT_CACHE_NAME).then((cache) =>
        Promise.all(
          FONT_SHELL.map((url) =>
            cache.add(url).catch(() => {
              log("skip font shell asset", url);
            })
          )
        )
      ),
    ])
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== FONT_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    log("cache hit", request.url);
    return cached;
  }

  log("cache miss", request.url);
  const response = await fetch(request);
  if (response && (response.status === 200 || response.type === "opaque")) {
    const clone = response.clone();
    caches.open(cacheName).then((cache) => cache.put(request, clone));
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isFontRequest =
    url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

  if (isFontRequest) {
    event.respondWith(
      cacheFirst(request, FONT_CACHE_NAME).catch(() => caches.match(request))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          log("navigate network", request.url);
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            log("navigate cache hit", request.url);
            return cachedPage;
          }
          log("navigate offline fallback", request.url);
          return caches.match(OFFLINE_FALLBACK);
        })
    );
    return;
  }

  event.respondWith(
    cacheFirst(request, CACHE_NAME).catch(async () => {
      if (request.destination === "document") {
        return caches.match(OFFLINE_FALLBACK);
      }
      return new Response("", { status: 503, statusText: "Offline" });
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag !== SYNC_TAG) return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) =>
      Promise.all(
        clients.map((client) =>
          client.postMessage({ type: "PROCESS_CONVERT_QUEUE" })
        )
      )
    )
  );
});

