// components/sidebar/MobileNav.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { MoreHorizontal, Settings, Info, LogOut, X } from "lucide-react";
import { RiBillLine } from "react-icons/ri";

export default function MobileNav({ items, currentPath, onItemClick }) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  // Show first 4 items + More button
  const mobileItems = items.slice(0, 4);

  // More menu items
  const moreMenuItems = [
    {
      name: "recurringbills",
      label: "Recurring Bills",
      href: "/recurring-bills",
      icon: RiBillLine,
    },
    {
      name: "settings",
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "about",
      label: "About",
      href: "/about",
      icon: Info,
    },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    }

    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMoreMenu]);

  // Check if any more menu item is active
  const isMoreActive = moreMenuItems.some((item) => currentPath === item.href);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200">
          <div
            ref={menuRef}
            className="absolute bottom-20 right-4 left-4 bg-[#0a0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold">More Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      onItemClick(item.name);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-1"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Blur background */}
        <div className="absolute inset-0 bg-[#0a0d14]/90 backdrop-blur-xl" />

        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

        {/* Navigation Items */}
        <div className="relative flex items-center justify-around px-4 py-3 safe-area-bottom">
          {/* Main Nav Items */}
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onItemClick(item.name)}
                className="flex flex-col items-center gap-1.5 min-w-0 flex-1 group"
              >
                {/* Icon Container */}
                <div className="relative">
                  {/* Active glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/40 rounded-xl blur-lg" />
                  )}

                  <div
                    className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-linear-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 scale-110"
                        : "text-white/50 group-active:scale-95 group-hover:text-white group-hover:bg-white/10"
                    }`}
                  >
                    <Icon className="text-xl" />
                  </div>

                  {/* Active dot indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-medium truncate max-w-full transition-colors ${
                    isActive ? "text-white" : "text-white/40"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex flex-col items-center gap-1.5 min-w-0 flex-1 group"
          >
            {/* Icon Container */}
            <div className="relative">
              {/* Active glow */}
              {isMoreActive && (
                <div className="absolute inset-0 bg-primary/40 rounded-xl blur-lg" />
              )}

              <div
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  isMoreActive || showMoreMenu
                    ? "bg-linear-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 scale-110"
                    : "text-white/50 group-active:scale-95 group-hover:text-white group-hover:bg-white/10"
                }`}
              >
                <MoreHorizontal className="text-xl" />
              </div>

              {/* Active dot indicator */}
              {(isMoreActive || showMoreMenu) && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] font-medium truncate max-w-full transition-colors ${
                isMoreActive || showMoreMenu ? "text-white" : "text-white/40"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
