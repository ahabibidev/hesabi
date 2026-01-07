"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import TransactionsHeader from "./TransactionsHeader";
import TransactionsFilters from "./TransactionsFilters";
import TransactionsTableView from "./TransactionsTableView";
import TransactionsPagination from "./TransactionsPagination";
import ActiveFilters from "./ActiveFilters";
import { filterTransactions, sortTransactions } from "@/utils/transactionUtils";

export default function TransactionsClientWrapper({ initialTransactions }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  console.log("Initial Transactions:", initialTransactions);
  const itemsPerPage = 7;

  // Memoized filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    const filtered = filterTransactions(initialTransactions, {
      searchTerm,
      categoryFilter,
      typeFilter,
    });
    return sortTransactions(filtered, sortBy);
  }, [initialTransactions, searchTerm, sortBy, categoryFilter, typeFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, typeFilter, sortBy]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages]
  );

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setSortBy("latest");
  }, []);

  const handleAddTransaction = useCallback(() => {
    alert("Add new transaction form would open here");
  }, []);

  return (
    <>
      <TransactionsHeader onAddTransaction={handleAddTransaction} />

      <div className="rounded-xl sm:rounded-2xl border border-text/10 bg-background dark:bg-linear-45 dark:from-background dark:to-primary/20 p-4 sm:p-6 shadow-lg">
        <ActiveFilters
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          typeFilter={typeFilter}
          sortBy={sortBy}
          onClearSearch={() => setSearchTerm("")}
          onClearCategory={() => setCategoryFilter("all")}
          onClearType={() => setTypeFilter("all")}
          onClearSort={() => setSortBy("latest")}
          onClearAll={clearFilters}
        />

        <TransactionsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />

        <TransactionsTableView
          transactions={currentTransactions}
          searchTerm={searchTerm}
          onClearFilters={clearFilters}
        />

        {currentTransactions.length > 0 && (
          <TransactionsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalFiltered={filteredTransactions.length}
            totalAll={initialTransactions.length}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
}
