// components/ui/CurrencyAmountField.jsx
"use client";

import { useEffect } from "react";
import { CURRENCY_OPTIONS } from "@/lib/constants";
import {
  convertAmount,
  currencySymbol,
  formatCurrency,
  rateBetween,
} from "@/lib/currency";

/**
 * An amount input with the currency it was entered in, plus a live preview of
 * what that becomes in `convertTo`.
 *
 * The rate is editable per entry on purpose: the saved rate is only a default,
 * and real money changes hands at the rate you actually got that day. Whatever
 * is showing here is what gets frozen onto the record.
 */
export default function CurrencyAmountField({
  amount,
  currency,
  rate,
  onAmountChange,
  onCurrencyChange,
  onRateChange,
  mainCurrency,
  rateMap = {},
  convertTo,
  error,
  disabled = false,
  label = "Amount",
  required = true,
  large = false,
}) {
  const target = convertTo || mainCurrency;
  const isForeign = currency !== target;

  // Seed the rate from settings whenever the currency pair changes, without
  // clobbering a rate the user has deliberately typed over.
  useEffect(() => {
    if (!isForeign) return;
    if (rate) return;

    const suggested = rateBetween(currency, target, mainCurrency, rateMap);
    if (suggested) onRateChange?.(String(Number(suggested.toFixed(8))));
  }, [currency, target, mainCurrency, rateMap, isForeign, rate, onRateChange]);

  const numericRate = parseFloat(rate);
  const numericAmount = parseFloat(amount);

  const converted =
    isForeign && numericRate > 0 && numericAmount > 0
      ? convertAmount(numericAmount, currency, target, target, {
          [currency]: numericRate,
        })
      : null;

  const knownRate = rateBetween(currency, target, mainCurrency, rateMap);

  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-text/50 text-sm">
            {currencySymbol(currency)}
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={disabled}
            className={`w-full pl-7 pr-3 py-2.5 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${
              error ? "border-red-500" : "border-text/20"
            } ${large ? "text-lg font-semibold" : "text-sm"}`}
          />
        </div>

        <select
          value={currency}
          onChange={(e) => {
            onCurrencyChange(e.target.value);
            // Force a re-seed for the new pair.
            onRateChange?.("");
          }}
          disabled={disabled}
          aria-label="Currency"
          className="w-24 px-2 py-2.5 rounded-lg border border-text/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        >
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.code}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isForeign && (
        <div className="mt-2 rounded-lg border border-text/10 bg-text/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-text/70 whitespace-nowrap">
              1 {currency} =
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => onRateChange(e.target.value)}
              placeholder="0"
              min="0"
              step="any"
              disabled={disabled}
              className="w-28 px-2 py-1 rounded border border-text/20 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <span className="text-xs text-text/70">{target}</span>
          </div>

          {converted !== null ? (
            <p className="text-xs text-text/70">
              Recorded as{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(converted, target)}
              </span>
            </p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {knownRate
                ? "Enter an amount to see the converted value."
                : `No saved rate for ${currency} — type today's rate above. You can save a default in Settings.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
