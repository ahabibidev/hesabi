// components/pwa/InstallAppCard.jsx
"use client";

import { memo } from "react";
import { Check, Download, Share, SquarePlus } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const InstallAppCard = memo(function InstallAppCard() {
  const { canInstall, isInstalled, isIOS, outcome, promptInstall } =
    usePwaInstall();

  return (
    <div className="shadow-xl bg-input-background border border-text/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-2">Install App</h2>
      <p className="text-sm text-text/80 mb-6">
        Add Hesabi to your device for a full-screen app window, a home screen
        icon and faster launches.
      </p>

      {isInstalled ? (
        <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          Hesabi is installed on this device.
        </div>
      ) : isIOS ? (
        <ol className="space-y-3 text-sm text-text/80">
          <li className="flex items-center gap-3">
            <Share className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Tap <span className="font-semibold text-foreground">Share</span> in
              the Safari toolbar.
            </span>
          </li>
          <li className="flex items-center gap-3">
            <SquarePlus className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Choose{" "}
              <span className="font-semibold text-foreground">
                Add to Home Screen
              </span>
              .
            </span>
          </li>
        </ol>
      ) : canInstall ? (
        <button
          onClick={promptInstall}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          Install Hesabi
        </button>
      ) : (
        <p className="text-sm text-text/60">
          {outcome === "dismissed"
            ? "Installation was cancelled. Reload the page to try again."
            : "Your browser will offer an install option once it is ready — look for the install icon in the address bar."}
        </p>
      )}
    </div>
  );
});

export default InstallAppCard;
