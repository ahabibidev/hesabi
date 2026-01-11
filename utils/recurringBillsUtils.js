// Utility functions for recurring bills
export const formatAmount = (amount) => {
  return `$${Math.abs(amount).toFixed(2)}`;
};

export const formatDueDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();

  // Get ordinal suffix
  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) suffix = "st";
  else if (day === 2 || day === 22) suffix = "nd";
  else if (day === 3 || day === 23) suffix = "rd";

  return `Monthly ${day}${suffix}`;
};

export const filterBills = (bills, searchTerm) => {
  if (searchTerm.trim() === "") return bills;

  const term = searchTerm.toLowerCase();
  return bills.filter(
    (bill) =>
      bill.name.toLowerCase().includes(term) ||
      bill.description.toLowerCase().includes(term) ||
      bill.category.toLowerCase().includes(term)
  );
};

export const sortBills = (bills, sortBy) => {
  const sorted = [...bills];

  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "date":
      sorted.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      break;
    case "amount":
      sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
      break;
    default:
      break;
  }

  return sorted;
};

export const calculateSummaryMetrics = (bills) => {
  const currentDate = new Date();
  const currentDay = currentDate.getDate();

  let paidBillsCount = 0;
  let paidBillsAmount = 0;
  let upcomingBillsCount = 0;
  let upcomingBillsAmount = 0;
  let dueSoonBillsCount = 0;
  let dueSoonBillsAmount = 0;

  bills.forEach((bill) => {
    const billDate = new Date(bill.date);
    const billDay = billDate.getDate();
    const billAmount = Math.abs(bill.amount);

    // Check if bill is paid (date has passed)
    if (billDay < currentDay) {
      paidBillsCount++;
      paidBillsAmount += billAmount;
    } else {
      // Bill is upcoming
      upcomingBillsCount++;
      upcomingBillsAmount += billAmount;

      // Check if bill is due soon (within 5 days)
      const daysUntilDue = billDay - currentDay;
      if (daysUntilDue >= 0 && daysUntilDue <= 5) {
        dueSoonBillsCount++;
        dueSoonBillsAmount += billAmount;
      }
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
};

export const calculateTotalAmount = (bills) => {
  return bills.reduce((sum, bill) => sum + Math.abs(bill.amount), 0);
};
