// components/settings/SaveSettingsCard.jsx
"use client";

import { memo } from "react";
import LoadingSpinner from "./LoadingSpinner";

const SaveSettingsCard = memo(function SaveSettingsCard({
  isSaving,
  onReset,
  onSave,
}) {
  return (
    <div className="mt-10">
      <div className="bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
            <p className="font-medium">Save your changes</p>
            <p className="text-sm text-text/70">
              All changes will be applied immediately
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onReset}
              className="px-6 py-3 rounded-xl border border-text/20 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              type="button"
            >
              Reset
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`px-8 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all duration-200 min-w-[140px] ${
                isSaving ? "opacity-70 cursor-not-allowed" : ""
              }`}
              type="button"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SaveSettingsCard;
