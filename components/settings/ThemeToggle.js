// components/settings/ThemeToggle.jsx
"use client";

import { memo } from "react";
import { IoMoon, IoSunny } from "react-icons/io5";

const ThemeToggle = memo(function ThemeToggle({ darkMode, onToggle }) {
  return (
    <div>
      <h3 className="font-semibold mb-4">Theme</h3>
      <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 rounded-xl border border-text/10 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              darkMode
                ? "bg-gray-800 text-yellow-300"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {darkMode ? <IoMoon /> : <IoSunny />}
          </div>
          <div>
            <p className="font-medium">
              {darkMode ? "Dark Mode" : "Light Mode"}
            </p>
            <p className="text-sm text-text/70">
              {darkMode ? "Switch to light theme" : "Switch to dark theme"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ThemeToggle;
