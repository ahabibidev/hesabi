// Utility functions for pots
export const calculateProgress = (saved, target) => {
  return Math.min((saved / target) * 100, 100);
};

export const formatPercentage = (saved, target) => {
  return ((saved / target) * 100).toFixed(1);
};

export const formatCurrency = (amount) => {
  return amount.toLocaleString();
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const calculateRemaining = (target, saved) => {
  return Math.max(target - saved, 0);
};
