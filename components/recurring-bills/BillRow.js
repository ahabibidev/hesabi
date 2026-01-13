// components/recurring-bills/BillRow.jsx
import { memo } from "react";
import CategoryIcon from "@/components/dashboard/CategoryIcon";
import { formatAmount, formatDueDate } from "@/utils/recurringBillsUtils";

function BillRow({ bill }) {
  // Category color with fallback
  const categoryColor = bill.category_color || "#6B7280";

  return (
    <div className="flex w-full border-b border-text/20 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
      <div className="flex-1 flex items-center gap-4">
        {/* Category Icon with colored background */}
        <div
          className="p-2 w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: categoryColor }}
        >
          <CategoryIcon
            icon={bill.category_icon || "default"}
            className="text-white w-5 h-5"
          />
        </div>

        <div className="flex flex-col">
          <p className="font-semibold truncate max-w-50">{bill.name}</p>
          <p className="md:block hidden text-sm text-text/70 truncate max-w-50">
            {bill.category}
          </p>
          {/* Mobile: Show due date badge */}
          <span className="md:hidden px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium w-fit mt-1">
            {formatDueDate(bill.date, bill.recurring_interval)}
          </span>
        </div>
      </div>

      {/* Desktop: Due Date */}
      <div className="hidden md:block flex-1">
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {formatDueDate(bill.date, bill.recurring_interval)}
        </span>
      </div>

      {/* Amount */}
      <div className="col-span-2 text-right">
        <p className="font-bold text-lg">{formatAmount(bill.amount)}</p>
      </div>
    </div>
  );
}

export default memo(BillRow);
