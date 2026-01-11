"use client";

import { RiBillLine } from "react-icons/ri";

export default function BillsEmptyState({ searchTerm, onClearSearch }) {
  return (
    <div className="flex flex-col items-center h-full justify-center py-16 text-center">
      <RiBillLine className="text-5xl text-text/30 mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        {searchTerm ? "No matching bills found" : "No recurring bills"}
      </h3>
      <p className="text-text/70 max-w-md">
        {searchTerm
          ? "Try adjusting your search terms to find what you're looking for."
          : "Add recurring bills to your transactions to see them here."}
      </p>
      {searchTerm && (
        <button
          className="mt-4 px-4 py-2 text-primary hover:text-primary/80 font-medium"
          onClick={onClearSearch}
        >
          Clear search
        </button>
      )}
    </div>
  );
}
