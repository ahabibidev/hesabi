"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { FiMoreVertical } from "react-icons/fi";
import { formatAmount, getAmountColor } from "@/utils/transactionUtils";

function TransactionMobileRow({ transaction, onEdit, onHide }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleHide = () => {
    onHide(transaction.id);
  };

  const handleEdit = () => {
    onEdit(transaction);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      alert(`Deleted transaction #${transaction.id}`);
    }
    setMenuOpen(false);
  };

  return (
    <>
      {/* Name + Category */}
      <td className="py-3 px-2 md:hidden">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Image
              src={transaction.avatar}
              className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
              alt={transaction.name}
              width={32}
              height={32}
              unoptimized
            />
            <span
              className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                transaction.type === "Income" ? "bg-green-500" : "bg-red-500"
              }`}
            />
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
        <div className="text-xs text-text/60 mt-0.5">{transaction.date}</div>
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
