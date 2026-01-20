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
import PotsClientWrapper from "@/components/pots/PotsClientWrapper";
import { getPotsData } from "@/lib/pots";

export const dynamic = "force-dynamic";

export default async function PotsPage() {
  const data = await getPotsData();

  if (!data) {
    redirect("/login");
  }

  const { user, pots } = data;

  return (
    <DashboardLayout>
      <PotsClientWrapper
        initialPots={pots}
        currency={user?.currency || "USD"}
      />
    </DashboardLayout>
  );
}
