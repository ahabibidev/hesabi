// components/budgets/BudgetSummaryCard.jsx
import BudgetChart from "@/components/dashboard/BudgetChart";
import { formatCurrency } from "@/lib/constants";

export default function BudgetSummaryCard({
  budgets,
  spendData,
  totalSpent = 0,
  totalBudget = 0,
  currency = "USD",
}) {
  // Prepare chart data
  const chartData = budgets.map((budget) => ({
    name: budget.name,
    value: spendData[budget.name] || 0,
    max: budget.max,
    color: budget.color,
  }));

  return (
    <div className="flex flex-col h-180 items-center md:w-2/5 text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 rounded-2xl">
      <BudgetChart
        data={chartData}
        totalSpent={totalSpent}
        totalBudget={totalBudget}
        currency={currency}
      />
      <div className="flex flex-col mt-10 self-start w-full">
        <h2 className="text-2xl font-bold">Spending Summary</h2>
        {budgets.length === 0 ? (
          <p className="text-text/70 mt-5 text-center">No budgets to display</p>
        ) : (
          budgets.map((budget) => {
            const spend = spendData[budget.name] || 0;
            return (
              <div
                key={budget.id}
                className="flex mt-5 items-center justify-between pb-3 border-b border-text/20"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-10"
                    style={{ backgroundColor: budget.color }}
                  ></div>
                  <p>{budget.name}</p>
                </div>

                <div className="flex gap-3">
                  <p className="font-bold">{formatCurrency(spend, currency)}</p>
                  <span className="text-text">
                    of {formatCurrency(budget.max, currency)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
