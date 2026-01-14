// components/transactions/AddTransactionModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export default function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  onUpdateTransaction,
  editingTransaction,
  categories = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    type: "expense",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    recurring: false,
    recurringInterval: "",
  });

  const [errors, setErrors] = useState({});

  // Use database categories or fallback to defaults
  const availableCategories = useMemo(() => {
    if (categories.length > 0) {
      return categories;
    }

    const defaultCats = [];
    let id = 1;

    DEFAULT_CATEGORIES.expense.forEach((name) => {
      defaultCats.push({ id: id++, name, type: "expense" });
    });

    DEFAULT_CATEGORIES.income.forEach((name) => {
      defaultCats.push({ id: id++, name, type: "income" });
    });

    DEFAULT_CATEGORIES.both.forEach((name) => {
      defaultCats.push({ id: id++, name, type: "both" });
    });

    return defaultCats;
  }, [categories]);

  // Filter categories based on transaction type
  const filteredCategories = useMemo(() => {
    const type = formData.type === "income" ? "income" : "expense";
    return availableCategories.filter(
      (c) => c.type === type || c.type === "both"
    );
  }, [availableCategories, formData.type]);

  // Reset form when modal opens/closes or editing transaction changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        const category = availableCategories.find(
          (c) => c.name === editingTransaction.category
        );

        const date = editingTransaction.date?.includes("/")
          ? convertToDateInput(editingTransaction.date)
          : editingTransaction.date || new Date().toISOString().split("T")[0];

        setFormData({
          name: editingTransaction.name || "",
          description: editingTransaction.description || "",
          amount: Math.abs(editingTransaction.amount).toString(),
          type: editingTransaction.type?.toLowerCase() || "expense",
          categoryId:
            category?.id?.toString() ||
            editingTransaction.categoryId?.toString() ||
            "",
          date: date,
          recurring: editingTransaction.recurring || false,
          recurringInterval:
            editingTransaction.recurring_interval ||
            editingTransaction.recurringInterval ||
            "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
          amount: "",
          type: "expense",
          categoryId: "",
          date: new Date().toISOString().split("T")[0],
          recurring: false,
          recurringInterval: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, editingTransaction, availableCategories]);

  // Update category when type changes
  useEffect(() => {
    if (formData.categoryId) {
      const currentCategory = availableCategories.find(
        (c) => c.id.toString() === formData.categoryId
      );
      const type = formData.type === "income" ? "income" : "expense";

      if (
        currentCategory &&
        currentCategory.type !== type &&
        currentCategory.type !== "both"
      ) {
        setFormData((prev) => ({ ...prev, categoryId: "" }));
      }
    }
  }, [formData.type, formData.categoryId, availableCategories]);

  const convertToDateInput = (dateStr) => {
    if (dateStr.includes("/")) {
      const [month, day, year] = dateStr.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return new Date().toISOString().split("T")[0];
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date";
    }

    if (formData.recurring && !formData.recurringInterval) {
      newErrors.recurringInterval = "Please select interval";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const transactionData = {
      ...formData,
      categoryId: parseInt(formData.categoryId),
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    };

    if (editingTransaction) {
      onUpdateTransaction({
        ...transactionData,
        id: editingTransaction.id,
      });
    } else {
      onAddTransaction(transactionData);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Desktop Modal */}
          <motion.div
            key="modal-desktop"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="hidden sm:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Desktop Header */}
            <div className="flex items-center justify-between p-5 border-b border-text/10">
              <div>
                <h2 className="text-foreground text-lg font-bold">
                  {editingTransaction ? "Edit Transaction" : "Add Transaction"}
                </h2>
                <p className="text-text/70 text-sm">
                  {editingTransaction ? "Update details" : "Enter details"}
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-full p-2 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Desktop Form */}
            <form
              onSubmit={handleSubmit}
              className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]"
            >
              <ModalFormContent
                formData={formData}
                errors={errors}
                filteredCategories={filteredCategories}
                isLoading={isLoading}
                handleChange={handleChange}
                setFormData={setFormData}
              />

              {/* Desktop Buttons */}
              <div className="flex gap-3 pt-5 mt-5 border-t border-text/10">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-text/20 hover:cursor-pointer hover:bg-foreground hover:text-background transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg border  border-text/20 bg-foreground hover:bg-background hover:text-foreground hover:cursor-pointer text-background font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      {editingTransaction ? "Updating..." : "Adding..."}
                    </>
                  ) : editingTransaction ? (
                    "Update"
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Mobile Bottom Sheet */}
          <motion.div
            key="modal-mobile"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl min-h-[60vh] max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-text/10">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="text-text/70 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <h2 className="text-foreground text-base font-semibold">
                {editingTransaction ? "Edit" : "Add Transaction"}
              </h2>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="text-primary text-sm font-semibold disabled:opacity-50"
              >
                {isLoading ? "..." : editingTransaction ? "Save" : "Add"}
              </button>
            </div>

            {/* Drag Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-text/20 rounded-full" />
            </div>

            {/* Mobile Form */}
            <form
              onSubmit={handleSubmit}
              className="px-4 pb-6 overflow-y-auto max-h-[calc(85vh-60px)]"
            >
              <MobileFormContent
                formData={formData}
                errors={errors}
                filteredCategories={filteredCategories}
                isLoading={isLoading}
                handleChange={handleChange}
                setFormData={setFormData}
              />
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Shared Loading Spinner
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

