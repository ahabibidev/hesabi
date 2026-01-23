// components/dashboard/TransactionsSection.jsx
import SectionHeader from "./SectionHeader";
import TransactionRow from "./TransactionRow";

export default function TransactionsSection({
  transactions,
  currency = "USD",
  maxItems = 5,
}) {
  const displayTransactions = transactions.slice(0, maxItems);
  const hasNoTransactions = !transactions || transactions.length === 0;

  return (
    <div className="flex w-full flex-col h-full bg-background shadow-xl bg-brand-gradient border border-text/10 p-6 gap-3 rounded-2xl">
      <SectionHeader title="Transactions" linkHref="/transactions" />

      {hasNoTransactions ? (
        <div className="flex items-center h-full justify-center py-10  text-text/50">
          <p>No transactions yet. Add your first transaction!</p>
        </div>
      ) : (
        displayTransactions.map((transaction, index) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            currency={currency}
            showBorder={index !== displayTransactions.length - 1}
          />
        ))
      )}
    </div>
  );
}
