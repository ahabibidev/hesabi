/**
 * Heasbi - Personal Finance Management Application
 * Copyright (C) 2025-2026 Ali Reza Habibi
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE file for full license text.
 */

import { redirect } from "next/navigation";
import DashboardLayout from "./DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import PotsSection from "@/components/dashboard/PotsSection";
import TransactionsSection from "@/components/dashboard/TransactionsSection";
import BudgetSection from "@/components/dashboard/BudgetSection";
import RecurringBillsSection from "@/components/dashboard/RecurringBillsSection";
import { getDashboardData } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  const { user, summary } = data;
  const currency = user?.currency || "USD";

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex w-full items-center">
        <h1 className="relative text-foreground text-2xl font-bold">
          Overview
        </h1>
      </div>

      {/* Stats Section */}
      <div className="flex flex-col md:flex-row w-full gap-5 mt-5">
        <StatCard
          title="Current Balance"
          value={formatCurrency(Math.max(0, summary.currentBalance), currency)}
          variant="default"
        />
        <StatCard
          title="Income"
          value={formatCurrency(summary.currentMonth.income, currency)}
          variant="gradient"
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(summary.currentMonth.expenses, currency)}
          variant="gradient"
        />
      </div>

      {/* Main Content Area */}
      <div className="h-full md:flex w-full gap-5">
        {/* Left Column */}
        <div className="flex w-full flex-col gap-5">
          <PotsSection
            potsData={summary.potsOverview}
            totalSaved={formatCurrency(summary.totalSavings, currency)}
            currency={currency}
          />
          <TransactionsSection
            transactions={summary.recentTransactions}
            currency={currency}
            maxItems={5}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col w-full md:w-3/4 mt-5 gap-5">
          <BudgetSection budgets={summary.budgetOverview} currency={currency} />
          <RecurringBillsSection
            bills={summary.recurringBills}
            billsSummary={summary.billsSummary}
            currency={user.currency}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
