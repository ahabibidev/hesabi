// lib/constants.js

// Default avatar configuration
export const DEFAULT_AVATAR = "/avatars/user.png";

export const DEFAULT_PASSWORD_DATA = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

// Available avatar options
export const AVATAR_OPTIONS = [
  "/avatars/user.png",
  "/avatars/bear.png",
  "/avatars/boy.png",
  "/avatars/cat.png",
  "/avatars/chicken.png",
  "/avatars/gamer.png",
  "/avatars/man.png",
  "/avatars/girl.png",
  "/avatars/woman.png",
  "/avatars/woman (1).png",
];

// Currency options
// `decimals` is how the currency is actually written day to day — Afghanis and
// Rials are quoted whole, so showing them with cents is noise.
export const CURRENCY_OPTIONS = [
  { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", decimals: 2 },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋", decimals: 0 },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼", decimals: 0 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", decimals: 2 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", decimals: 0 },
];

// Theme colors for budgets, pots, etc.
export const THEME_COLORS = [
  { name: "Teal", value: "teal-600", bgClass: "bg-teal-600", hex: "#0d9488" },
  {
    name: "Orange",
    value: "orange-500",
    bgClass: "bg-orange-500",
    hex: "#f97316",
  },
  {
    name: "Purple",
    value: "purple-600",
    bgClass: "bg-purple-600",
    hex: "#9333ea",
  },
  { name: "Sky", value: "sky-400", bgClass: "bg-sky-400", hex: "#38bdf8" },
  {
    name: "Green",
    value: "green-500",
    bgClass: "bg-green-500",
    hex: "#22c55e",
  },
  { name: "Pink", value: "pink-500", bgClass: "bg-pink-500", hex: "#ec4899" },
  {
    name: "Indigo",
    value: "indigo-500",
    bgClass: "bg-indigo-500",
    hex: "#6366f1",
  },
  {
    name: "Amber",
    value: "amber-500",
    bgClass: "bg-amber-500",
    hex: "#f59e0b",
  },
  { name: "Red", value: "red-500", bgClass: "bg-red-500", hex: "#ef4444" },
  { name: "Blue", value: "blue-500", bgClass: "bg-blue-500", hex: "#3b82f6" },
  {
    name: "Emerald",
    value: "emerald-500",
    bgClass: "bg-emerald-500",
    hex: "#10b981",
  },
  { name: "Rose", value: "rose-500", bgClass: "bg-rose-500", hex: "#f43f5e" },
  {
    name: "Violet",
    value: "violet-500",
    bgClass: "bg-violet-500",
    hex: "#8b5cf6",
  },
  {
    name: "Fuchsia",
    value: "fuchsia-500",
    bgClass: "bg-fuchsia-500",
    hex: "#d946ef",
  },
  { name: "Cyan", value: "cyan-500", bgClass: "bg-cyan-500", hex: "#06b6d4" },
  { name: "Lime", value: "lime-500", bgClass: "bg-lime-500", hex: "#84cc16" },
];

// Category icons mapping (using lucide-react icon names)
export const CATEGORY_ICONS = {
  // Expense
  entertainment: "film",
  groceries: "shopping-cart",
  dining: "utensils",
  transportation: "car",
  shopping: "shopping-bag",
  bills: "file-text",
  "personal-care": "heart",
  healthcare: "activity",
  education: "book",
  housing: "home",
  utilities: "zap",
  insurance: "shield",
  subscriptions: "repeat",
  // Income
  salary: "briefcase",
  freelance: "laptop",
  investments: "trending-up",
  gifts: "gift",
  refunds: "rotate-ccw",
  bonus: "award",
  // General
  other: "more-horizontal",
  transfer: "arrow-right-left",
  default: "circle",
};

// Default categories (these are created in DB automatically)
export const DEFAULT_CATEGORIES = {
  expense: [
    "Entertainment",
    "Groceries",
    "Dining",
    "Transportation",
    "Shopping",
    "Bills",
    "Personal Care",
    "Healthcare",
    "Education",
    "Housing",
    "Utilities",
    "Insurance",
    "Subscriptions",
  ],
  income: ["Salary", "Freelance", "Investments", "Gifts", "Refunds", "Bonus"],
  both: ["Other", "Transfer"],
};

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

// Budget periods
export const BUDGET_PERIODS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Recurring intervals
export const RECURRING_INTERVALS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Helper functions
export function getUserAvatar(userAvatar) {
  if (userAvatar && userAvatar !== DEFAULT_AVATAR) {
    return userAvatar;
  }
  return DEFAULT_AVATAR;
}

export function isDefaultAvatar(avatar) {
  return !avatar || avatar === DEFAULT_AVATAR;
}

export function getInitials(name) {
  if (!name) return "U";
  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
}

export function formatCurrency(amount, currencyCode = "USD") {
  const currency = CURRENCY_OPTIONS.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol || "$";
  const decimals = currency?.decimals ?? 2;

  const formattedAmount = Math.abs(Number(amount) || 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    },
  );

  // Non-Latin symbols sit too close to the digits without a space.
  if (currencyCode === "AFN" || currencyCode === "IRR") {
    return `${symbol} ${formattedAmount}`;
  }

  return `${symbol}${formattedAmount}`;
}

//Use the Following Code if You Need Persian Digits with AFN and IRR Currencies

// // Persian/Dari number digits
// const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

// // Convert English numbers to Persian numbers with Persian separators
// function toPersianNumbers(str, usePersianSeparators = false) {
//   let result = str.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);

//   if (usePersianSeparators) {
//     // Replace comma with Persian thousands separator
//     result = result.replace(/,/g, "٬");
//     // Replace dot with Persian decimal separator
//     result = result.replace(/\./g, "٫");
//   }

//   return result;
// }

// export function formatCurrency(amount, currencyCode = "USD") {
//   const currency = CURRENCY_OPTIONS.find((c) => c.code === currencyCode);
//   const symbol = currency?.symbol || "$";

//   const formattedAmount = Math.abs(amount).toLocaleString("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

//   // Use Persian numbers and add space for AFN and IRR
//   const persianCurrencies = ["AFN", "IRR"];
//   if (persianCurrencies.includes(currencyCode)) {
//     // Set second parameter to true if you want Persian separators (٬ and ٫)
//     const persianAmount = toPersianNumbers(formattedAmount, true);
//     return `${symbol} ${persianAmount}`;
//   }

//   return `${symbol}${formattedAmount}`;
// }

export function formatDate(dateString, format = "short") {
  const date = new Date(dateString);

  if (format === "short") {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (format === "long") {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return date.toISOString().split("T")[0];
}

export function getColorByHex(hex) {
  return THEME_COLORS.find((c) => c.hex === hex) || THEME_COLORS[0];
}

export function getColorByClass(bgClass) {
  return THEME_COLORS.find((c) => c.bgClass === bgClass) || THEME_COLORS[0];
}
