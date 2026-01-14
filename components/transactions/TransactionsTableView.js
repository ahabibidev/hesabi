// components/transactions/TransactionsTableView.jsx
import TransactionDesktopRow from "./TransactionDesktopRow";
import TransactionMobileRow from "./TransactionMobileRow";

export default function TransactionsTableView({
  transactions,
  searchTerm,
  currency = "USD",
  onClearFilters,
  onEdit,
  onHide,
  onDelete,
  isLoading = false,
}) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No transactions found
        </h3>
        <p className="text-text/70">
          {searchTerm
            ? `No results for "${searchTerm}". Try a different search term.`
            : "No transactions match your current filters."}
        </p>
        <button
          onClick={onClearFilters}
          className="mt-4 text-primary hover:text-primary/80 transition-colors"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-text/10 ${
        isLoading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <table className="w-full">
        {/* Desktop Headers */}
        <thead className="hidden sm:table-header-group bg-table-header border-b border-text/10">
          <tr>
            <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
              Recipient / Sender
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
              Category
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
              Type
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
              Date
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold text-text uppercase tracking-wider">
              Amount
            </th>
            <th className="py-4 px-3 text-left text-sm font-semibold text-text uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Mobile Headers */}
        <thead className="sm:hidden bg-table-header border-b border-text/10">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-text uppercase tracking-wider">
              Transaction
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-text uppercase tracking-wider">
              Amount
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-text uppercase tracking-wider w-12">
              {/* Empty for actions */}
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-text/10">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <TransactionDesktopRow
                transaction={tx}
                currency={currency}
                onEdit={onEdit}
                onHide={onHide}
                onDelete={onDelete}
              />
              <TransactionMobileRow
                transaction={tx}
                currency={currency}
                onEdit={onEdit}
                onHide={onHide}
                onDelete={onDelete}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
