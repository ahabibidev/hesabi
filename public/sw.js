/**
 * Heasbi - Personal Finance Management Application
 * Copyright (C) 2025-2026 Ali Reza Habibi
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE file for full license text.
 */

/**
 * Hesabi service worker.
 *
 * Caching policy is deliberately conservative: Hesabi renders personal
 * financial data behind a session, so nothing user-specific is ever written to
 * the Cache API. Only build output and public brand assets are cached.
 *
 *   - navigations    -> network only, falling back to the offline page
 *   - /api/*         -> not intercepted at all
 *   - /_next/static  -> cache first (content-hashed, so never stale)
 *   - public assets  -> stale-while-revalidate (names are stable, bytes are not)
 *
 * That keeps the install prompt, offline fallback and instant asset loads
 * without leaving a readable copy of someone's finances on a shared device.
 */

const VERSION = "v1";
const PRECACHE = `hesabi-precache-${VERSION}`;
const ASSETS = `hesabi-assets-${VERSION}`;
const OFFLINE_URL = "/offline.html";

// Every deploy adds a fresh set of hashed chunks, so the runtime cache is
// trimmed FIFO to stop it growing without bound on a long-lived install.
const MAX_ASSET_ENTRIES = 120;

// Kept small on purpose — anything missing here is fetched and cached on demand.
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/mini-logo.png",
];

const ASSET_EXTENSIONS =
  /\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // Individual adds so one 404 cannot fail the whole install.
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache
            .add(new Request(url, { cache: "reload" }))
            .catch(() => undefined),
        ),
      );
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("hesabi-") && key !== PRECACHE && key !== ASSETS)
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Called on sign-out. Nothing sensitive is cached, but dropping everything
  // on a shared device is cheap insurance.
  if (type === "CLEAR_CACHES") {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter((key) => key.startsWith("hesabi-")).map((key) => caches.delete(key)),
        );
      })(),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Third-party requests (OAuth avatars, analytics) are left to the browser.
  if (url.origin !== self.location.origin) return;

  // Session, financial data and auth callbacks must always hit the network.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  // React Server Component payloads carry the same data as the HTML.
  if (url.searchParams.has("_rsc")) return;

  // Build output is content-hashed: if the URL matches, the bytes match.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Brand assets keep their filenames across deploys, so revalidate in the
  // background rather than trusting whatever was cached first.
  if (ASSET_EXTENSIONS.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Network-only with an offline fallback. Page HTML is never cached, so a
 * logged-out or offline visitor can never be shown a previous user's figures.
 */
async function handleNavigation(event) {
  try {
    const preload = await event.preloadResponse;
    if (preload) return preload;

    return await fetch(event.request);
  } catch {
    const cached = await caches.match(OFFLINE_URL, { ignoreSearch: true });
    if (cached) return cached;

    return new Response(
      "<!doctype html><meta charset=utf-8><title>Offline</title><p>You are offline.",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    await put(cache, request, response, MAX_ASSET_ENTRIES);
    return response;
  } catch {
    return Response.error();
  }
}

async function staleWhileRevalidate(request) {
  // Offline-critical assets (the logo on the offline page, the app icons) live
  // in the precache. They are refreshed in place rather than copied across, so
  // they stay available even after the runtime cache is trimmed.
  const precache = await caches.open(PRECACHE);
  const precached = await precache.match(request);

  const cache = precached ? precache : await caches.open(ASSETS);
  const cached = precached || (await cache.match(request));
  const limit = precached ? null : MAX_ASSET_ENTRIES;

  const network = fetch(request)
    .then(async (response) => {
      await put(cache, request, response, limit);
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;

  const response = await network;
  return response || Response.error();
}

async function put(cache, request, response, limit) {
  // `basic` excludes opaque cross-origin and error responses.
  if (!response || !response.ok || response.type !== "basic") return;

  await cache.put(request, response.clone());
  if (limit) await trim(cache, limit);
}

/** Cache keys come back in insertion order, so dropping from the front is FIFO. */
async function trim(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;

  await Promise.all(
    keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)),
  );
}
