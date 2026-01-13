// components/settings/PreferencesCard.jsx
"use client";

import { memo } from "react";
import CurrencySelector from "./CurrencySelector";
import ThemeToggle from "./ThemeToggle";

const PreferencesCard = memo(function PreferencesCard({
  userProfile,
  currencyOptions,
  onCurrencySelect,
}) {
  return (
    <div className="bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-6">Preferences</h2>

      <CurrencySelector
        currencyOptions={currencyOptions}
        selectedCurrency={userProfile.currency}
        onSelect={onCurrencySelect}
      />

      <ThemeToggle />
    </div>
  );
});

export default PreferencesCard;
