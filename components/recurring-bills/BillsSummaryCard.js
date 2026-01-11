import { formatAmount } from "@/utils/recurringBillsUtils";

export default function BillsSummaryCard({ summaryMetrics }) {
  return (
    <div className="flex flex-col gap-5 w-full text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 rounded-2xl">
      <h2 className="font-bold text-xl">Summary</h2>

      <div className="flex justify-between pb-3 border-b border-text/20">
        <p className="text-text">Paid Bills</p>
        <p className="font-bold">
          {summaryMetrics.paidBillsCount} (
          {formatAmount(summaryMetrics.paidBillsAmount)})
        </p>
      </div>

      <div className="flex justify-between pb-3 border-b border-text/20">
        <p className="text-text">Total Upcoming</p>
        <p className="font-bold">
          {summaryMetrics.upcomingBillsCount} (
          {formatAmount(summaryMetrics.upcomingBillsAmount)})
        </p>
      </div>

      <div className="flex text-red-500 justify-between pb-3 border-b border-text/20">
        <p>Due Soon</p>
        <p className="font-bold">
          {summaryMetrics.dueSoonBillsCount} (
          {formatAmount(summaryMetrics.dueSoonBillsAmount)})
        </p>
      </div>
    </div>
  );
}
