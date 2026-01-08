"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { themeColors } from "@/data/transactionsData";

export default function AddPotModal({
  isOpen,
  onClose,
  onAddPot,
  onUpdatePot,
  editingPot,
  existingPots = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    theme: "teal-600",
  });

  // Memoize available colors
  const availableColors = useMemo(() => {
    const usedColors = existingPots.map((pot) => pot.color);
    return themeColors.filter(
      (color) =>
        !usedColors.includes(color.bgClass) ||
        (editingPot && editingPot.color === color.bgClass)
    );
  }, [existingPots, editingPot]);

  // Reset form when modal state changes
  useEffect(() => {
    if (editingPot) {
      setFormData({
        name: editingPot.name || "",
        target: editingPot.target?.toString() || "",
        theme: editingPot.color?.replace("bg-", "") || "teal-600",
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        target: "",
        theme: availableColors[0]?.value || "teal-600",
      });
    }
  }, [editingPot, isOpen, availableColors]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!formData.name || !formData.target) {
        alert("Please fill in all required fields");
        return;
      }

      const potData = {
        id: editingPot ? editingPot.id : Date.now(),
        name: formData.name,
        target: parseFloat(formData.target),
        color: `bg-${formData.theme}`,
        saved: editingPot?.saved || 0,
        description: formData.name,
        createdAt: editingPot
          ? editingPot.createdAt
          : new Date().toISOString().split("T")[0],
        progressColor:
          themeColors.find((c) => c.value === formData.theme)?.hex || "#3B82F6",
      };

      if (editingPot) {
        onUpdatePot(potData);
      } else {
        onAddPot(potData);
      }
      onClose();
    },
    [formData, editingPot, onAddPot, onUpdatePot, onClose]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const selectedColor = useMemo(
    () => themeColors.find((c) => c.value === formData.theme),
    [formData.theme]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-background rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-text/10">
            <div>
              <h2 className="text-foreground text-xl font-bold">
                {editingPot ? "Edit Pot" : "Add New Pot"}
              </h2>
              <p className="text-text/70 text-sm mt-1">
                Set up a new savings pot to track your progress towards a goal.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
          >
            <div className="space-y-5">
              {/* Pot Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pot Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Laptop, Vacation, Emergency Fund"
                  className="w-full px-4 py-3 rounded-lg border border-text/20 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Target Amount Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-text/50">
                    $
                  </span>
                  <input
                    type="number"
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-text/20 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Theme Color
                </label>
                <div className="relative">
                  <select
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                  >
                    {availableColors.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-text/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-3 flex items-center gap-3 p-3 rounded-lg border border-text/10 bg-background/50">
                  <div
                    className={`w-8 h-8 rounded-full bg-${formData.theme}`}
                    style={{
                      backgroundColor: selectedColor?.hex,
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedColor?.name || "Color"}
                    </p>
                    <p className="text-xs text-text/70">Preview</p>
                  </div>
                </div>

                {availableColors.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-2">
                    All colors used. Edit existing to change.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-text/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg border border-text/20 hover:border-text/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg bg-foreground hover:bg-foreground/90 dark:hover:bg-primary/20 dark:hover:text-foreground transition-all hover:cursor-pointer text-background font-semibold shadow-lg hover:shadow-xl active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={availableColors.length === 0 && !editingPot}
              >
                {editingPot ? "Update Pot" : "Add Pot"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
