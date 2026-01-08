import DashboardLayout from "../dashboard/DashboardLayout";
import BudgetsClientWrapper from "@/components/budgets/BudgetsClientWrapper";
import { initialBudgets } from "@/data/transactionsData";
import { allTransactions } from "@/data/transactionsData";

// This is a SERVER component
export default function BudgetsPage() {
  return (
    <DashboardLayout>
      <BudgetsClientWrapper
        initialBudgets={initialBudgets}
        allTransactions={allTransactions}
      />
    </DashboardLayout>
  );
}
