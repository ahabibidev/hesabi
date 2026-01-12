// components/dashboard/TransactionsSection.jsx
import SectionHeader from "./SectionHeader";
import TransactionRow from "./TransactionRow";

export default function TransactionsSection({
  transactions,
  currency = "USD",
  maxItems = 5,
}) {
  const displayTransactions = transactions.slice(0, maxItems);

  return (
    <div className="flex w-full flex-col h-full bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 gap-5 rounded-2xl">
      <SectionHeader title="Transactions" linkHref="/transactions" />
      {displayTransactions.map((transaction, index) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          currency={currency}
          showBorder={index !== displayTransactions.length - 1}
        />
      ))}
    </div>
  );
}