// Desktop Form Content
function ModalFormContent({
  formData,
  errors,
  filteredCategories,
  isLoading,
  handleChange,
  setFormData,
}) {
  return (
    <div className="space-y-4">
      {/* Type Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, type: "expense" }))}
          disabled={isLoading}
          className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            formData.type === "expense"
              ? "bg-red-500/10 border-red-500 text-red-600"
              : "border-text/20 hover:border-text/40"
          } disabled:opacity-50`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, type: "income" }))}
          disabled={isLoading}
          className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            formData.type === "income"
              ? "bg-green-500/10 border-green-500 text-green-600"
              : "border-text/20 hover:border-text/40"
          } disabled:opacity-50`}
        >
          Income
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Grocery shopping"
          className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
            errors.name ? "border-red-500" : "border-text/20"
          } bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Amount & Date Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-text/50 text-sm">
              $
            </span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={isLoading}
              className={`w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm ${
                errors.amount ? "border-red-500" : "border-text/20"
              } bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
              errors.date ? "border-red-500" : "border-text/20"
            } bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-500">{errors.date}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
            errors.categoryId ? "border-red-500" : "border-text/20"
          } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
        >
          <option value="">Select category</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Note
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional note"
          disabled={isLoading}
          className="w-full px-3 py-2.5 rounded-lg border border-text/20 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
      </div>

      {/* Recurring */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-foreground">Recurring</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="recurring"
            checked={formData.recurring}
            onChange={handleChange}
            disabled={isLoading}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* Recurring Interval */}
      {formData.recurring && (
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Repeat <span className="text-red-500">*</span>
          </label>
          <select
            name="recurringInterval"
            value={formData.recurringInterval}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
              errors.recurringInterval ? "border-red-500" : "border-text/20"
            } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
          >
            <option value="">Select interval</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.recurringInterval && (
            <p className="mt-1 text-xs text-red-500">
              {errors.recurringInterval}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Mobile Form Content - More Compact
function MobileFormContent({
  formData,
  errors,
  filteredCategories,
  isLoading,
  handleChange,
  setFormData,
}) {
  return (
    <div className="space-y-4">
      {/* Type Toggle - Compact */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, type: "expense" }))}
          disabled={isLoading}
          className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
            formData.type === "expense"
              ? "bg-red-500/10 border-red-500 text-red-600"
              : "border-text/20"
          } disabled:opacity-50`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, type: "income" }))}
          disabled={isLoading}
          className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
            formData.type === "income"
              ? "bg-green-500/10 border-green-500 text-green-600"
              : "border-text/20"
          } disabled:opacity-50`}
        >
          Income
        </button>
      </div>

      {/* Amount - Prominent */}
      <div className="text-center py-2">
        <div className="relative inline-flex items-center">
          <span className="text-2xl text-text/50 mr-1">$</span>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={isLoading}
            className={`text-3xl font-bold text-center w-32 bg-transparent border-b-2 ${
              errors.amount ? "border-red-500" : "border-text/20"
            } focus:outline-none focus:border-primary py-1 disabled:opacity-50`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Transaction name *"
          className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
            errors.name ? "border-red-500" : "border-text/20"
          } bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Category & Date Row */}
      <div className="grid grid-cols-2 gap-2">
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
            errors.categoryId ? "border-red-500" : "border-text/20"
          } bg-background focus:outline-none disabled:opacity-50`}
        >
          <option value="">All Categories</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
            errors.date ? "border-red-500" : "border-text/20"
          } bg-transparent focus:outline-none disabled:opacity-50`}
        />
      </div>

      {errors.categoryId && (
        <p className="text-xs text-red-500">{errors.categoryId}</p>
      )}

      {/* Note */}
      <input
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Add note (optional)"
        disabled={isLoading}
        className="w-full px-3 py-2.5 rounded-lg border border-text/20 text-sm bg-transparent focus:outline-none disabled:opacity-50"
      />

      {/* Recurring Toggle */}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-foreground">Recurring</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="recurring"
            checked={formData.recurring}
            onChange={handleChange}
            disabled={isLoading}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* Recurring Interval */}
      {formData.recurring && (
        <div>
          <select
            name="recurringInterval"
            value={formData.recurringInterval}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
              errors.recurringInterval ? "border-red-500" : "border-text/20"
            } bg-background focus:outline-none disabled:opacity-50`}
          >
            <option value="">Select repeat interval *</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.recurringInterval && (
            <p className="mt-1 text-xs text-red-500">
              {errors.recurringInterval}
            </p>
          )}
        </div>
      )}

      {/* Safe area padding for phones with home indicator */}
      <div className="h-4" />
    </div>
  );
}
