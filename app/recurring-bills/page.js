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

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getRecurringBills } from "@/lib/db";
import DashboardLayout from "../DashboardLayout";
import RecurringBillsClientWrapper from "@/components/recurring-bills/RecurringBillsClientWrapper";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recurring Bills | Hesabi",
  description: "View and manage your recurring bills and subscriptions",
};

export default async function RecurringBillsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch recurring bills from database
  const recurringBills = await getRecurringBills(session.user.id);

  return (
    <DashboardLayout>
      <RecurringBillsClientWrapper recurringBills={recurringBills} />
    </DashboardLayout>
  );
}
