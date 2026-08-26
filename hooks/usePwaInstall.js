// hooks/usePwaInstall.js
"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const DISPLAY_MODES = ["standalone", "minimal-ui", "window-controls-overlay"];

/** The server has no display mode or user agent, so both probes start false. */
const serverSnapshot = () => false;

const neverChanges = () => () => {};

function subscribeDisplayMode(onChange) {
  const queries = DISPLAY_MODES.map((mode) =>
    window.matchMedia(`(display-mode: ${mode})`),
  );

  queries.forEach((query) => query.addEventListener("change", onChange));

  return () => {
    queries.forEach((query) => query.removeEventListener("change", onChange));
  };
}

function displayModeSnapshot() {
  return (
    DISPLAY_MODES.some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches) ||
    // iOS Safari predates the display-mode media query.
    window.navigator.standalone === true
  );
}

function iosSnapshot() {
  const ua = window.navigator.userAgent;

  // iPadOS 13+ reports itself as a Mac, so touch points are the giveaway.
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1)
  );
}

/**
 * Wraps the `beforeinstallprompt` flow.
 *
 * Chromium fires the event once per page load and only when the app is
 * installable; Safari never fires it at all, so `isIOS` callers fall back to
 * showing the manual Add to Home Screen steps.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installedThisSession, setInstalledThisSession] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const isStandalone = useSyncExternalStore(
    subscribeDisplayMode,
    displayModeSnapshot,
    serverSnapshot,
  );
  const isIOS = useSyncExternalStore(neverChanges, iosSnapshot, serverSnapshot);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      // Suppress Chrome's own mini-infobar so the in-app button owns the flow.
      event.preventDefault();
      setDeferredPrompt(event);
    };

    // The tab that triggered the install stays in browser display mode, so
    // this event is the only way it learns the install succeeded.
    const onInstalled = () => {
      setDeferredPrompt(null);
      setInstalledThisSession(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null;

    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;
    setOutcome(choice.outcome);

    // The event can only be used once — Chrome fires a fresh one if declined.
    setDeferredPrompt(null);

    return choice.outcome;
  }, [deferredPrompt]);

  const isInstalled = isStandalone || installedThisSession;

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    isIOS,
    outcome,
    promptInstall,
  };
}
