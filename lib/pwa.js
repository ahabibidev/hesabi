// lib/pwa.js
"use client";

import { signOut } from "next-auth/react";

/**
 * Asks the service worker to drop every cache it owns.
 *
 * The worker never stores account data to begin with, so this is defence in
 * depth for shared devices — and it keeps that guarantee true if the caching
 * rules are ever widened.
 */
export async function clearAppCaches() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    registration?.active?.postMessage({ type: "CLEAR_CACHES" });
  } catch {
    // Never let cache housekeeping block a sign-out.
  }
}

/** Drop-in replacement for next-auth's `signOut` that tidies caches first. */
export async function signOutAndClearCaches(options) {
  await clearAppCaches();
  return signOut(options);
}
