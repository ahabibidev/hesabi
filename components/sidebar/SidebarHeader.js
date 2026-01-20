// components/sidebar/SidebarHeader.jsx
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import darkLogo from "@/public/dark-logo.png";
import Image from "next/image";

export default function SidebarHeader({ isCollapsed, onToggle }) {
  return (
    <div className="p-5 border-b border-white/10 flex items-center justify-between">
      <div
        className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 gap-3"
        }`}
      >
        {/* Logo */}
        <div className="relative shrink-0">
          <Image alt="Logo" width={130} height={50} src={darkLogo} />

          <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl -z-10" />
        </div>

        {/* Brand Name */}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group shrink-0 ${
          isCollapsed ? "mx-auto" : ""
        }`}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="transition-transform duration-300">
          {isCollapsed ? (
            <FiChevronRight className="text-lg text-white/70 group-hover:text-white transition-colors" />
          ) : (
            <FiChevronLeft className="text-lg text-white/70 group-hover:text-white transition-colors" />
          )}
        </div>
      </button>
    </div>
  );
}
