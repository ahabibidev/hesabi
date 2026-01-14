import { getPageNumbers } from "@/utils/transactionUtils";

export default function TransactionsPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalFiltered,
  totalAll,
  onPageChange,
}) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-text/10">
      <div className="hidden md:block text-sm text-text/70">
        Showing{" "}
        <span className="font-medium text-foreground">
          {startIndex + 1}-{Math.min(endIndex, totalFiltered)}
        </span>{" "}
        of <span className="font-medium text-foreground">{totalFiltered}</span>{" "}
        transactions
        {totalFiltered !== totalAll && (
          <span className="ml-2">(filtered from {totalAll} total)</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-text/70 text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground"
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
