"use client";

export default function BillsSearchSort({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
      <div className="relative w-full md:w-auto flex-1 max-w-md">
        <input
          className="w-full rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 pr-12 text-foreground placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-200"
          placeholder="Search Bills by name, description, or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/50 hover:text-text"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className="text-sm font-medium text-text whitespace-nowrap">
          Sort by
        </span>
        <select
          className="rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent w-full md:min-w-35 cursor-pointer transition-all duration-200"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Name (A-Z)</option>
          <option value="date">Due Date</option>
          <option value="amount">Amount (High-Low)</option>
        </select>
      </div>
    </div>
  );
}
