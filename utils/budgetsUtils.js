// Utility functions for budgets
export const calculateCategorySpend = (categoryName, transactions) => {
  return transactions
    .filter((tx) => tx.type === "Expense" && tx.category === categoryName)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
};

export const getLastThreeTransactions = (categoryName, transactions) => {
  return transactions
    .filter((tx) => tx.type === "Expense" && tx.category === categoryName)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
};

export const getProgressBarColor = (budgetColor) => {
  const colorMap = {
    "bg-teal-600": "rgb(13, 148, 136)",
    "bg-orange-500": "rgb(249, 115, 22)",
    "bg-purple-600": "rgb(147, 51, 234)",
    "bg-sky-400": "rgb(56, 189, 248)",
    "bg-green-500": "rgb(34, 197, 94)",
    "bg-pink-500": "rgb(236, 72, 153)",
    "bg-indigo-500": "rgb(99, 102, 241)",
    "bg-amber-500": "rgb(245, 158, 11)",
    "bg-red-500": "rgb(239, 68, 68)",
    "bg-blue-500": "rgb(59, 130, 246)",
    "bg-emerald-500": "rgb(16, 185, 129)",
    "bg-rose-500": "rgb(244, 63, 94)",
    "bg-violet-500": "rgb(139, 92, 246)",
    "bg-fuchsia-500": "rgb(217, 70, 239)",
    "bg-cyan-500": "rgb(6, 182, 212)",
    "bg-lime-500": "rgb(132, 204, 22)",
  };
  return colorMap[budgetColor] || "rgb(13, 148, 136)";
};

export const getAvailableThemeColors = (
  themeColors,
  existingBudgets,
  editingBudget = null
) => {
  const usedColors = existingBudgets.map((budget) => budget.color);
  return themeColors.filter(
    (color) =>
      !usedColors.includes(color.bgClass) ||
      (editingBudget && editingBudget.color === color.bgClass)
  );
};

export const getColorHex = (colorClass) => {
  const colorMap = {
    "teal-600": "#0d9488",
    "orange-500": "#f97316",
    "purple-600": "#9333ea",
    "sky-400": "#38bdf8",
    "green-500": "#22c55e",
    "pink-500": "#ec4899",
    "indigo-500": "#6366f1",
    "amber-500": "#f59e0b",
    "red-500": "#ef4444",
    "blue-500": "#3b82f6",
    "emerald-500": "#10b981",
    "rose-500": "#f43f5e",
    "violet-500": "#8b5cf6",
    "fuchsia-500": "#d946ef",
    "cyan-500": "#06b6d4",
    "lime-500": "#84cc16",
  };
  return colorMap[colorClass] || "#0d9488";
};
