// components/settings/CurrencyCard.jsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { CURRENCY_OPTIONS } from "@/lib/constants";
import { currencySymbol, formatCurrency } from "@/lib/currency";
import CurrencySelector from "./CurrencySelector";
import ChangeMainCurrencyModal from "./ChangeMainCurrencyModal";

/**
 * Main currency plus the rates every other currency is converted at.
 *
 * These are the user's own rates on purpose — what matters is the number you
 * actually change money at, not an official mid-market figure.
 */
export default function CurrencyCard({ initialCurrency = "USD" }) {
  const router = useRouter();

  const [mainCurrency, setMainCurrency] = useState(initialCurrency);
  const [rates, setRates] = useState([]);
  const [pendingCurrency, setPendingCurrency] = useState(null);
  const [message, setMessage] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const [newCurrency, setNewCurrency] = useState("");
  const [newRate, setNewRate] = useState("");

  const loadRates = useCallback(async () => {
    try {
      const response = await fetch("/api/exchange-rates");
      if (!response.ok) return;

      const data = await response.json();
      setMainCurrency(data.mainCurrency);
      setRates(data.rates || []);
    } catch {
      // A failed read just leaves the list empty; the card stays usable.
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const available = CURRENCY_OPTIONS.filter(
    (c) =>
      c.code !== mainCurrency && !rates.some((r) => r.quote_currency === c.code),
  );

  const handleSaveRate = async (currency, rate) => {
    setIsBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/exchange-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency, rate }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save rate");

      setRates(data.rates || []);
      setNewCurrency("");
      setNewRate("");
      setMessage({ type: "success", text: `Rate for ${currency} saved.` });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteRate = async (currency) => {
    setIsBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/exchange-rates?currency=${encodeURIComponent(currency)}`,
        { method: "DELETE" },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not remove rate");

      setRates(data.rates || []);
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmMainCurrency = async ({ convert, rate }) => {
    setIsBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: pendingCurrency, convert, rate }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not change main currency");
      }

      setPendingCurrency(null);
      await loadRates();
      setMessage({
        type: "success",
        text: data.converted
          ? `Main currency is now ${data.to} and existing records were converted.`
          : `Main currency is now ${data.to}.`,
      });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <div className="shadow-xl bg-input-background border border-text/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-2">Currency</h2>
        <p className="text-sm text-text/80 mb-6">
          Your main currency is what every balance, budget and total is shown
          in. Amounts entered in another currency are converted into it.
        </p>

        <CurrencySelector
          title="Main currency"
          currencyOptions={CURRENCY_OPTIONS}
          selectedCurrency={mainCurrency}
          onSelect={(code) => code !== mainCurrency && setPendingCurrency(code)}
        />

        {/* Exchange rates */}
        <div className="mt-2 pt-6 border-t border-text/10">
          <h3 className="font-semibold mb-1">Exchange rates</h3>
          <p className="text-sm text-text/70 mb-4">
            Used to pre-fill the rate when you enter an amount in another
            currency. You can still override it on any single entry.
          </p>

          {rates.length > 0 && (
            <ul className="space-y-2 mb-4">
              {rates.map((rate) => (
                <RateRow
                  key={rate.quote_currency}
                  quote={rate.quote_currency}
                  rate={rate.rate}
                  mainCurrency={mainCurrency}
                  disabled={isBusy}
                  onSave={handleSaveRate}
                  onDelete={handleDeleteRate}
                />
              ))}
            </ul>
          )}

          {available.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-text/70">1</span>
              <select
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
                disabled={isBusy}
                aria-label="Currency to add a rate for"
                className="px-2 py-2 rounded-lg border border-text/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">Currency…</option>
                {available.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} — {option.name}
                  </option>
                ))}
              </select>

              <span className="text-sm text-text/70">=</span>

              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="0"
                min="0"
                step="any"
                disabled={isBusy || !newCurrency}
                className="w-32 px-3 py-2 rounded-lg border border-text/20 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />

              <span className="text-sm text-text/70">{mainCurrency}</span>

              <button
                type="button"
                onClick={() => handleSaveRate(newCurrency, newRate)}
                disabled={isBusy || !newCurrency || !(parseFloat(newRate) > 0)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          ) : (
            <p className="text-sm text-text/60">
              Every supported currency already has a rate.
            </p>
          )}

          {message && (
            <p
              className={`mt-4 text-sm ${
                message.type === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>

      <ChangeMainCurrencyModal
        key={pendingCurrency || "none"}
        isOpen={Boolean(pendingCurrency)}
        from={mainCurrency}
        to={pendingCurrency}
        isLoading={isBusy}
        onClose={() => setPendingCurrency(null)}
        onConfirm={handleConfirmMainCurrency}
      />
    </>
  );
}

function RateRow({ quote, rate, mainCurrency, disabled, onSave, onDelete }) {
  const [value, setValue] = useState(String(rate));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(String(rate));
  }, [rate]);

  const changed = parseFloat(value) !== Number(rate);

  return (
    <li className="flex flex-wrap items-center gap-2">
      <span className="w-24 text-sm font-medium">
        1 {quote}
        <span className="text-text/50"> {currencySymbol(quote)}</span>
      </span>
      <span className="text-sm text-text/70">=</span>

      <input
        type="number"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        min="0"
        step="any"
        disabled={disabled}
        className="w-32 px-3 py-2 rounded-lg border border-text/20 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
      />

      <span className="text-sm text-text/70">{mainCurrency}</span>

      {changed && parseFloat(value) > 0 && (
        <button
          type="button"
          onClick={async () => {
            await onSave(quote, value);
            setSaved(true);
          }}
          disabled={disabled}
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          Save
        </button>
      )}

      {saved && !changed && (
        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <Check className="h-3.5 w-3.5" />
          Saved
        </span>
      )}

      <span className="text-xs text-text/50">
        ({formatCurrency(1, quote)} ≈ {formatCurrency(rate, mainCurrency)})
      </span>

      <button
        type="button"
        onClick={() => onDelete(quote)}
        disabled={disabled}
        aria-label={`Remove ${quote} rate`}
        className="ml-auto rounded-lg p-1.5 text-text/50 hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
