"use client";

import { useState, useMemo, useCallback } from "react";
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
}) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Memoize spend calculations
  const spendData = useMemo(() => {
    const data = {};
    budgets.forEach((budget) => {
      data[budget.name] = calculateCategorySpend(budget.name, allTransactions);
    });
    return data;
  }, [budgets, allTransactions]);

  // Memoize transaction data per budget
  const transactionsByBudget = useMemo(() => {
    const data = {};
    budgets.forEach((budget) => {
      data[budget.id] = getLastThreeTransactions(budget.name, allTransactions);
    });
    return data;
  }, [budgets, allTransactions]);

  const handleAddBudget = useCallback((newBudget) => {
    setBudgets((prev) => [...prev, newBudget]);
    setIsBudgetModalOpen(false);
  }, []);

  const handleUpdateBudget = useCallback((updatedBudget) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === updatedBudget.id ? updatedBudget : budget
      )
    );
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  }, []);

  const handleDeleteBudget = useCallback((budgetId) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      setBudgets((prev) => prev.filter((budget) => budget.id !== budgetId));
      setOpenDropdownId(null);
      alert("Budget deleted successfully!");
    }
  }, []);

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
        className="flex w-full flex-col md:flex-row md:px-30 gap-10"
        onClick={handleClickOutside}
      >
        <BudgetSummaryCard budgets={budgets} spendData={spendData} />

        <div className="flex flex-col w-full md:w-3/5 gap-10">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spend={spendData[budget.name] || 0}
              transactions={transactionsByBudget[budget.id] || []}
              openDropdownId={openDropdownId}
              onDropdownToggle={handleDropdownToggle}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      </div>

      <AddBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={handleCloseModal}
        onAddBudget={handleAddBudget}
        onUpdateBudget={handleUpdateBudget}
        editingBudget={editingBudget}
        existingBudgets={budgets}
      />
    </>
  );
}
