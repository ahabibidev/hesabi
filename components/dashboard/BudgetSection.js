// components/dashboard/BudgetSection.jsx
import BudgetChart from "./BudgetChart";
import SectionHeader from "./SectionHeader";
import BudgetItem from "./BudgetItem";

export default function BudgetSection({
  budgets,
  budgetCategories,
  currency = "USD",
}) {
  // Support both old format (budgetCategories) and new format (budgets)
  const data = budgets || budgetCategories || [];

  // Calculate totals for the chart
  const totalSpent = data.reduce(
    (sum, b) => sum + (b.spent || b.value || 0),
    0,
  );
  const totalBudget = data.reduce(
    (sum, b) => sum + (b.max_amount || b.max || 0),
    0,
  );

  // Prepare chart data
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.spent || item.value || 0,
    color: item.color,
  }));

  // Check if using old format (PotItem style) or new format (BudgetItem style)
  const isOldFormat = budgetCategories && !budgets;

  // Check if there are any budgets
  const hasNoBudgets = !budgets || budgets.length === 0;

  return (
    <div className="flex flex-col w-130 text-foreground bg-background shadow-xl bg-brand-gradient border border-text/10 p-6 gap-5 rounded-2xl">
      <SectionHeader title="Budget" linkHref="/budgets" />

      {hasNoBudgets ? (
        <div className="flex items-center justify-center py-10 text-text/50">
          <p>No budgets set. Create a budget to track your spending!</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1">
            <BudgetChart
              data={chartData}
              totalSpent={totalSpent}
              totalBudget={totalBudget}
              currency={currency}
            />
          </div>

          {/* Budget Categories */}
          <div className="md:flex md:flex-col md:flex-1 grid grid-cols-2 grid-rows-2 ">
            {data.slice(-3).map((item) => (
              <BudgetItem
                key={item.id || item.name}
                name={item.name}
                spent={item.spent || item.value || 0}
                max={item.max_amount || item.max || 0}
                color={item.color}
                currency={currency}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
