// components/transactions/TransactionMobileRow.jsx
"use client";

import { memo, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import CategoryIcon from "../dashboard/CategoryIcon";
import { formatCurrency, formatDate } from "@/lib/constants";
import { BiDownArrowAlt, BiUpArrowAlt } from "react-icons/bi";

function TransactionMobileRow({
  transaction,
  currency = "USD",
  onEdit,
  onHide,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleHide = () => {
    setMenuOpen(false);
    onHide(transaction.id);
  };

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit(transaction);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete(transaction.id);
  };

  // Format amount
  const formatAmount = (amount) => {
    const sign = amount >= 0 ? "+" : "-";
    return `${sign}${formatCurrency(Math.abs(amount), currency)}`;
  };

  const getAmountColor = (amount) => {
    return amount >= 0 ? "text-green-500" : "text-red-500";
  };

  // Format date
  const displayDate =
    typeof transaction.date === "string" && transaction.date.includes("-")
      ? formatDate(transaction.date)
      : transaction.date;

  // Category color
  const categoryColor = transaction.category_color || "#6B7280";

  return (
    <>
      {/* Name + Category */}
      <td className="py-3 px-2 md:hidden">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {/* Category icon with color background */}
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800"
              style={{ backgroundColor: categoryColor }}
            >
              <CategoryIcon
                icon={transaction.category_icon || "default"}
                className="text-white w-4 h-4"
              />
            </div>
            <span className={`absolute -bottom-1 right-0 h-4 w-4 `}>
              {transaction.type === "Income" ? (
                <BiDownArrowAlt className="text-xl bg-[#112C2E] text-[#0BD369] rounded-full" />
              ) : (
                <BiUpArrowAlt className="text-xl bg-[#331A28] text-[#CA2728] rounded-full" />
              )}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground text-sm truncate">
              {transaction.name}
            </div>
            <div className="text-xs text-text/60 mt-0.5 truncate">
              {transaction.category}
            </div>
          </div>
        </div>
      </td>

      {/* Amount + Date */}
      <td className="py-3 pl-6 md:hidden">
        <div
          className={`font-semibold text-sm ${getAmountColor(
            transaction.amount
          )}`}
        >
          {formatAmount(transaction.amount)}
        </div>
        <div className="text-xs text-text/60 mt-0.5">{displayDate}</div>
      </td>

      {/* Actions */}
      <td className="py-3 pl-3 relative md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground transition-colors"
          aria-label="More options"
        >
          <FiMoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-4 top-8 z-50 bg-background border border-text/20 rounded-lg shadow-lg py-2 w-40 animate-fade-in">
              <button
                onClick={handleHide}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Hide Row
              </button>
              <button
                onClick={handleEdit}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </td>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

export default memo(TransactionMobileRow);
