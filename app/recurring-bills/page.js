"use client";

import { useState, useMemo } from "react";
import { RiBillLine } from "react-icons/ri";
import Header from "@/components/header/Header";
import DashboardLayout from "../dashboard/DashboardLayout";
import Image from "next/image";
import { allTransactions } from "@/data/transactionsData";

export default function RecurringBills() {
  // Filter only recurring bills
  const recurringBills = allTransactions.filter(
    (transaction) => transaction.recurring === true
  );

  // State for search and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Filter and sort logic
  const filteredAndSortedBills = useMemo(() => {
    let result = [...recurringBills];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (bill) =>
          bill.name.toLowerCase().includes(term) ||
          bill.description.toLowerCase().includes(term) ||
          bill.category.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "date":
        result.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case "amount":
        result.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        break;
      default:
        break;
    }

    return result;
  }, [recurringBills, searchTerm, sortBy]);

  // Calculate summary statistics
  const totalAmount = filteredAndSortedBills.reduce(
    (sum, bill) => sum + Math.abs(bill.amount),
    0
  );

  const totalBills = filteredAndSortedBills.length;

  // Function to format amount as positive currency
  const formatAmount = (amount) => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  // Function to extract day from date string and format as "Monthly 12th"
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();

    // Get ordinal suffix
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";

    return `Monthly ${day}${suffix}`;
  };

  // Get current date
  const currentDate = new Date();
  const currentDay = currentDate.getDate();

  // Calculate summary metrics
  const getSummaryMetrics = useMemo(() => {
    let paidBillsCount = 0;
    let paidBillsAmount = 0;
    let upcomingBillsCount = 0;
    let upcomingBillsAmount = 0;
    let dueSoonBillsCount = 0;
    let dueSoonBillsAmount = 0;

    recurringBills.forEach((bill) => {
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
  }, [recurringBills]);

  return (
    <DashboardLayout>
      <Header
        pageHeader={"Recurring Bills"}
        pageSubHeader={"Manage your recurring bills and payments."}
        buttonDisplay={"hidden"}
      />
      <div className="flex w-full flex-col md:flex-row md:px-30 gap-10">
        {/* Left Side - Summary Cards */}
        <div className="flex flex-col gap-5 md:w-2/5">
          <div className="flex flex-row md:flex-col gap-7 w-full text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6  rounded-2xl">
            <RiBillLine className="text-5xl" />
            <p className="flex flex-col text-text">
              Total Bills
              <span className="text-3xl text-foreground font-bold">
                {formatAmount(totalAmount)}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-5 w-full text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 rounded-2xl">
            <h2 className="font-bold text-xl">Summary</h2>
            <div className="flex justify-between pb-3 border-b border-text/20">
              <p className="text-text">Paid Bills</p>
              <p className="font-bold">
                {getSummaryMetrics.paidBillsCount} (
                {formatAmount(getSummaryMetrics.paidBillsAmount)})
              </p>
            </div>
            <div className="flex justify-between pb-3 border-b border-text/20">
              <p className="text-text">Total Upcoming</p>
              <p className="font-bold">
                {getSummaryMetrics.upcomingBillsCount} (
                {formatAmount(getSummaryMetrics.upcomingBillsAmount)})
              </p>
            </div>
            <div className="flex text-red-500 justify-between pb-3 border-b border-text/20">
              <p>Due Soon</p>
              <p className="font-bold">
                {getSummaryMetrics.dueSoonBillsCount} (
                {formatAmount(getSummaryMetrics.dueSoonBillsAmount)})
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Bills List */}
        <div className="flex flex-col gap-10 w-full text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 rounded-2xl">
          {/* Search and Sort Controls */}
          <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
            <div className="relative w-full md:w-auto flex-1 max-w-md">
              <input
                className="w-full rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 pr-12 text-foreground placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-200"
                placeholder="Search Bills by name, description, or category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/50 hover:text-text"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium text-text whitespace-nowrap">
                Sort by
              </span>
              <select
                className="rounded-xl border border-text/20 bg-background dark:bg-gray-900 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent w-full md:min-w-35 cursor-pointer transition-all duration-200"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="date">Due Date</option>
                <option value="amount">Amount (High-Low)</option>
              </select>
            </div>
          </div>

          {/* Bills Table */}
          {filteredAndSortedBills.length > 0 ? (
            <div className="flex flex-col w-full  justify-center overflow-x-auto">
              {/* Table Header */}
              <div className="flex  w-full border-b border-text/20 pb-3">
                <div className="flex-1 text-text font-medium">Bill Title</div>
                <div className="hidden md:block flex-1 text-text font-medium">
                  Due Date
                </div>
                <div className="col-span-2 text-text font-medium">Amount</div>
              </div>

              {/* Bills List */}
              <div className="flex flex-col">
                {filteredAndSortedBills.map((bill) => (
                  <div key={bill.id} className="contents">
                    <div className="flex w-full border-b border-text/20 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                      <div className="flex-1 flex items-center gap-4">
                        <Image
                          className="rounded-full"
                          src={bill.avatar}
                          height={40}
                          width={40}
                          alt={`${bill.name} avatar`}
                          unoptimized // For external images
                        />
                        <div className="flex flex-col">
                          <p className="font-semibold truncate max-w-[200px]">
                            {bill.name}
                          </p>
                          <p className="md:block hidden text-sm text-text/70 truncate max-w-[200px]">
                            {bill.category} • {bill.description}
                          </p>
                          <span className="md:hidden px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {formatDueDate(bill.date)}
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:block flex-1">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {formatDueDate(bill.date)}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-bold text-lg">
                          {formatAmount(bill.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Footer */}
              <div className="pt-4 mt-4 border-t border-text/20">
                <div className="flex justify-between items-center">
                  <p className="text-text">
                    Showing {filteredAndSortedBills.length} of{" "}
                    {recurringBills.length}
                  </p>
                  <p className="font-bold text-lg">
                    Total: {formatAmount(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center h-full justify-center py-16 text-center">
              <RiBillLine className="text-5xl text-text/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "No matching bills found" : "No recurring bills"}
              </h3>
              <p className="text-text/70 max-w-md">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Add recurring bills to your transactions to see them here."}
              </p>
              {searchTerm && (
                <button
                  className="mt-4 px-4 py-2 text-primary hover:text-primary/80 font-medium"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
