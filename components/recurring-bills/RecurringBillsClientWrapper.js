"use client";

import { useState, useMemo } from "react";
import Header from "@/components/header/Header";
import TotalBillsCard from "@/components/recurring-bills/TotalBillsCard";
import BillsSummaryCard from "@/components/recurring-bills/BillsSummaryCard";
import BillsSearchSort from "@/components/recurring-bills/BillsSearchSort";
import BillsTable from "@/components/recurring-bills/BillsTable";
import BillsEmptyState from "@/components/recurring-bills/BillsEmptyState";
import {
  filterBills,
  sortBills,
  calculateTotalAmount,
  calculateSummaryMetrics,
} from "@/utils/recurringBillsUtils";

export default function RecurringBillsClientWrapper({ recurringBills }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Memoize filtered and sorted bills
  const filteredAndSortedBills = useMemo(() => {
    const filtered = filterBills(recurringBills, searchTerm);
    return sortBills(filtered, sortBy);
  }, [recurringBills, searchTerm, sortBy]);

  // Memoize calculations
  const totalAmount = useMemo(
    () => calculateTotalAmount(filteredAndSortedBills),
    [filteredAndSortedBills]
  );

  const summaryMetrics = useMemo(
    () => calculateSummaryMetrics(recurringBills),
    [recurringBills]
  );

  return (
    <>
      <Header
        pageHeader="Recurring Bills"
        pageSubHeader="Manage your recurring bills and payments."
        buttonDisplay="hidden"
      />

      <div className="flex w-full flex-col md:flex-row md:px-30 gap-10">
        {/* Left Side - Summary Cards */}
        <div className="flex flex-col gap-5 md:w-2/5">
          <TotalBillsCard totalAmount={totalAmount} />
          <BillsSummaryCard summaryMetrics={summaryMetrics} />
        </div>

        {/* Right Side - Bills List */}
        <div className="flex flex-col gap-10 w-full text-foreground bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-6 rounded-2xl">
          <BillsSearchSort
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {filteredAndSortedBills.length > 0 ? (
            <BillsTable
              bills={filteredAndSortedBills}
              totalBills={recurringBills.length}
              totalAmount={totalAmount}
            />
          ) : (
            <BillsEmptyState
              searchTerm={searchTerm}
              onClearSearch={() => setSearchTerm("")}
            />
          )}
        </div>
      </div>
    </>
  );
}
