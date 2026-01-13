// components/budgets/LatestSpendingSection.jsx
import SectionHeader from "@/components/dashboard/SectionHeader";
import CategoryIcon from "@/components/dashboard/CategoryIcon";
import { formatCurrency, formatDate } from "@/lib/constants";

export default function LatestSpendingSection({
  budgetName,
  categoryName, // Add this prop for the actual category name
  transactions,
  currency = "USD",
}) {
  // Use categoryName if provided, otherwise fall back to budgetName
  const filterCategory = categoryName || budgetName;

  return (
    <div className="flex w-full flex-col h-auto mt-5 md:mt-10 bg-background shadow-xl border border-text/10 p-6 gap-5 rounded-2xl">
      <SectionHeader
        title="Latest Spending"
        textSize="text-md"
        linkHref={`/transactions?category=${encodeURIComponent(
          filterCategory
        )}`}
      />

      {transactions.length > 0 ? (
        transactions.map((transaction, index) => {
          const displayDate =
            typeof transaction.date === "string" &&
            transaction.date.includes("-")
              ? formatDate(transaction.date)
              : transaction.date;

          return (
            <div
              key={transaction.id}
              className={`flex justify-between pb-5 ${
                index < transactions.length - 1 ? "border-b border-text/10" : ""
              }`}
            >
              <div className="flex gap-4 items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: transaction.category_color || "#6B7280",
                  }}
                >
                  <CategoryIcon
                    icon={transaction.category_icon || "default"}
                    className="text-white w-4 h-4"
                  />
                </div>
                <p>{transaction.name}</p>
              </div>
              <div>
                <p className="font-bold text-right">
                  {formatCurrency(Math.abs(transaction.amount), currency)}
                </p>
                <p className="text-text text-right">{displayDate}</p>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center my-5 text-text">No spending yet</p>
      )}
    </div>
  );
}
