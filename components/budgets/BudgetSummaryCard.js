import BudgetChart from "@/components/dashboard/BudgetChart";

export default function BudgetSummaryCard({ budgets, spendData }) {
  return (
    <div className="flex flex-col h-180 items-center md:w-2/5 text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 rounded-2xl">
      <BudgetChart />
      <div className="flex flex-col mt-10 self-start w-full">
        <h2 className="text-2xl font-bold">Spending Summary</h2>
        {budgets.map((budget) => {
          const spend = spendData[budget.name] || 0;
          return (
            <div
              key={budget.id}
              className="flex mt-5 items-center justify-between pb-3 border-b border-text/20"
            >
              <div className="flex items-center gap-3">
                <div className={`w-1 h-10 ${budget.color}`}></div>
                <p>{budget.name}</p>
              </div>

              <div className="flex gap-3">
                <p className="font-bold">${spend.toLocaleString()}</p>
                <span className="text-text">
                  of ${budget.max.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
