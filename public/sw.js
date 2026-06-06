// Conddo.io — minimal service worker.
//
// Two jobs:
//
//   1. Exist. Chrome / Edge / Android refuse to fire the install prompt
//      unless the page has a registered SW that responds to fetch. Without
//      this file the manifest alone gets you "Add to Home Screen" on iOS
//      but no install banner anywhere else.
//
//   2. Skip-network only for the app shell on a hard offline. Everything
//      else (API calls, dynamic data) goes straight to the network — no
//      stale caching of business data. This is a "shell-only" PWA, not a
//      full offline app.
//
// Bumping CACHE_VERSION invalidates the old shell and forces a fresh
// fetch on the next visit; bump it whenever globals.css, the icons, or
// the manifest change in a way that needs to ship promptly.

const CACHE_VERSION = "conddo-shell-v1";
const SHELL = ["/", "/conddo_icon.png", "/conddo_logo.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  // Drop any previous shell caches so we don't bloat storage when CACHE_VERSION bumps.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only handle same-origin GETs. API calls (cross-origin to api.conddo.io /
  // conddo-backend.onrender.com), POSTs, and anything weird go straight to
  // the network — we never want stale order data or replayed mutations.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Static shell assets: cache-first.
  const isShell = SHELL.includes(url.pathname) || url.pathname.startsWith("/_next/static/");
  if (isShell) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        return res;
      })),
    );
    return;
  }

  // Everything else: network-first; fall back to cache only if the network
  // is unreachable. Keeps the experience honest — no stale dashboards.
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((c) => c ?? Response.error())),
  );
});
