// utils/recurringBillsUtils.js

// Format currency
export function formatAmount(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));
}

// Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Get day name from date
function getDayName(date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
}

// Get month abbreviation from date
function getMonthAbbr(date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[date.getMonth()];
}

// Format due date based on recurring interval
export function formatDueDate(dateString, recurringInterval) {
  if (!dateString) return "No date";

  const date = new Date(dateString);
  const day = date.getDate();

  switch (recurringInterval) {
    case "daily":
      return "Daily";

    case "weekly":
      const dayName = getDayName(date);
      return `Weekly - ${dayName}`;

    case "monthly":
      return `Monthly - ${getOrdinal(day)}`;

    case "yearly":
      const monthAbbr = getMonthAbbr(date);
      return `Yearly - ${monthAbbr} ${getOrdinal(day)}`;

    default:
      // Fallback to monthly if no interval specified
      return `Monthly - ${getOrdinal(day)}`;
  }
}

// Filter bills by search term
export function filterBills(bills, searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") {
    return bills;
  }

  const search = searchTerm.toLowerCase().trim();

  return bills.filter((bill) => {
    const name = bill.name?.toLowerCase() || "";
    const description = bill.description?.toLowerCase() || "";
    const category = bill.category?.toLowerCase() || "";

    return (
      name.includes(search) ||
      description.includes(search) ||
      category.includes(search)
    );
  });
}

// Sort bills
export function sortBills(bills, sortBy) {
  const sorted = [...bills];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "date":
      return sorted.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        // Sort by day of month for recurring bills
        return dateA.getDate() - dateB.getDate();
      });
    case "amount":
      return sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    default:
      return sorted;
  }
}

// Calculate total amount
export function calculateTotalAmount(bills) {
  return bills.reduce((total, bill) => total + Math.abs(bill.amount), 0);
}

// Calculate summary metrics
export function calculateSummaryMetrics(bills) {
  const today = new Date();

  let paidBillsCount = 0;
  let paidBillsAmount = 0;
  let upcomingBillsCount = 0;
  let upcomingBillsAmount = 0;
  let dueSoonBillsCount = 0;
  let dueSoonBillsAmount = 0;

  bills.forEach((bill) => {
    const billDate = new Date(bill.date);
    const amount = Math.abs(bill.amount);
    const interval = bill.recurring_interval || "monthly";

    // Calculate next due date based on interval
    let nextDueDate = getNextDueDate(billDate, interval, today);

    // Calculate days until due
    const daysUntilDue = Math.ceil(
      (nextDueDate - today) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) {
      // Past due or paid
      paidBillsCount++;
      paidBillsAmount += amount;
    } else if (daysUntilDue <= 7) {
      // Due within 7 days
      dueSoonBillsCount++;
      dueSoonBillsAmount += amount;
    } else {
      // Further out
      upcomingBillsCount++;
      upcomingBillsAmount += amount;
    }
  });

  return {
    paidBillsCount,
    paidBillsAmount,
    upcomingBillsCount,
    upcomingBillsAmount,
    dueSoonBillsCount,
    dueSoonBillsAmount,
  };
}

// Helper function to get next due date based on interval
function getNextDueDate(originalDate, interval, today) {
  const nextDate = new Date(originalDate);

  switch (interval) {
    case "daily":
      // Next occurrence is today or tomorrow
      if (nextDate <= today) {
        nextDate.setFullYear(today.getFullYear());
        nextDate.setMonth(today.getMonth());
        nextDate.setDate(today.getDate());
      }
      break;

    case "weekly":
      // Find the next occurrence of the same day of week
      const targetDay = originalDate.getDay();
      const todayDay = today.getDay();
      let daysToAdd = targetDay - todayDay;
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }
      nextDate.setFullYear(today.getFullYear());
      nextDate.setMonth(today.getMonth());
      nextDate.setDate(today.getDate() + daysToAdd);
      break;

    case "monthly":
      // Set to this month's occurrence
      nextDate.setFullYear(today.getFullYear());
      nextDate.setMonth(today.getMonth());
      // If already passed this month, use next month
      if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;

    case "yearly":
      // Set to this year's occurrence
      nextDate.setFullYear(today.getFullYear());
      // If already passed this year, use next year
      if (nextDate < today) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      break;

    default:
      // Default to monthly behavior
      nextDate.setFullYear(today.getFullYear());
      nextDate.setMonth(today.getMonth());
      if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
  }

  return nextDate;
}
