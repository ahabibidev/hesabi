// components/dashboard/TransactionRow.jsx
import CategoryIcon from "./CategoryIcon";
import { formatCurrency, formatDate } from "@/lib/constants";

export default function TransactionRow({
  transaction,
  currency = "USD",
  showBorder = true,
}) {
  // Handle both old format (amount with sign) and new format (type field)
  const amount =
    transaction.type === "expense"
      ? -Math.abs(transaction.amount)
      : Math.abs(transaction.amount);

  const formatAmount = (amt) => {
    const sign = amt >= 0 ? "+" : "-";
    return `${sign}${formatCurrency(Math.abs(amt), currency)}`;
  };

  const getAmountColor = (amt) => {
    return amt >= 0 ? "text-green-500" : "text-red-500";
  };

  // Use name field (new) or sender field (old)
  const displayName = transaction.name || transaction.sender;

  // Format date - handle both formats
  const displayDate =
    typeof transaction.date === "string" && transaction.date.includes("-")
      ? formatDate(transaction.date)
      : transaction.date;

  return (
    <div
      className={`flex justify-between pb-3 ${
        showBorder ? "border-b border-text/30" : ""
      }`}
    >
      <div className="flex gap-4 items-center">
        <CategoryIcon
          icon={transaction.category_icon || "default"}
          className="text-white w-5 h-5"
        />
        <p>{displayName}</p>
      </div>
      <div>
        <p className={`font-bold text-right ${getAmountColor(amount)}`}>
          {formatAmount(amount)}
        </p>
        <p className="text-text text-right">{displayDate}</p>
      </div>
    </div>
  );
}
