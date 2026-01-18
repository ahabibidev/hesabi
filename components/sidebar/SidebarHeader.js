import { FiDollarSign, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function SidebarHeader({ isCollapsed, onToggle }) {
  return (
    <div className="p-6 border-b border-gray-700 flex items-center justify-between">
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center w-full" : "space-x-3"
        }`}
      >
        {!isCollapsed && (
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FiDollarSign className="text-xl" />
          </div>
        )}

        {!isCollapsed && <h1 className="text-xl font-bold">Hesabi</h1>}
      </div>
      <button
        onClick={onToggle}
        className="p-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <FiChevronRight className="text-xl" />
        ) : (
          <FiChevronLeft className="text-xl" />
        )}
      </button>
    </div>
  );
}
