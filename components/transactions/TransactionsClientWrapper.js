"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../header/Header";
import TransactionsFilters from "./TransactionsFilters";
import TransactionsTableView from "./TransactionsTableView";
import TransactionsPagination from "./TransactionsPagination";
import ActiveFilters from "./ActiveFilters";
import AddTransactionModal from "./AddTransactionModal";
import { filterTransactions, sortTransactions } from "@/utils/transactionUtils";

export default function TransactionsClientWrapper({ initialTransactions }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactions, setTransactions] = useState(initialTransactions);

  console.log("Initial Transactions:", initialTransactions);
  const itemsPerPage = 7;

  // Update transactions when initialTransactions changes (for SSR/SSG)
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  // Memoized filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    const filtered = filterTransactions(transactions, {
      searchTerm,
      categoryFilter,
      typeFilter,
    });
    return sortTransactions(filtered, sortBy);
  }, [transactions, searchTerm, sortBy, categoryFilter, typeFilter]);

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
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  }, []);

  const handleEditTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setIsAddModalOpen(true);
  }, []);

  const handleHideTransaction = useCallback(
    (id) => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      // Reset to first page if we're on a page that might now be empty
      if (currentTransactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    [currentTransactions.length, currentPage]
  );

  const handleSaveNewTransaction = useCallback((newTransaction) => {
    const transactionToAdd = {
      ...newTransaction,
      id: Date.now(),
      date: new Date(newTransaction.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type === "income" ? "Income" : "Expense",
    };

    setTransactions((prev) => [transactionToAdd, ...prev]);
    setIsAddModalOpen(false);
    setCurrentPage(1);
  }, []);

  const handleUpdateTransaction = useCallback((updatedTransaction) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === updatedTransaction.id
          ? {
              ...updatedTransaction,
              date: new Date(updatedTransaction.date).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              ),
              amount: parseFloat(updatedTransaction.amount),
              type: updatedTransaction.type === "income" ? "Income" : "Expense",
            }
          : t
      )
    );
    setIsAddModalOpen(false);
    setEditingTransaction(null);
    console.log("Transaction updated:", updatedTransaction);
  }, []);

  return (
    <>
      <Header
        buttonText={"Add New Transaction"}
        pageHeader={"Transactions"}
        pageSubHeader={"View and manage all your financial transactions"}
        onAddTransaction={handleAddTransaction}
      />

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
          onEdit={handleEditTransaction}
          onHide={handleHideTransaction}
        />

        {currentTransactions.length > 0 && (
          <TransactionsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalFiltered={filteredTransactions.length}
            totalAll={transactions.length}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onAddTransaction={handleSaveNewTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        editingTransaction={editingTransaction}
      />
    </>
  );
}
