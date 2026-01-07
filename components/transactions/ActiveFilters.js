import { FiX } from "react-icons/fi";

export default function ActiveFilters({
  searchTerm,
  categoryFilter,
  typeFilter,
  sortBy,
  onClearSearch,
  onClearCategory,
  onClearType,
  onClearSort,
  onClearAll,
}) {
  const activeFilters = [];

  if (searchTerm) {
    activeFilters.push({
      label: `Search: "${searchTerm}"`,
      onClear: onClearSearch,
    });
  }

  if (categoryFilter !== "all") {
    activeFilters.push({
      label: `Category: ${categoryFilter}`,
      onClear: onClearCategory,
    });
  }

  if (typeFilter !== "all") {
    activeFilters.push({ label: `Type: ${typeFilter}`, onClear: onClearType });
  }

  if (sortBy !== "latest") {
    const sortLabels = {
      oldest: "Oldest First",
      "amount-high": "Amount: High to Low",
      "amount-low": "Amount: Low to High",
      "income-first": "Income First",
      "expense-first": "Expense First",
    };
    activeFilters.push({
      label: `Sort: ${sortLabels[sortBy] || sortBy}`,
      onClear: onClearSort,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-text/70">Active filters:</span>
      {activeFilters.map((filter, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          {filter.label}
          <button
            onClick={filter.onClear}
            className="ml-1 text-primary/70 hover:text-primary"
            aria-label="Clear filter"
          >
            <FiX className="text-xs" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="ml-2 text-sm text-red-500 hover:text-red-700 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
