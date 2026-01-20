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

import DashboardLayout from "../../DashboardLayout";

export const dynamic = "force-dynamic";

import PrivacyContent from "@/components/legal/PrivacyContent";

export const metadata = {
  title: "Privacy Policy | Hesabi",
  description: "Privacy Policy for Hesabi - Learn how we protect your data.",
};

export default function PrivacyPage() {
  return (
    <DashboardLayout
      title="Privacy Policy"
      subtitle="How we handle your data"
      buttonDisplay="hidden"
    >
      <PrivacyContent />
    </DashboardLayout>
  );
}
