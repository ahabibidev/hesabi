// components/dashboard/RecurringBillsSection.jsx
import SectionHeader from "./SectionHeader";
import BillItem from "./BillItem";
import { formatCurrency } from "@/lib/constants";

export default function RecurringBillsSection({
  bills,
  billsSummary,
  currency = "USD",
}) {
  // If bills summary is provided, create summary items
  // Otherwise use the bills array directly
  const displayBills = billsSummary
    ? [
        {
          name: "Paid Bills",
          amount: formatCurrency(billsSummary.paid || 0, currency),
          color: "bg-amber-700",
        },
        {
          name: "Total Upcoming",
          amount: formatCurrency(billsSummary.upcoming || 0, currency),
          color: "bg-blue-800",
        },
        {
          name: "Due Soon",
          amount: formatCurrency(billsSummary.dueSoon || 0, currency),
          color: "bg-teal-700",
        },
      ]
    : bills;

  return (
    <div className="flex flex-col text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 gap-5 rounded-2xl">
      <SectionHeader title="Recurring Bills" linkHref="/recurring-bills" />

      <div className="flex flex-col gap-3">
        {displayBills.map((bill, index) => (
          <BillItem
            key={index}
            name={bill.name}
            amount={bill.amount}
            color={bill.color}
            colorHex={bill.colorHex}
          />
        ))}
      </div>
    </div>
  );
}
