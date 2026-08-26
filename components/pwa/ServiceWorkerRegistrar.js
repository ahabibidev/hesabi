// components/pwa/ServiceWorkerRegistrar.jsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";

/**
 * Registers the service worker and surfaces a prompt when a newer build is
 * waiting. Mounted once from the root layout, so it deliberately keeps its
 * imports light — no animation library on every page for a rare toast.
 */
export default function ServiceWorkerRegistrar() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const reloadingRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // In development Turbopack rebuilds assets constantly; a cached copy just
    // gets in the way, so the worker is only installed for real builds.
    if (process.env.NODE_ENV !== "production") return;

    let registration;

    const trackInstalling = (worker) => {
      worker.addEventListener("statechange", () => {
        // "installed" while a controller exists means an update is waiting.
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          setWaitingWorker(worker);
        }
      });
    };

    const onControllerChange = () => {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    };

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }

        if (registration.installing) {
          trackInstalling(registration.installing);
        }

        registration.addEventListener("updatefound", () => {
          if (registration.installing) trackInstalling(registration.installing);
        });
      } catch {
        // A failed registration must never break the app.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && registration) {
        registration.update().catch(() => undefined);
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    document.addEventListener("visibilitychange", onVisibilityChange);

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const handleUpdate = useCallback(() => {
    if (!waitingWorker) return;
    // The worker replies by taking control, which trips `controllerchange`
    // above and reloads the page onto the new build.
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setWaitingWorker(null);
  }, [waitingWorker]);

  if (!waitingWorker || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm animate-slide-up rounded-2xl border border-text/10 bg-input-background p-4 shadow-xl md:inset-x-auto md:right-6 md:bottom-6"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
          <RefreshCw className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Update available
          </p>
          <p className="mt-1 text-sm text-text/70">
            A newer version of Hesabi is ready to install.
          </p>

          <button
            onClick={handleUpdate}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Reload now
          </button>
        </div>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss update notification"
          className="rounded-lg p-1 text-text/60 transition-colors hover:bg-text/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
