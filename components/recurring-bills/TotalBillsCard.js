import { RiBillLine } from "react-icons/ri";
import { formatAmount } from "@/utils/recurringBillsUtils";

export default function TotalBillsCard({ totalAmount }) {
  return (
    <div className="flex flex-row md:flex-col gap-7 w-full text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 rounded-2xl">
      <RiBillLine className="text-5xl" />
      <p className="flex flex-col text-text">
        Total Bills
        <span className="text-3xl text-foreground font-bold">
          {formatAmount(totalAmount)}
        </span>
      </p>
    </div>
  );
}
