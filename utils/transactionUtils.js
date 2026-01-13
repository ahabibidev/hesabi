// Utility functions for transactions
export const formatAmount = (amount) => {
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
};

export const getAmountColor = (amount) => {
  return amount >= 0 ? "text-green-500" : "text-red-500";
};

export const getTypeBadgeClass = (type) => {
  return type === "Income"
    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
};

export const getCategoryColor = (category) => {
  const colors = {
    Salary: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Groceries:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Dining: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Shopping:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    Entertainment:
      "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    Freelance:
      "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    Transportation:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  };
  return (
    colors[category] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
  );
};

export const filterTransactions = (
  transactions,
  { searchTerm, categoryFilter, typeFilter }
) => {
  let filtered = [...transactions];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter((tx) => {
      // Use fallback empty strings to prevent 'toLowerCase' on null/undefined
      const name = (tx.name || "").toLowerCase();
      const category = (tx.category || "").toLowerCase();
      const description = (tx.description || "").toLowerCase();
      const amount = Math.abs(tx.amount || 0).toString();

      return (
        name.includes(term) ||
        category.includes(term) ||
        description.includes(term) ||
        amount.includes(searchTerm)
      );
    });
  }

  if (categoryFilter !== "all") {
    filtered = filtered.filter((tx) => tx.category === categoryFilter);
  }

  if (typeFilter !== "all") {
    filtered = filtered.filter((tx) => tx.type === typeFilter);
  }

  return filtered;
};

export const sortTransactions = (transactions, sortBy) => {
  const sorted = [...transactions];

  switch (sortBy) {
    case "latest":
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "oldest":
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "amount-high":
      sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
      break;
    case "amount-low":
      sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
      break;
    case "income-first":
      sorted.sort((a, b) => {
        if (a.type === "Income" && b.type !== "Income") return -1;
        if (a.type !== "Income" && b.type === "Income") return 1;
        return 0;
      });
      break;
    case "expense-first":
      sorted.sort((a, b) => {
        if (a.type === "Expense" && b.type !== "Expense") return -1;
        if (a.type !== "Expense" && b.type === "Expense") return 1;
        return 0;
      });
      break;
    default:
      break;
  }

  return sorted;
};

export const getPageNumbers = (currentPage, totalPages) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    const half = Math.floor(maxVisiblePages / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = maxVisiblePages;
    }

    if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxVisiblePages + 1;
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    if (start > 1) {
      pageNumbers.unshift("...");
      pageNumbers.unshift(1);
    }

    if (end < totalPages) {
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
  }

  return pageNumbers;
};
