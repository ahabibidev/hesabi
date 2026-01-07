"use client";

import { memo } from "react";
import Image from "next/image";
import {
  formatAmount,
  getAmountColor,
  getCategoryColor,
  getTypeBadgeClass,
} from "@/utils/transactionUtils";

function TransactionDesktopRow({ transaction, onEdit, onHide }) {
  const handleEdit = () => {
    onEdit(transaction);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      alert(`Deleted transaction #${transaction.id}`);
    }
  };

  const handleHide = () => {
    onHide(transaction.id);
  };

  return (
    <>
      {/* Recipient/Sender - Hidden on mobile */}
      <td className="hidden sm:table-cell py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Image
              src={transaction.avatar}
              className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800"
              alt={transaction.name}
              width={40}
              height={40}
              unoptimized
            />
            <span
              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${
                transaction.type === "Income" ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <div className="min-w-0">
            <span className="font-medium text-foreground block truncate">
              {transaction.name}
            </span>
            <span className="text-sm text-text/70 truncate">
              {transaction.type === "Income" ? "Received from" : "Paid to"}
            </span>
          </div>
        </div>
      </td>

      {/* Category - Hidden on mobile */}
      <td className="hidden sm:table-cell py-4 px-6">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(
            transaction.category
          )}`}
        >
          {transaction.category}
        </span>
      </td>

      {/* Type - Hidden on mobile */}
      <td className="hidden sm:table-cell py-4 px-6">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getTypeBadgeClass(
            transaction.type
          )}`}
        >
          {transaction.type}
        </span>
      </td>

      {/* Date - Hidden on mobile */}
      <td className="hidden sm:table-cell py-4 px-6">
        <div className="flex flex-col">
          <span className="text-foreground font-medium">
            {transaction.date}
          </span>
          <span className="text-sm text-text/70">3:45 PM</span>
        </div>
      </td>

      {/* Amount - Hidden on mobile */}
      <td className="hidden sm:table-cell py-4 px-6">
        <div
          className={`font-semibold text-md ${getAmountColor(
            transaction.amount
          )}`}
        >
          {formatAmount(transaction.amount)}
        </div>
      </td>

      {/* Actions - Hidden on mobile */}
      <td className="hidden sm:table-cell py-4 px-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleHide}
            className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-text hover:text-yellow-600 transition-colors"
            title="Hide"
            aria-label="Hide transaction"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground transition-colors"
            title="Edit"
            aria-label="Edit transaction"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text hover:text-red-600 transition-colors"
            title="Delete"
            aria-label="Delete transaction"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </>
  );
}

export default memo(TransactionDesktopRow);
