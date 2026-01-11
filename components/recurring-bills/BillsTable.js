import BillRow from "./BillRow";
import { formatAmount } from "@/utils/recurringBillsUtils";

export default function BillsTable({ bills, totalBills, totalAmount }) {
  return (
    <div className="flex flex-col w-full justify-center overflow-x-auto">
      {/* Table Header */}
      <div className="flex w-full border-b border-text/20 pb-3">
        <div className="flex-1 text-text font-medium">Bill Title</div>
        <div className="hidden md:block flex-1 text-text font-medium">
          Due Date
        </div>
        <div className="col-span-2 text-text font-medium">Amount</div>
      </div>

      {/* Bills List */}
      <div className="flex flex-col">
        {bills.map((bill) => (
          <BillRow key={bill.id} bill={bill} />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="pt-4 mt-4 border-t border-text/20">
        <div className="flex justify-between items-center">
          <p className="text-text">
            Showing {bills.length} of {totalBills}
          </p>
          <p className="font-bold text-lg">
            Total: {formatAmount(totalAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}
