// components/sidebar/NavItem.jsx
import Link from "next/link";

export default function NavItem({ item, isActive, isCollapsed, onClick }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`relative flex items-center rounded-xl p-2 transition-all duration-300 ease-in-out group ${
        isActive
          ? "bg-linear-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25"
          : "hover:bg-white/5 text-white/50 hover:text-white"
      } ${isCollapsed ? "justify-center" : ""}`}
    >
      {/* Active indicator bar */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full transition-all duration-300 ${
          isActive && !isCollapsed
            ? "opacity-100 scale-100"
            : "opacity-0 scale-0"
        }`}
      />

      {/* Icon container */}
      <div
        className={`flex items-center justify-center shrink-0 transition-transform duration-300 ${
          isActive ? "" : "group-hover:scale-110"
        }`}
      >
        <Icon
          className={`relative top-[1px] text-md transition-colors duration-300 ${
            isActive ? "text-white" : "text-white/50 group-hover:text-white"
          }`}
        />
      </div>

      {/* Label */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"
        }`}
      >
        <span className="font-medium text-xs whitespace-nowrap">
          {item.label}
        </span>
      </div>

      {/* Badge (optional) */}
      {item.badge && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-auto"
          }`}
        >
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20 whitespace-nowrap">
            {item.badge}
          </span>
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-[#1a1f2e] text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10 z-50">
          {item.label}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1f2e] border-l border-b border-white/10 rotate-45" />
        </div>
      )}
    </Link>
  );
}
