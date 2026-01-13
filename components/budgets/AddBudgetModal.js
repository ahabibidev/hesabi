// components/budgets/AddBudgetModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { THEME_COLORS } from "@/lib/constants";

export default function AddBudgetModal({
  isOpen,
  onClose,
  onAddBudget,
  onUpdateBudget,
  editingBudget,
  existingBudgets = [],
  categories = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    max: "",
    color: "",
    categoryId: "",
    period: "monthly",
  });

  const [errors, setErrors] = useState({});

  // Get colors that are already used by other budgets
  const usedColors = useMemo(() => {
    return existingBudgets
      .filter((b) => !editingBudget || b.id !== editingBudget.id)
      .map((b) => b.color);
  }, [existingBudgets, editingBudget]);

  // Get the first available color
  const getFirstAvailableColor = () => {
    const availableColor = THEME_COLORS.find(
      (color) => !usedColors.includes(color.hex)
    );
    return availableColor?.hex || THEME_COLORS[0].hex;
  };

  // Filter expense categories only
  const expenseCategories = useMemo(() => {
    return categories.filter((c) => c.type === "expense" || c.type === "both");
  }, [categories]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editingBudget) {
        const category = categories.find(
          (c) =>
            c.name === editingBudget.category_name ||
            c.name === editingBudget.name
        );

        setFormData({
          name: editingBudget.name || "",
          max: editingBudget.max?.toString() || "",
          color: editingBudget.color || getFirstAvailableColor(),
          categoryId:
            category?.id?.toString() ||
            editingBudget.category_id?.toString() ||
            "",
          period: editingBudget.period || "monthly",
        });
      } else {
        setFormData({
          name: "",
          max: "",
          color: getFirstAvailableColor(),
          categoryId: "",
          period: "monthly",
        });
      }
      setErrors({});
    }
  }, [isOpen, editingBudget, categories, usedColors]);

  // Update name when category changes
  useEffect(() => {
    if (formData.categoryId && !editingBudget) {
      const category = categories.find(
        (c) => c.id.toString() === formData.categoryId
      );
      if (category) {
        setFormData((prev) => ({ ...prev, name: category.name }));
      }
    }
  }, [formData.categoryId, categories, editingBudget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleColorSelect = (colorHex) => {
    // Only allow selection if color is not used
    if (!usedColors.includes(colorHex)) {
      setFormData((prev) => ({ ...prev, color: colorHex }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.max || parseFloat(formData.max) <= 0) {
      newErrors.max = "Please enter a valid amount";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    if (!formData.color) {
      newErrors.color = "Please select a color";
    }

    // Check for duplicate budget (same category)
    if (!editingBudget) {
      const duplicate = existingBudgets.find(
        (b) => b.category_id?.toString() === formData.categoryId
      );
      if (duplicate) {
        newErrors.categoryId = "A budget for this category already exists";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const budgetData = {
      ...formData,
      categoryId: parseInt(formData.categoryId),
      max: parseFloat(formData.max),
    };

    if (editingBudget) {
      onUpdateBudget({
        ...budgetData,
        id: editingBudget.id,
      });
    } else {
      onAddBudget(budgetData);
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
            key="budget-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Desktop Modal */}
          <motion.div
            key="budget-modal-desktop"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="hidden sm:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-text/10">
              <div>
                <h2 className="text-foreground text-lg font-bold">
                  {editingBudget ? "Edit Budget" : "Add New Budget"}
                </h2>
                <p className="text-text/70 text-sm">
                  {editingBudget
                    ? "Update budget details"
                    : "Set a spending limit"}
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]"
            >
              <BudgetFormContent
                formData={formData}
                errors={errors}
                expenseCategories={expenseCategories}
                usedColors={usedColors}
                isLoading={isLoading}
                handleChange={handleChange}
                handleColorSelect={handleColorSelect}
              />

              {/* Buttons */}
              <div className="flex gap-3 pt-5 mt-5 border-t border-text/10">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-text/20 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-foreground hover:bg-primary/20 hover:text-foreground text-background font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      {editingBudget ? "Updating..." : "Adding..."}
                    </>
                  ) : editingBudget ? (
                    "Update"
                  ) : (
                    "Add Budget"
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Mobile Bottom Sheet */}
          <motion.div
            key="budget-modal-mobile"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden"
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
                {editingBudget ? "Edit Budget" : "Add Budget"}
              </h2>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="text-primary text-sm font-semibold disabled:opacity-50"
              >
                {isLoading ? "..." : editingBudget ? "Save" : "Add"}
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
              <BudgetFormContent
                formData={formData}
                errors={errors}
                expenseCategories={expenseCategories}
                usedColors={usedColors}
                isLoading={isLoading}
                handleChange={handleChange}
                handleColorSelect={handleColorSelect}
                isMobile
              />
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

function BudgetFormContent({
  formData,
  errors,
  expenseCategories,
  usedColors,
  isLoading,
  handleChange,
  handleColorSelect,
  isMobile = false,
}) {
  const selectedColor = THEME_COLORS.find((c) => c.hex === formData.color);

  return (
    <div className={`space-y-${isMobile ? "3" : "4"}`}>
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
          <option value="">Select a category</option>
          {expenseCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
        )}
      </div>

      {/* Budget Name */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Budget Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Groceries Budget"
          className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
            errors.name ? "border-red-500" : "border-text/20"
          } bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Maximum Amount */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Maximum Spend <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-text/50 text-sm">
            $
          </span>
          <input
            type="number"
            name="max"
            value={formData.max}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={isLoading}
            className={`w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm ${
              errors.max ? "border-red-500" : "border-text/20"
            } bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
          />
        </div>
        {errors.max && (
          <p className="mt-1 text-xs text-red-500">{errors.max}</p>
        )}
      </div>

      {/* Period */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Budget Period
        </label>
        <select
          name="period"
          value={formData.period}
          onChange={handleChange}
          disabled={isLoading}
          className="w-full px-3 py-2.5 rounded-lg border border-text/20 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-2">
          Color Theme <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {THEME_COLORS.map((color) => {
            const isUsed = usedColors.includes(color.hex);
            const isSelected = formData.color === color.hex;

            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => handleColorSelect(color.hex)}
                disabled={isLoading || isUsed}
                className={`relative w-8 h-8 rounded-full transition-all ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : isUsed
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:scale-105"
                } disabled:cursor-not-allowed`}
                style={{ backgroundColor: color.hex }}
                title={isUsed ? `${color.name} (Already used)` : color.name}
              >
                {isUsed && !isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white drop-shadow-md"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                )}
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white drop-shadow-md"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.color && (
          <p className="mt-1 text-xs text-red-500">{errors.color}</p>
        )}

        {/* Color Preview - Add this */}
        {selectedColor && (
          <div className="mt-3 flex items-center gap-3 p-3 rounded-lg border border-text/10 bg-background/50">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedColor.name}
              </p>
              <p className="text-xs text-text/70">Selected color</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
