import { memo } from "react";
import Image from "next/image";
import { formatAmount, formatDueDate } from "@/utils/recurringBillsUtils";

function BillRow({ bill }) {
  return (
    <div className="flex w-full border-b border-text/20 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
      <div className="flex-1 flex items-center gap-4">
        <Image
          className="rounded-full"
          src={bill.avatar}
          height={40}
          width={40}
          alt={`${bill.name} avatar`}
          unoptimized
        />
        <div className="flex flex-col">
          <p className="font-semibold truncate max-w-[200px]">{bill.name}</p>
          <p className="md:block hidden text-sm text-text/70 truncate max-w-[200px]">
            {bill.category}
          </p>
          <span className="md:hidden px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {formatDueDate(bill.date)}
          </span>
        </div>
      </div>

      <div className="hidden md:block flex-1">
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {formatDueDate(bill.date)}
        </span>
      </div>

      <div className="col-span-2 text-right">
        <p className="font-bold text-lg">{formatAmount(bill.amount)}</p>
      </div>
    </div>
  );
}

export default memo(BillRow);
