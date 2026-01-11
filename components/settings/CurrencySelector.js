// components/settings/CurrencySelector.jsx
"use client";

import { memo } from "react";

const CurrencySelector = memo(function CurrencySelector({
  currencyOptions,
  selectedCurrency,
  onSelect,
}) {
  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-4">Currency</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {currencyOptions.map((currency) => (
          <button
            key={currency.code}
            onClick={() => onSelect(currency.code)}
            className={`p-3 rounded-xl border transition-all duration-200 text-center ${
              selectedCurrency === currency.code
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-text/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
            aria-label={`Select ${currency.name}`}
          >
            <div className="text-2xl font-bold mb-1">{currency.symbol}</div>
            <p className="font-medium text-sm">{currency.code}</p>
          </button>
        ))}
      </div>
    </div>
  );
});

export default CurrencySelector;
