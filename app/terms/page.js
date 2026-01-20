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

import TermsContent from "@/components/legal/TermsContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of Service | Hesabi",
  description: "Terms of Service for using Hesabi.",
};

export default function TermsPage() {
  return (
    <div className="m-10">
      <TermsContent />
    </div>
  );
}
