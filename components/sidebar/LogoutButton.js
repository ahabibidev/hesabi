// components/sidebar/LogoutButton.jsx
import { FiLogOut } from "react-icons/fi";
import { signOut } from "next-auth/react";

export default function LogoutButton({ isCollapsed }) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className={`relative flex items-center w-full rounded-xl p-2 transition-all duration-200 group hover:bg-red-500/10 border border-transparent hover:border-red-500/20 ${
        isCollapsed ? "justify-center" : ""
      }`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
        <FiLogOut className="text-md h-5 text-red-400 group-hover:text-red-300" />
      </div>

      {/* Label */}
      {!isCollapsed && (
        <span className="ml-2 font-medium text-xs text-red-400 group-hover:text-red-300">
          Logout
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-red-500/20 text-red-300 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-red-500/20 z-50">
          Logout
          {/* Tooltip arrow */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-red-500/20 border-l border-b border-red-500/20 rotate-45" />
        </div>
      )}
    </button>
  );
}
