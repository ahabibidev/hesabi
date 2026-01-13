// components/budgets/BudgetCard.jsx
"use client";

import { memo } from "react";
import BudgetCardDropdown from "./BudgetCardDropdown";
import BudgetProgressBar from "./BudgetProgressBar";
import BudgetSpendRemaining from "./BudgetSpendRemaining";
import LatestSpendingSection from "./LatestSpendingSection";
import { getProgressBarColor } from "@/utils/budgetsUtils";
import { formatCurrency } from "@/lib/constants";

function BudgetCard({
  budget,
  spend,
  transactions,
  currency = "USD",
  openDropdownId,
  onDropdownToggle,
  onEdit,
  onDelete,
}) {
  const remaining = budget.max - spend;
  const progressBarColor = getProgressBarColor(budget.color);

  // Get the category name for filtering
  const categoryName = budget.category_name || budget.name;

  return (
    <div className="flex flex-col md:h-180 gap-5 bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-5 md:p-10 rounded-2xl">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: budget.color }}
          ></div>
          <h2 className="text-2xl font-semibold">{budget.name}</h2>
        </div>

        <BudgetCardDropdown
          budgetId={budget.id}
          isOpen={openDropdownId === budget.id}
          onToggle={onDropdownToggle}
          onEdit={() => onEdit(budget)}
          onDelete={() => onDelete(budget.id)}
        />
      </div>

      <p className="text-text">
        Maximum Of {formatCurrency(budget.max, currency)}
      </p>

      <BudgetProgressBar
        spend={spend}
        max={budget.max}
        color={progressBarColor}
      />

      <BudgetSpendRemaining
        spend={spend}
        remaining={remaining}
        budgetColor={budget.color}
        currency={currency}
      />

      <LatestSpendingSection
        budgetName={budget.name}
        categoryName={categoryName}
        transactions={transactions}
        currency={currency}
      />
    </div>
  );
}

export default memo(BudgetCard);
