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

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SidebarWrapper from "@/components/sidebar/SidebarWrapper";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - shows as sidebar on desktop, bottom nav on mobile */}
      <SidebarWrapper />

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 mt-5 md:mt-0 overflow-y-auto bg-background pb-20 md:pb-0"
      >
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
