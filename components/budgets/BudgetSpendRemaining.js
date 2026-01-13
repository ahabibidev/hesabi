// components/budgets/BudgetSpendRemaining.jsx
import { formatCurrency } from "@/lib/constants";

export default function BudgetSpendRemaining({
  spend,
  remaining,
  budgetColor,
  currency = "USD",
}) {
  return (
    <div className="flex justify-between mt-3">
      <div className="flex md:flex-1 flex-1/5 items-center gap-5">
        <div
          className="h-13 rounded-md w-1"
          style={{ backgroundColor: budgetColor }}
        ></div>
        <p className="flex flex-col font-semibold">
          {formatCurrency(spend, currency)}
          <span className="text-text font-normal">Spend</span>
        </p>
      </div>
      <div className="flex md:flex-1 items-center gap-5">
        <div className="h-13 rounded-md bg-orange-600 w-1"></div>
        <p className="flex flex-col font-semibold">
          {formatCurrency(Math.max(remaining, 0), currency)}
          <span className="text-text font-normal">Remaining</span>
        </p>
      </div>
    </div>
  );
}
