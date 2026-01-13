// utils/budgetsUtils.js

// Calculate total spend for a category
export function calculateCategorySpend(categoryName, transactions) {
  if (!transactions || !categoryName) return 0;

  return transactions
    .filter((t) => {
      // Match by category name (case-insensitive)
      const txCategory = t.category?.toLowerCase() || "";
      const budgetCategory = categoryName.toLowerCase();
      return txCategory === budgetCategory && t.amount < 0;
    })
    .reduce((total, t) => total + Math.abs(t.amount), 0);
}

// Get last three transactions for a category
export function getLastThreeTransactions(categoryName, transactions) {
  if (!transactions || !categoryName) return [];

  return transactions
    .filter((t) => {
      const txCategory = t.category?.toLowerCase() || "";
      const budgetCategory = categoryName.toLowerCase();
      return txCategory === budgetCategory && t.amount < 0;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
}

// Get progress bar color from hex or Tailwind class
export function getProgressBarColor(color) {
  // If it's already a hex color, return it
  if (color && color.startsWith("#")) {
    return color;
  }

  // Map Tailwind classes to hex colors
  const colorMap = {
    "bg-teal-600": "#0d9488",
    "bg-orange-500": "#f97316",
    "bg-purple-600": "#9333ea",
    "bg-sky-400": "#38bdf8",
    "bg-green-500": "#22c55e",
    "bg-pink-500": "#ec4899",
    "bg-indigo-500": "#6366f1",
    "bg-amber-500": "#f59e0b",
    "bg-red-500": "#ef4444",
    "bg-blue-500": "#3b82f6",
    "bg-emerald-500": "#10b981",
    "bg-rose-500": "#f43f5e",
    "bg-violet-500": "#8b5cf6",
    "bg-fuchsia-500": "#d946ef",
    "bg-cyan-500": "#06b6d4",
    "bg-lime-500": "#84cc16",
  };

  return colorMap[color] || "#0d9488";
}

// Format percentage
export function formatPercentage(spent, max) {
  if (max <= 0) return 0;
  return Math.min((spent / max) * 100, 100);
}

// Get status based on spending
export function getBudgetStatus(spent, max) {
  const percentage = (spent / max) * 100;

  if (percentage >= 100) {
    return { status: "over", label: "Over Budget", color: "text-red-500" };
  } else if (percentage >= 80) {
    return {
      status: "warning",
      label: "Almost Full",
      color: "text-yellow-500",
    };
  } else {
    return { status: "good", label: "On Track", color: "text-green-500" };
  }
}
