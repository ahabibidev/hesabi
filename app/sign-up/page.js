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
import { SignUpFormClient } from "@/components/auth/AuthFormClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign Up | Your App Name",
  description: "Create a new account",
};

export default function SignUpPage() {
  return (
    <main className="grid md:grid-cols-2 min-h-screen">
      <HeroSection />
      <SignUpFormClient />
    </main>
  );
}
