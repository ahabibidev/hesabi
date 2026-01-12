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
    0
  );
  const totalBudget = data.reduce(
    (sum, b) => sum + (b.max_amount || b.max || 0),
    0
  );

  // Prepare chart data
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.spent || item.value || 0,
    color: item.color,
  }));

  // Check if using old format (PotItem style) or new format (BudgetItem style)
  const isOldFormat = budgetCategories && !budgets;

  return (
    <div className="flex flex-col text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 gap-5 rounded-2xl">
      <SectionHeader title="Budget" linkHref="/budget" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="w-85.5">
          <BudgetChart
            data={chartData}
            totalSpent={totalSpent}
            totalBudget={totalBudget}
            currency={currency}
          />
        </div>

        {/* Budget Categories */}
        <div className="md:flex md:flex-col grid grid-cols-2 grid-rows-2 gap-2 justify-center">
          {data.map((item) => (
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
    </div>
  );
}
