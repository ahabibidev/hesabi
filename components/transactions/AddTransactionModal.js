import { useState, useEffect } from "react";
import { FiX, FiCalendar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  onUpdateTransaction,
  editingTransaction,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    type: "expense",
  });

  const categories = [
    "Food & Dining",
    "Shopping",
    "Transportation",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Income",
    "Transfer",
    "Other",
  ];

  // Reset form when modal opens/closes or editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      // Convert the transaction data to match form structure
      const date = editingTransaction.date.includes("/")
        ? convertToDateInput(editingTransaction.date)
        : new Date(editingTransaction.date).toISOString().split("T")[0];

      setFormData({
        name: editingTransaction.name || "",
        category: editingTransaction.category || "",
        date: date,
        amount: editingTransaction.amount?.toString() || "",
        type:
          editingTransaction.type?.toLowerCase() === "income"
            ? "income"
            : "expense",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        amount: "",
        type: "expense",
      });
    }
  }, [editingTransaction, isOpen]);

  // Helper function to convert date string to YYYY-MM-DD format
  const convertToDateInput = (dateStr) => {
    if (dateStr.includes("/")) {
      const [month, day, year] = dateStr.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return new Date().toISOString().split("T")[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.amount) {
      alert("Please fill in all required fields");
      return;
    }

    const transactionData = {
      ...formData,
      id: editingTransaction ? editingTransaction.id : Date.now(),
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    };

    if (editingTransaction) {
      onUpdateTransaction(transactionData);
    } else {
      onAddTransaction(transactionData);
    }
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
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
                {editingTransaction
                  ? "Edit Transaction"
                  : "Add New Transaction"}
              </h2>
              <p className="text-text/70 text-sm mt-1">
                {editingTransaction
                  ? "Update transaction details"
                  : "Enter transaction details"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Grocery shopping, Salary"
                  className="w-full px-4 py-3 rounded-lg border border-text/20 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text/20 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                    required
                  >
                    <option className="bg-background text-foreground" value="">
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                        className="bg-background text-foreground"
                      >
                        {cat}
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
              </div>

              {/* Type Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: "expense" }))
                    }
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      formData.type === "expense"
                        ? "bg-red-500/10 border-red-500 text-red-600"
                        : "border-text/20 hover:border-text/40"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: "income" }))
                    }
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      formData.type === "income"
                        ? "bg-green-500/10 border-green-500 text-green-600"
                        : "border-text/20 hover:border-text/40"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Date and Amount Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3.5 text-text/50" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-text/20 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-text/50">
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
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-text/20 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-text/10">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-lg border border-text/20 hover:border-text/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg bg-foreground hover:bg-primary text-background font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
              >
                {editingTransaction ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
