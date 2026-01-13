// app/transactions/page.jsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import DashboardLayout from "../dashboard/DashboardLayout";
import TransactionsClientWrapper from "@/components/transactions/TransactionsClientWrapper";
import { getTransactionsData } from "@/lib/transactions";

// Loading component
function TransactionsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
  );
}

async function TransactionsContent() {
  const data = await getTransactionsData();

  if (!data) {
    redirect("/login");
  }

  const { user, transactions, categories } = data;

  return (
    <TransactionsClientWrapper
      initialTransactions={transactions}
      categories={categories}
      currency={user?.currency || "USD"}
    />
  );
}

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<TransactionsLoading />}>
        <TransactionsContent />
      </Suspense>
    </DashboardLayout>
  );
}
