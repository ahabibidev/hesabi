// components/pots/PotMoneyModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FiX, FiPlus, FiMinus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/constants";
import { calculateProgress } from "@/utils/potsUtils";

export default function PotMoneyModal({
  isOpen,
  onClose,
  pot,
  type = "add", // "add" or "withdraw"
  currency = "USD",
  onConfirm,
  isLoading = false,
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const isAdding = type === "add";

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
    }
  }, [isOpen, type]);

  // Calculate preview values
  const previewData = useMemo(() => {
    if (!pot) return null;

    const inputAmount = parseFloat(amount) || 0;
    const currentSaved = pot.saved || 0;
    const target = pot.target || 0;

    let newSaved;
    let maxAllowed;

    if (isAdding) {
      // Can't add more than remaining to target
      maxAllowed = Math.max(target - currentSaved, 0);
      newSaved = Math.min(currentSaved + inputAmount, target);
    } else {
      // Can't withdraw more than current saved
      maxAllowed = currentSaved;
      newSaved = Math.max(currentSaved - inputAmount, 0);
    }

    const currentProgress = calculateProgress(currentSaved, target);
    const newProgress = calculateProgress(newSaved, target);

    return {
      currentSaved,
      newSaved,
      target,
      maxAllowed,
      currentProgress,
      newProgress,
      difference: Math.abs(newSaved - currentSaved),
    };
  }, [pot, amount, isAdding]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setError("");

    if (!previewData) return;

    const numValue = parseFloat(value) || 0;

    if (numValue < 0) {
      setError("Amount must be positive");
    } else if (numValue > previewData.maxAllowed) {
      if (isAdding) {
        setError(
          `Maximum you can add is ${formatCurrency(
            previewData.maxAllowed,
            currency
          )}`
        );
      } else {
        setError(
          `Maximum you can withdraw is ${formatCurrency(
            previewData.maxAllowed,
            currency
          )}`
        );
      }
    }
  };

  const handleSetMax = () => {
    if (previewData) {
      setAmount(previewData.maxAllowed.toString());
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter an amount");
      return;
    }

    const numAmount = parseFloat(amount);

    if (numAmount > previewData.maxAllowed) {
      return;
    }

    onConfirm(pot.id, numAmount);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!pot) return null;

  const potColor = pot.color || pot.progressColor || "#3B82F6";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="money-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Desktop Modal */}
          <motion.div
            key="money-modal-desktop"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="hidden sm:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-5 border-b border-text/10"
              style={{
                background: isAdding
                  ? `linear-gradient(135deg, ${potColor}15, transparent)`
                  : "linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    isAdding
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {isAdding ? (
                    <FiPlus className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiMinus className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-foreground text-lg font-bold">
                    {isAdding ? "Add Money" : "Withdraw Money"}
                  </h2>
                  <p className="text-text/70 text-sm">{pot.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-5">
              {/* Current Balance */}
              <div className="text-center mb-6">
                <p className="text-sm text-text/70 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(previewData?.currentSaved || 0, currency)}
                </p>
                <p className="text-sm text-text/50 mt-1">
                  of {formatCurrency(pot.target, currency)} target
                </p>
              </div>

              {/* Progress Bar Preview */}
              <div className="mb-6">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  {/* Current progress */}
                  <motion.div
                    className="h-full absolute left-0 top-0"
                    style={{ backgroundColor: potColor }}
                    initial={{ width: `${previewData?.currentProgress || 0}%` }}
                    animate={{
                      width: isAdding
                        ? `${previewData?.currentProgress || 0}%`
                        : `${previewData?.newProgress || 0}%`,
                    }}
                  />

                  {/* Preview addition (green) or withdrawal (red) */}
                  {amount && parseFloat(amount) > 0 && (
                    <motion.div
                      className="h-full absolute top-0 "
                      style={{
                        backgroundColor: isAdding ? "#22c55e" : "#ef4444",
                        left: isAdding
                          ? `${previewData?.currentProgress || 0}%`
                          : `${previewData?.newProgress || 0}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.abs(
                          (previewData?.newProgress || 0) -
                            (previewData?.currentProgress || 0)
                        )}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>

                {/* Progress labels */}
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-text/70">
                    {previewData?.currentProgress?.toFixed(1)}%
                  </span>
                  {amount && parseFloat(amount) > 0 && (
                    <span
                      className={`font-medium ${
                        isAdding ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      → {previewData?.newProgress?.toFixed(1)}%
                    </span>
                  )}
                  <span className="text-text/70">100%</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Amount to {isAdding ? "Add" : "Withdraw"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text/50 text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-20 py-4 rounded-xl border text-lg font-medium ${
                      error ? "border-red-500" : "border-text/20"
                    } bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSetMax}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    MAX
                  </button>
                </div>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                <p className="mt-2 text-xs text-text/50">
                  {isAdding
                    ? `Maximum: ${formatCurrency(
                        previewData?.maxAllowed || 0,
                        currency
                      )}`
                    : `Available: ${formatCurrency(
                        previewData?.maxAllowed || 0,
                        currency
                      )}`}
                </p>
              </div>

              {/* Preview */}
              {amount && parseFloat(amount) > 0 && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl mb-4 ${
                    isAdding
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  }`}
                >
                  <p className="text-sm text-text/70 mb-1">New Balance</p>
                  <p
                    className={`text-2xl font-bold ${
                      isAdding ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(previewData?.newSaved || 0, currency)}
                  </p>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl border border-text/20 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading || !!error || !amount || parseFloat(amount) <= 0
                  }
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isAdding
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isAdding ? <FiPlus /> : <FiMinus />}
                      {isAdding ? "Deposit" : "Withdraw"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Mobile Bottom Sheet */}
          <motion.div
            key="money-modal-mobile"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-text/10"
              style={{
                background: isAdding
                  ? `linear-gradient(135deg, ${potColor}15, transparent)`
                  : "linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent)",
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="text-text/70 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <h2 className="text-foreground text-base font-semibold">
                {isAdding ? "Add Money" : "Withdraw"}
              </h2>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  isLoading || !!error || !amount || parseFloat(amount) <= 0
                }
                className={`text-sm font-semibold disabled:opacity-50 ${
                  isAdding ? "text-green-600" : "text-red-600"
                }`}
              >
                {isLoading ? "..." : "Confirm"}
              </button>
            </div>

            {/* Drag Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-text/20 rounded-full" />
            </div>

            {/* Mobile Content */}
            <form onSubmit={handleSubmit} className="px-4 pb-8 overflow-y-auto">
              {/* Pot Name */}
              <p className="text-center text-text/70 text-sm mb-4">
                {pot.name}
              </p>

              {/* Amount Input - Prominent */}
              <div className="flex flex-col text-center py-4">
                <div className="relative items-center">
                  <span className="text-3xl text-text/50 mr-1">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                    className={`text-4xl font-bold text-center w-40 bg-transparent border-b-2 ${
                      error ? "border-red-500" : "border-text/20"
                    } focus:outline-none focus:border-primary py-1 disabled:opacity-50`}
                  />
                </div>
                {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                <button
                  type="button"
                  onClick={handleSetMax}
                  disabled={isLoading}
                  className="mt-2 w-50 mx-auto py-1 text-sm text-primary bg-primary/10 rounded-full disabled:opacity-50"
                >
                  Use Max (
                  {formatCurrency(previewData?.maxAllowed || 0, currency)})
                </button>
              </div>

              {/* Progress Bar Preview */}
              <div className="my-6">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <motion.div
                    className="h-full absolute left-0 top-0"
                    style={{ backgroundColor: potColor }}
                    initial={{ width: `${previewData?.currentProgress || 0}%` }}
                    animate={{
                      width: isAdding
                        ? `${previewData?.currentProgress || 0}%`
                        : `${previewData?.newProgress || 0}%`,
                    }}
                  />

                  {amount && parseFloat(amount) > 0 && (
                    <motion.div
                      className="h-full absolute top-0"
                      style={{
                        backgroundColor: isAdding ? "#22c55e" : "#ef4444",
                        left: isAdding
                          ? `${previewData?.currentProgress || 0}%`
                          : `${previewData?.newProgress || 0}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.abs(
                          (previewData?.newProgress || 0) -
                            (previewData?.currentProgress || 0)
                        )}%`,
                      }}
                    />
                  )}
                </div>

                <div className="flex justify-between mt-2 text-xs text-text/70">
                  <span>
                    {formatCurrency(previewData?.currentSaved || 0, currency)}
                  </span>
                  <span>{formatCurrency(pot.target, currency)}</span>
                </div>
              </div>

              {/* Preview Card */}
              {amount && parseFloat(amount) > 0 && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl text-center ${
                    isAdding
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <p className="text-xs text-text/70">New Balance</p>
                  <p
                    className={`text-xl font-bold ${
                      isAdding ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(previewData?.newSaved || 0, currency)}
                  </p>
                </motion.div>
              )}

              <div className="h-4" />
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
