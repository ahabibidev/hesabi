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

import DashboardLayout from "../DashboardLayout";
import AboutContent from "@/components/about/AboutContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About | Hesabi",
  description: "Learn more about Hesabi and the developer behind it.",
};

export default function AboutPage() {
  return (
    <DashboardLayout
      title="About"
      subtitle="Learn more about Hesabi"
      buttonDisplay="hidden"
    >
      <AboutContent />
    </DashboardLayout>
  );
}
