// components/pots/AddPotModal.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { THEME_COLORS } from "@/lib/constants";
import { getColorHex } from "@/utils/potsUtils";

export default function AddPotModal({
  isOpen,
  onClose,
  onAddPot,
  onUpdatePot,
  editingPot,
  existingPots = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target: "",
    color: "",
  });

  const [errors, setErrors] = useState({});

  // Get colors that are already used by other pots
  const usedColors = useMemo(() => {
    return existingPots
      .filter((p) => !editingPot || p.id !== editingPot.id)
      .map((p) => getColorHex(p.color));
  }, [existingPots, editingPot]);

  // Get the first available color
  const getFirstAvailableColor = useCallback(() => {
    const availableColor = THEME_COLORS.find(
      (color) => !usedColors.includes(color.hex)
    );
    return availableColor?.hex || THEME_COLORS[0].hex;
  }, [usedColors]);

  // Reset form when modal state changes
  useEffect(() => {
    if (isOpen) {
      if (editingPot) {
        setFormData({
          name: editingPot.name || "",
          description: editingPot.description || "",
          target: editingPot.target?.toString() || "",
          color: getColorHex(editingPot.color),
        });
      } else {
        setFormData({
          name: "",
          description: "",
          target: "",
          color: getFirstAvailableColor(),
        });
      }
      setErrors({});
    }
  }, [editingPot, isOpen, getFirstAvailableColor]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const handleColorSelect = useCallback(
    (colorHex) => {
      if (!usedColors.includes(colorHex)) {
        setFormData((prev) => ({ ...prev, color: colorHex }));
      }
    },
    [usedColors]
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.target || parseFloat(formData.target) <= 0) {
      newErrors.target = "Please enter a valid target amount";
    }

    if (!formData.color) {
      newErrors.color = "Please select a color";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const potData = {
        id: editingPot?.id,
        name: formData.name,
        description: formData.description || formData.name,
        target: parseFloat(formData.target),
        color: formData.color,
        saved: editingPot?.saved || 0,
      };

      if (editingPot) {
        onUpdatePot(potData);
      } else {
        onAddPot(potData);
      }
    },
    [formData, editingPot, onAddPot, onUpdatePot]
  );

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
    }
  }, [isLoading, onClose]);

  const selectedColor = useMemo(
    () => THEME_COLORS.find((c) => c.hex === formData.color),
    [formData.color]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="pot-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Desktop Modal */}
          <motion.div
            key="pot-modal-desktop"
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
                  {editingPot ? "Edit Pot" : "Add New Pot"}
                </h2>
                <p className="text-text/70 text-sm">Set up a savings goal</p>
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
              <PotFormContent
                formData={formData}
                errors={errors}
                usedColors={usedColors}
                selectedColor={selectedColor}
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
                      {editingPot ? "Updating..." : "Creating..."}
                    </>
                  ) : editingPot ? (
                    "Update Pot"
                  ) : (
                    "Create Pot"
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Mobile Bottom Sheet */}
          <motion.div
            key="pot-modal-mobile"
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
                {editingPot ? "Edit Pot" : "New Pot"}
              </h2>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="text-primary text-sm font-semibold disabled:opacity-50"
              >
                {isLoading ? "..." : editingPot ? "Save" : "Create"}
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
              <PotFormContent
                formData={formData}
                errors={errors}
                usedColors={usedColors}
                selectedColor={selectedColor}
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

function PotFormContent({
  formData,
  errors,
  usedColors,
  selectedColor,
  isLoading,
  handleChange,
  handleColorSelect,
  isMobile = false,
}) {
  return (
    <div className={`space-y-${isMobile ? "3" : "4"}`}>
      {/* Pot Name */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Pot Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Vacation Fund"
          disabled={isLoading}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
            errors.name ? "border-red-500" : "border-text/20"
          } bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Description
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional description"
          disabled={isLoading}
          className="w-full px-3 py-2.5 rounded-lg border border-text/20 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
      </div>

      {/* Target Amount */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Target Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-text/50 text-sm">
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
            disabled={isLoading}
            className={`w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm ${
              errors.target ? "border-red-500" : "border-text/20"
            } bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
          />
        </div>
        {errors.target && (
          <p className="mt-1 text-xs text-red-500">{errors.target}</p>
        )}
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

        {/* Color Preview */}
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
