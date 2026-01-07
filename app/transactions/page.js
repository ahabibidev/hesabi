import DashboardLayout from "../dashboard/DashboardLayout";
import TransactionsClientWrapper from "@/components/transactions/TransactionsClientWrapper";
import { allTransactions } from "@/data/transactionsData";

// This is a SERVER component
export default function TransactionsPage() {
  console.log(allTransactions);
  return (
    <DashboardLayout>
      <TransactionsClientWrapper initialTransactions={allTransactions} />
    </DashboardLayout>
  );
}
