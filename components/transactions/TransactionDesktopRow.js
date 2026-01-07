"use client";

import { memo } from "react";
import Image from "next/image";
import {
  formatAmount,
  getAmountColor,
  getCategoryColor,
  getTypeBadgeClass,
} from "@/utils/transactionUtils";

function TransactionDesktopRow({ transaction }) {
  const handleView = () => alert(`Viewing transaction #${transaction.id}`);
  const handleEdit = () => alert(`Editing transaction #${transaction.id}`);
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      alert(`Deleted transaction #${transaction.id}`);
    }
  };

  return (
    <>
      {/* Recipient/Sender - Hidden on mobile */}
      <td className="hidden sm:table-cell py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
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
            onClick={handleView}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text hover:text-foreground transition-colors"
            title="View Details"
            aria-label="View transaction details"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
