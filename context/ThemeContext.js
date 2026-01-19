// context/ThemeContext.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "system", // "light" | "dark" | "system"
  setTheme: () => {},
  resolvedTheme: "light", // Actual theme being shown
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  // ✅ Function to update favicon based on theme
  const updateFavicon = (currentTheme) => {
    console.log("🎨 Updating favicon for theme:", currentTheme);

    const favicon = document.querySelector("link[rel='icon']");
    const faviconPath =
      currentTheme === "light" ? "/favicon-light.ico" : "/favicon-dark.ico";

    if (favicon) {
      favicon.href = faviconPath;
    } else {
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      newFavicon.type = "image/x-icon";
      newFavicon.href = faviconPath;
      document.head.appendChild(newFavicon);
    }
  };

  // Load saved theme on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    let effectiveTheme = theme;

    if (theme === "system") {
      // Use system preference
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    // Apply the theme class
    root.classList.add(effectiveTheme);
    setResolvedTheme(effectiveTheme);

    // ✅ Update favicon
    updateFavicon(effectiveTheme);

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      const newTheme = e.matches ? "dark" : "light";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
      setResolvedTheme(newTheme);

      // ✅ Update favicon when system theme changes
      updateFavicon(newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
