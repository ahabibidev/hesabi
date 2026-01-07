import Header from "@/components/header/Header";
import DashboardLayout from "../dashboard/DashboardLayout";
import BudgetChart from "@/components/dashboard/BudgetChart";
import { Budgets } from "@/data/transactionsData";

export default function BudgetsPage() {
  return (
    <DashboardLayout>
      <Header
        buttonText={"Add New Budget"}
        pageHeader={"Budgets"}
        pageSubHeader={"Manage your budgets"}
      />
      <div className="flex flex-row">
        <div className="flex flex-col items-center w-2/5 text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 rounded-2xl">
          <BudgetChart />
          <div className="flex flex-col mt-10 self-start w-full">
            <h2 className="text-2xl font-bold">Spending Summary</h2>
            {Budgets.map((budget) => (
              <div
                key={budget.id}
                className="flex mt-5 justify-between pb-3 border-b border-text/20"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-10 ${budget.color}`}></div>
                  <p>{budget.name}</p>
                </div>

                <div className="flex gap-3">
                  <p className="font-bold">${budget.spend.toLocaleString()}</p>
                  <span className="text-text">
                    of ${budget.max.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
