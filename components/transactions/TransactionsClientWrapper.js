// components/transactions/TransactionsClientWrapper.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  // Get initial category from URL
  const initialCategory = searchParams.get("category") || "all";

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 7;

  // Update category filter when URL changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }
  }, [searchParams]);

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

  // Update URL when category filter changes
  const handleCategoryFilterChange = useCallback(
    (newCategory) => {
      setCategoryFilter(newCategory);

      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (newCategory && newCategory !== "all") {
        params.set("category", newCategory);
      } else {
        params.delete("category");
      }

      const newUrl = params.toString()
        ? `/transactions?${params.toString()}`
        : "/transactions";

      router.push(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

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

    // Clear URL params
    router.push("/transactions", { scroll: false });
  }, [router]);

  const handleClearCategory = useCallback(() => {
    handleCategoryFilterChange("all");
  }, [handleCategoryFilterChange]);

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

        setTransactions((prev) => prev.filter((t) => t.id !== id));

        if (currentTransactions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

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

        const category = categories.find(
          (c) => c.id === newTransaction.categoryId
        );

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

        const category = categories.find(
          (c) => c.id === updatedTransaction.categoryId
        );

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
          onClearCategory={handleClearCategory}
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
          setCategoryFilter={handleCategoryFilterChange}
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
