// components/transactions/TransactionsClientWrapper.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "../header/Header";
import TransactionsFilters from "./TransactionsFilters";
import TransactionsTableView from "./TransactionsTableView";
import TransactionsPagination from "./TransactionsPagination";
import ActiveFilters from "./ActiveFilters";
import AddTransactionModal from "./AddTransactionModal";
import { filterTransactions, sortTransactions } from "@/utils/transactionUtils";

export default function TransactionsClientWrapper({
  initialTransactions,
  categories = [],
  currency = "USD",
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 7;

  // Update transactions when initialTransactions changes
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

  const handleDeleteTransaction = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete transaction");
        }

        // Remove from local state
        setTransactions((prev) => prev.filter((t) => t.id !== id));

        // Reset to first page if we're on a page that might now be empty
        if (currentTransactions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        // Refresh to update dashboard stats
        router.refresh();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentTransactions.length, currentPage, router]
  );

  const handleHideTransaction = useCallback(
    (id) => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (currentTransactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    [currentTransactions.length, currentPage]
  );

  const handleSaveNewTransaction = useCallback(
    async (newTransaction) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId: newTransaction.categoryId,
            name: newTransaction.name,
            description: newTransaction.description,
            amount: parseFloat(newTransaction.amount),
            type: newTransaction.type === "Income" ? "income" : "expense",
            date: newTransaction.date,
            recurring: newTransaction.recurring || false,
            recurringInterval: newTransaction.recurringInterval || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create transaction");
        }

        const data = await response.json();

        // Find category info
        const category = categories.find(
          (c) => c.id === newTransaction.categoryId
        );

        // Add to local state with formatted data
        const transactionToAdd = {
          id: data.id,
          name: newTransaction.name,
          description: newTransaction.description,
          amount:
            newTransaction.type === "Income"
              ? Math.abs(parseFloat(newTransaction.amount))
              : -Math.abs(parseFloat(newTransaction.amount)),
          type: newTransaction.type === "Income" ? "Income" : "Expense",
          category: category?.name || "Other",
          category_icon: category?.icon || "default",
          category_color: category?.color || "#6B7280",
          date: newTransaction.date,
        };

        setTransactions((prev) => [transactionToAdd, ...prev]);
        setIsAddModalOpen(false);
        setCurrentPage(1);

        // Refresh to update dashboard stats
        router.refresh();
      } catch (error) {
        console.error("Error creating transaction:", error);
        alert("Failed to create transaction. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [categories, router]
  );

  const handleUpdateTransaction = useCallback(
    async (updatedTransaction) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/transactions/${updatedTransaction.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              categoryId: updatedTransaction.categoryId,
              name: updatedTransaction.name,
              description: updatedTransaction.description,
              amount: parseFloat(updatedTransaction.amount),
              type: updatedTransaction.type === "Income" ? "income" : "expense",
              date: updatedTransaction.date,
              recurring: updatedTransaction.recurring || false,
              recurringInterval: updatedTransaction.recurringInterval || null,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update transaction");
        }

        // Find category info
        const category = categories.find(
          (c) => c.id === updatedTransaction.categoryId
        );

        // Update local state
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === updatedTransaction.id
              ? {
                  ...t,
                  name: updatedTransaction.name,
                  description: updatedTransaction.description,
                  amount:
                    updatedTransaction.type === "Income"
                      ? Math.abs(parseFloat(updatedTransaction.amount))
                      : -Math.abs(parseFloat(updatedTransaction.amount)),
                  type:
                    updatedTransaction.type === "Income" ? "Income" : "Expense",
                  category: category?.name || t.category,
                  category_icon: category?.icon || t.category_icon,
                  category_color: category?.color || t.category_color,
                  date: updatedTransaction.date,
                }
              : t
          )
        );

        setIsAddModalOpen(false);
        setEditingTransaction(null);

        // Refresh to update dashboard stats
        router.refresh();
      } catch (error) {
        console.error("Error updating transaction:", error);
        alert("Failed to update transaction. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [categories, router]
  );

  return (
    <>
      <Header
        buttonText="Add New Transaction"
        pageHeader="Transactions"
        pageSubHeader="View and manage all your financial transactions"
        onAdd={handleAddTransaction}
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
          categories={categories}
        />

        <TransactionsTableView
          transactions={currentTransactions}
          searchTerm={searchTerm}
          currency={currency}
          onClearFilters={clearFilters}
          onEdit={handleEditTransaction}
          onHide={handleHideTransaction}
          onDelete={handleDeleteTransaction}
          isLoading={isLoading}
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
        categories={categories}
        isLoading={isLoading}
      />
    </>
  );
}
