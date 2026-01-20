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

import HeroSection from "@/components/HeroSection";
import { LoginFormClient } from "@/components/auth/AuthFormClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login | Your App Name",
  description: "Log in to your account",
};

export default function LoginPage() {
  return (
    <main className="grid md:grid-cols-2 min-h-screen">
      <HeroSection />
      <LoginFormClient />
    </main>
  );
}
