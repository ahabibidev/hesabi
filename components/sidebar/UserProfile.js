// components/sidebar/UserProfile.jsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { DEFAULT_AVATAR } from "@/lib/constants";

export default function UserProfile({
  isCollapsed,
  name = "User",
  lastName = "",
  email = "user@example.com",
  avatar = DEFAULT_AVATAR,
  initials = "U",
}) {
  const [imageError, setImageError] = useState(false);

  const showAvatar = avatar && !imageError;

  return (
    <div className="p-5 border-b border-white/10">
      <div className="flex items-center">
        {/* Avatar Container */}
        <div
          className={`relative shrink-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? "mx-auto" : "mr-4"
          }`}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-md -z-10" />

          {showAvatar ? (
            <Image
              src={avatar}
              alt={`${name}'s avatar`}
              width={35}
              height={35}
              className="rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-[#0E121A] transition-all duration-300"
              onError={() => setImageError(true)}
              unoptimized={avatar.startsWith("http")}
            />
          ) : (
            <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-lg font-bold ring-2 ring-white/20 ring-offset-2 ring-offset-[#0E121A]">
              {initials}
            </div>
          )}

          {/* Online Status */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#0E121A] shadow-lg shadow-emerald-500/50">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>

        {/* User Info */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 flex-1"
          }`}
        >
          <h3 className="font-semibold text-sm text-white truncate whitespace-nowrap">
            {name} {lastName}
          </h3>
          <p className="text-white/50 text-xs truncate whitespace-nowrap">
            {email}
          </p>
        </div>
      </div>
    </div>
  );
}
