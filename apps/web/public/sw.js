// Bump this version whenever you deploy to force old caches to clear.
const SHELL_CACHE = "exitplan-shell-v3";
const ASSET_CACHE = "exitplan-assets-v3";

const PRECACHE_ROUTES = [
  "/offline",
  "/manifest.json",
];

const OFFLINE_ENABLED_ROUTES = [
  "/dashboard",
  "/accounts",
  "/transactions",
  "/goals",
  "/budgets",
  "/settings",
  "/offline",
];

const NEVER_CACHE_NAVIGATION_ROUTES = [
  "/login",
  "/signup",
  "/auth",
  "/onboarding",
  "/admin",
];

function getNavigationCacheKey(request) {
  const requestUrl = new URL(request.url);
  return `${requestUrl.origin}${requestUrl.pathname}`;
}

function isRouteMatch(pathname, routes) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function shouldCacheNavigation(request, response) {
  const requestUrl = new URL(request.url);
  const responseUrl = new URL(response.url);

  if (!response.ok) return false;
  if (response.redirected) return false;

  const requestPath = requestUrl.pathname;
  const responsePath = responseUrl.pathname;

  if (requestPath !== responsePath) {
    return false;
  }

  if (isRouteMatch(requestPath, NEVER_CACHE_NAVIGATION_ROUTES)) {
    return false;
  }

  if (!isRouteMatch(requestPath, OFFLINE_ENABLED_ROUTES)) {
    return false;
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("text/html");
}

// ─── Install: pre-cache offline fallback ───────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ROUTES))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

// ─── Activate: remove stale caches ─────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const valid = new Set([SHELL_CACHE, ASSET_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !valid.has(k)).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// ─── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from our own origin
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Skip Supabase / API calls — always network-only
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase")) {
    return;
  }

  // ── Next.js static assets (_next/static) ──────────────────────────────
  // These are content-hashed, so cache-first is safe forever.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // ── App-shell navigation requests ─────────────────────────────────────
  // Network-first: try to fetch a fresh response, cache it, fall back to cache.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (shouldCacheNavigation(request, response)) {
            const copy = response.clone();
            const cacheKey = getNavigationCacheKey(request);
            caches.open(SHELL_CACHE).then((cache) => cache.put(cacheKey, copy));
          }
          return response;
        })
        .catch(async () => {
          const cacheKey = getNavigationCacheKey(request);
          const cached = await caches.match(cacheKey);
          if (cached) return cached;
          // Serve the offline fallback page
          return (await caches.match("/offline")) ?? Response.error();
        })
    );
    return;
  }

  // ── Everything else (fonts, icons, public files) ───────────────────────
  // Stale-while-revalidate: respond from cache immediately, update in background.
  event.respondWith(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      }).catch(() => cached);
      return cached ?? networkFetch;
    })
  );
});
