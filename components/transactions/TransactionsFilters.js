// components/transactions/TransactionsFilters.jsx
"use client";

import { useState, useMemo } from "react";
import { SlMagnifier } from "react-icons/sl";
import { FiX, FiFilter, FiGrid } from "react-icons/fi";
import MobileFilterModal from "./MobileFilterModal";

export default function TransactionsFilters({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  categories = [],
}) {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileCategory, setShowMobileCategory] = useState(false);

  const sortOptions = [
    { value: "latest", label: "Latest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "amount-high", label: "Amount: High to Low" },
    { value: "amount-low", label: "Amount: Low to High" },
    { value: "income-first", label: "Income First" },
    { value: "expense-first", label: "Expense First" },
  ];

  // Get unique categories from the database categories
  const categoryOptions = useMemo(() => {
    const uniqueCategories = categories
      .filter((c) => c.is_default || c.user_id)
      .map((c) => c.name);
    return [...new Set(uniqueCategories)].sort();
  }, [categories]);

  return (
    <>
      {/* Mobile Filters */}
      <div className="sm:hidden flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 pr-12 text-foreground placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Search transactions..."
            />
            <SlMagnifier className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text/50 text-sm" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-text/50 hover:text-foreground"
              >
                <FiX className="text-sm" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilter(true)}
              className={`flex items-center gap-1 rounded-lg border ${
                sortBy !== "latest"
                  ? "border-primary/50 bg-primary/10"
                  : "border-text/20"
              } bg-background dark:bg-gray-900 p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200`}
              aria-label="Sort options"
            >
              <FiFilter className="text-base" />
            </button>

            <button
              onClick={() => setShowMobileCategory(true)}
              className={`flex items-center gap-1 rounded-lg border ${
                categoryFilter !== "all"
                  ? "border-primary/50 bg-primary/10"
                  : "border-text/20"
              } bg-background dark:bg-gray-900 p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200`}
              aria-label="Category filter"
            >
              <FiGrid className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden sm:flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div className="relative w-full lg:w-auto flex-1 max-w-md">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 pr-12 text-foreground placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-200"
            placeholder="Search transactions, categories, or amounts..."
          />
          <SlMagnifier className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text/50" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-text/50 hover:text-foreground"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent min-w-[140px] cursor-pointer transition-all duration-200"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent min-w-[180px] cursor-pointer transition-all duration-200"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent min-w-[140px] cursor-pointer transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Modals */}
      <MobileFilterModal
        isOpen={showMobileFilter}
        onClose={() => setShowMobileFilter(false)}
        title="Sort Options"
      >
        <div className="space-y-3">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
                setShowMobileFilter(false);
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                sortBy === option.value
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </MobileFilterModal>

      <MobileFilterModal
        isOpen={showMobileCategory}
        onClose={() => setShowMobileCategory(false)}
        title="Filter by Category"
      >
        <div className="space-y-3">
          <button
            onClick={() => {
              setCategoryFilter("all");
              setShowMobileCategory(false);
            }}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              categoryFilter === "all"
                ? "bg-primary/10 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            All Categories
          </button>
          {categoryOptions.map((category) => (
            <button
              key={category}
              onClick={() => {
                setCategoryFilter(category);
                setShowMobileCategory(false);
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                categoryFilter === category
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </MobileFilterModal>
    </>
  );
}
