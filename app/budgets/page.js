// app/budget/page.jsx
import { redirect } from "next/navigation";
import DashboardLayout from "../dashboard/DashboardLayout";
import BudgetsClientWrapper from "@/components/budgets/BudgetsClientWrapper";
import { getBudgetsData } from "@/lib/budgets";

export default async function BudgetsPage() {
  const data = await getBudgetsData();

  if (!data) {
    redirect("/login");
  }

  const { user, budgets, transactions, categories } = data;

  return (
    <DashboardLayout>
      <BudgetsClientWrapper
        initialBudgets={budgets}
        allTransactions={transactions}
        categories={categories}
        currency={user?.currency || "USD"}
      />
    </DashboardLayout>
  );
}
