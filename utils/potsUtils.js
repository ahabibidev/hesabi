// utils/potsUtils.js
import { formatCurrency as formatCurrencyLib } from "@/lib/constants";

// Calculate progress percentage
export function calculateProgress(saved, target) {
  if (target <= 0) return 0;
  return Math.min((saved / target) * 100, 100);
}

// Format percentage
export function formatPercentage(saved, target) {
  const progress = calculateProgress(saved, target);
  return progress.toFixed(1);
}

// Calculate remaining amount
export function calculateRemaining(target, saved) {
  return Math.max(target - saved, 0);
}

// Format currency (simple version for backward compatibility)
export function formatCurrency(amount) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Format date
export function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Get color hex from various formats
export function getColorHex(color) {
  if (!color) return "#3B82F6";

  // If it's already a hex color
  if (color.startsWith("#")) {
    return color;
  }

  // Map Tailwind classes to hex
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

  return colorMap[color] || "#3B82F6";
}
