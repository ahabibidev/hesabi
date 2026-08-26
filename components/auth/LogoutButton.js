// components/auth/LogoutButtonWithConfirmation.jsx
"use client";

import { signOutAndClearCaches } from "@/lib/pwa";
import { FiLogOut } from "react-icons/fi";
import { useState } from "react";

export default function LogoutButtonWithConfirmation() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOutAndClearCaches({
        redirect: true,
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Are you sure?</span>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Logging out..." : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
    >
      <FiLogOut className="text-lg" />
      Logout
    </button>
  );
}
