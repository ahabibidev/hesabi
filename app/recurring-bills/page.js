import DashboardLayout from "../dashboard/DashboardLayout";
import RecurringBillsClientWrapper from "@/components/recurring-bills/RecurringBillsClientWrapper";
import { allTransactions } from "@/data/transactionsData";

// This is a SERVER component
export default function RecurringBillsPage() {
  // Filter only recurring bills on the server
  const recurringBills = allTransactions.filter(
    (transaction) => transaction.recurring === true
  );

  return (
    <DashboardLayout>
      <RecurringBillsClientWrapper recurringBills={recurringBills} />
    </DashboardLayout>
  );
}
