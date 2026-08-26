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

export const dynamic = "force-static";

export default function manifest() {
  return {
    id: "/",
    name: "Hesabi - Personal Finance",
    short_name: "Hesabi",
    description:
      "Track your income, expenses, budgets and savings pots. Know where your money goes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "any",
    background_color: "#1d2433",
    theme_color: "#1d2433",
    lang: "en",
    dir: "ltr",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1427x783",
        type: "image/png",
        form_factor: "wide",
        label: "Your financial overview at a glance",
      },
    ],
    shortcuts: [
      {
        name: "Transactions",
        short_name: "Transactions",
        description: "Browse and add transactions",
        url: "/transactions",
      },
      {
        name: "Budgets",
        short_name: "Budgets",
        description: "Check how your budgets are tracking",
        url: "/budgets",
      },
      {
        name: "Pots",
        short_name: "Pots",
        description: "Move money in and out of your savings pots",
        url: "/pots",
      },
      {
        name: "Recurring Bills",
        short_name: "Bills",
        description: "See which bills are due",
        url: "/recurring-bills",
      },
    ],
  };
}
