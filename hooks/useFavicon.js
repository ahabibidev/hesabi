// hooks/useFavicon.js
"use client";

import { useEffect } from "react";

export function useFavicon(isDark) {
  useEffect(() => {
    // Get the favicon link element
    const favicon =
      document.querySelector("link[rel='icon']") ||
      document.querySelector("link[rel='shortcut icon']");

    if (favicon) {
      // Change favicon based on theme
      favicon.href = isDark ? "/favicon-light.ico" : "/favicon-dark.ico";
    } else {
      // Create favicon element if it doesn't exist
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      newFavicon.href = isDark ? "/favicon-light.ico" : "/favicon-dark.ico";
      document.head.appendChild(newFavicon);
    }
  }, [isDark]);
}
