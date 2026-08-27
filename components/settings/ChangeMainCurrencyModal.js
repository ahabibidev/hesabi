// components/settings/ChangeMainCurrencyModal.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

/**
 * Changing the main currency redefines what every stored `amount` means, so
 * the choice is made explicit rather than assumed: either the numbers get
 * rescaled, or the user is telling us they were already in the new currency.
 */
export default function ChangeMainCurrencyModal({
  isOpen,
  from,
  to,
  isLoading = false,
  onClose,
  onConfirm,
}) {
  // State is reset by remounting (the caller keys this on the target currency)
  // rather than by an effect that fires after the first paint.
  const [mode, setMode] = useState("convert");
  const [rate, setRate] = useState("");

  const parsedRate = parseFloat(rate);
  const canConfirm =
    mode === "relabel" || (Number.isFinite(parsedRate) && parsedRate > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={isLoading ? undefined : onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-background shadow-2xl overflow-hidden"
          >
            <div className="flex items-start justify-between p-5 border-b border-text/10">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Change main currency to {to}?
                </h2>
                <p className="text-sm text-text/70 mt-1">
                  Everything is currently stored in {from}.
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="rounded-full p-2 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <label
                className={`block rounded-xl border p-4 cursor-pointer transition-colors ${
                  mode === "convert"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-text/15 hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="currency-change-mode"
                    checked={mode === "convert"}
                    onChange={() => setMode("convert")}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">
                      Convert my existing records
                    </p>
                    <p className="text-xs text-text/70 mt-1">
                      Every transaction and budget is rescaled into {to}. Choose
                      this if the amounts you entered really were {from}.
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-text/70">1 {from} =</span>
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        onFocus={() => setMode("convert")}
                        placeholder="0"
                        min="0"
                        step="any"
                        disabled={isLoading}
                        className="w-28 px-2 py-1 rounded border border-text/20 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      />
                      <span className="text-xs text-text/70">{to}</span>
                    </div>

                    {parsedRate > 0 && (
                      <p className="mt-2 text-xs text-text/70">
                        {formatCurrency(100, from)} becomes{" "}
                        <span className="font-semibold text-foreground">
                          {formatCurrency(100 * parsedRate, to)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </label>

              <label
                className={`block rounded-xl border p-4 cursor-pointer transition-colors ${
                  mode === "relabel"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-text/15 hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="currency-change-mode"
                    checked={mode === "relabel"}
                    onChange={() => setMode("relabel")}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      Just change the label
                    </p>
                    <p className="text-xs text-text/70 mt-1">
                      Numbers stay exactly as they are. Choose this if you were
                      already entering {to} and the setting was simply wrong.
                    </p>
                  </div>
                </div>
              </label>

              <div className="flex gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Savings pots are not touched — each keeps the currency it
                  actually holds. Any pot that was following your main currency
                  is pinned to {from}.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-text/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-text/20 hover:bg-foreground hover:text-background transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  onConfirm({ convert: mode === "convert", rate: parsedRate })
                }
                disabled={isLoading || !canConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {isLoading ? "Working…" : `Switch to ${to}`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
