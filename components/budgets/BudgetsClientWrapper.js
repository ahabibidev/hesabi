// components/budgets/BudgetsClientWrapper.jsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header/Header";
import BudgetSummaryCard from "@/components/budgets/BudgetSummaryCard";
import BudgetCard from "@/components/budgets/BudgetCard";
import AddBudgetModal from "@/components/budgets/AddBudgetModal";
import {
  calculateCategorySpend,
  getLastThreeTransactions,
} from "@/utils/budgetsUtils";

export default function BudgetsClientWrapper({
  initialBudgets,
  allTransactions,
  categories = [],
  currency = "USD",
}) {
  const router = useRouter();
  const [budgets, setBudgets] = useState(initialBudgets);
  const [transactions, setTransactions] = useState(allTransactions);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update state when props change
  useEffect(() => {
    setBudgets(initialBudgets);
  }, [initialBudgets]);

  useEffect(() => {
    setTransactions(allTransactions);
  }, [allTransactions]);

  // Memoize spend calculations
  const spendData = useMemo(() => {
    const data = {};
    budgets.forEach((budget) => {
      // Use category_name if available, otherwise use name
      const categoryName = budget.category_name || budget.name;
      data[budget.name] = calculateCategorySpend(categoryName, transactions);
    });
    return data;
  }, [budgets, transactions]);

  // Memoize transaction data per budget
  const transactionsByBudget = useMemo(() => {
    const data = {};
    budgets.forEach((budget) => {
      const categoryName = budget.category_name || budget.name;
      data[budget.id] = getLastThreeTransactions(categoryName, transactions);
    });
    return data;
  }, [budgets, transactions]);

  // Calculate totals for the chart
  const totalSpent = useMemo(() => {
    return Object.values(spendData).reduce((sum, spend) => sum + spend, 0);
  }, [spendData]);

  const totalBudget = useMemo(() => {
    return budgets.reduce((sum, budget) => sum + budget.max, 0);
  }, [budgets]);

  const handleAddBudget = useCallback(
    async (newBudget) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/budgets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId: newBudget.categoryId,
            name: newBudget.name,
            maxAmount: parseFloat(newBudget.max),
            color: newBudget.color,
            period: newBudget.period || "monthly",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create budget");
        }

        const data = await response.json();

        // Find category info
        const category = categories.find((c) => c.id === newBudget.categoryId);

        // Add to local state
        const budgetToAdd = {
          id: data.id,
          name: newBudget.name,
          max: parseFloat(newBudget.max),
          color: newBudget.color,
          spent: 0,
          category_id: newBudget.categoryId,
          category_name: category?.name || newBudget.name,
          period: newBudget.period || "monthly",
        };

        setBudgets((prev) => [...prev, budgetToAdd]);
        setIsBudgetModalOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error creating budget:", error);
        alert("Failed to create budget. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [categories, router]
  );

  const handleUpdateBudget = useCallback(
    async (updatedBudget) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/budgets/${updatedBudget.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId: updatedBudget.categoryId,
            name: updatedBudget.name,
            maxAmount: parseFloat(updatedBudget.max),
            color: updatedBudget.color,
            period: updatedBudget.period || "monthly",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update budget");
        }

        // Find category info
        const category = categories.find(
          (c) => c.id === updatedBudget.categoryId
        );

        // Update local state
        setBudgets((prev) =>
          prev.map((budget) =>
            budget.id === updatedBudget.id
              ? {
                  ...budget,
                  name: updatedBudget.name,
                  max: parseFloat(updatedBudget.max),
                  color: updatedBudget.color,
                  category_id: updatedBudget.categoryId,
                  category_name: category?.name || updatedBudget.name,
                  period: updatedBudget.period || "monthly",
                }
              : budget
          )
        );

        setIsBudgetModalOpen(false);
        setEditingBudget(null);
        router.refresh();
      } catch (error) {
        console.error("Error updating budget:", error);
        alert("Failed to update budget. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [categories, router]
  );

  const handleDeleteBudget = useCallback(
    async (budgetId) => {
      if (!confirm("Are you sure you want to delete this budget?")) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/budgets/${budgetId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete budget");
        }

        setBudgets((prev) => prev.filter((budget) => budget.id !== budgetId));
        setOpenDropdownId(null);
        router.refresh();
      } catch (error) {
        console.error("Error deleting budget:", error);
        alert("Failed to delete budget. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleEditBudget = useCallback((budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
    setOpenDropdownId(null);
  }, []);

  const handleDropdownToggle = useCallback((budgetId) => {
    setOpenDropdownId((prev) => (prev === budgetId ? null : budgetId));
  }, []);

  const handleClickOutside = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  const handleOpenModal = useCallback(() => {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  }, []);

  return (
    <>
      <Header
        buttonText="Add New Budget"
        pageHeader="Budgets"
        pageSubHeader="Manage your budgets"
        onAdd={handleOpenModal}
      />

      <div
        className={`flex w-full flex-col md:flex-row md:px-30 gap-10 ${
          isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
        onClick={handleClickOutside}
      >
        <BudgetSummaryCard
          budgets={budgets}
          spendData={spendData}
          totalSpent={totalSpent}
          totalBudget={totalBudget}
          currency={currency}
        />

        <div className="flex flex-col w-full md:w-3/5 gap-10">
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 rounded-2xl">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No budgets yet
              </h3>
              <p className="text-text/70 text-center mb-4">
                Create a budget to start tracking your spending
              </p>
              <button
                onClick={handleOpenModal}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                Create Your First Budget
              </button>
            </div>
          ) : (
            budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                spend={spendData[budget.name] || 0}
                transactions={transactionsByBudget[budget.id] || []}
                currency={currency}
                openDropdownId={openDropdownId}
                onDropdownToggle={handleDropdownToggle}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            ))
          )}
        </div>
      </div>

      <AddBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={handleCloseModal}
        onAddBudget={handleAddBudget}
        onUpdateBudget={handleUpdateBudget}
        editingBudget={editingBudget}
        existingBudgets={budgets}
        categories={categories}
        isLoading={isLoading}
      />
    </>
  );
}
