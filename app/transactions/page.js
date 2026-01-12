// app/transactions/page.jsx
import { redirect } from "next/navigation";
import DashboardLayout from "../dashboard/DashboardLayout";
import TransactionsClientWrapper from "@/components/transactions/TransactionsClientWrapper";
import { getTransactionsData } from "@/lib/transactions";

export default async function TransactionsPage() {
  const data = await getTransactionsData();

  if (!data) {
    redirect("/login");
  }

  const { user, transactions, categories } = data;

  return (
    <DashboardLayout>
      <TransactionsClientWrapper
        initialTransactions={transactions}
        categories={categories}
        currency={user?.currency || "USD"}
      />
    </DashboardLayout>
  );
}
