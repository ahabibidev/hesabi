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

import Header from "@/components/header/Header";
import DashboardLayout from "../DashboardLayout";
import SettingsContent from "@/components/settings/SettingsContent";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <Header
        pageHeader="Settings"
        pageSubHeader="Manage your account settings and preferences."
        buttonDisplay="hidden"
      />
      <SettingsContent />
    </DashboardLayout>
  );
}
