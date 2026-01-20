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
import DashboardLayout from "../DashboardLayout";
import BudgetsClientWrapper from "@/components/budgets/BudgetsClientWrapper";
import { getBudgetsData } from "@/lib/budgets";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const data = await getBudgetsData();

  if (!data) {
    redirect("/login");
  }

  const { user, budgets, transactions, categories } = data;

  return (
    <DashboardLayout>
      <BudgetsClientWrapper
        initialBudgets={budgets}
        allTransactions={transactions}
        categories={categories}
        currency={user?.currency || "USD"}
      />
    </DashboardLayout>
  );
}
