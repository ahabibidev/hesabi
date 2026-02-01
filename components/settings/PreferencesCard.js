// components/settings/PreferencesCard.jsx
"use client";

import { memo, useState } from "react";
import CurrencySelector from "./CurrencySelector";
import ThemeToggle from "./ThemeToggle";
import DeleteConfirmationModal from "../ui/DeleteConfirmationModal";
import { signOut } from "next-auth/react";

const PreferencesCard = memo(function PreferencesCard({
  userProfile,
  currencyOptions,
  onCurrencySelect,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // On successful deletion, sign the user out
      await signOut({ callbackUrl: "/login" });
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="shadow-xl bg-input-background border border-text/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6">Preferences</h2>

        <CurrencySelector
          currencyOptions={currencyOptions}
          selectedCurrency={userProfile.currency}
          onSelect={onCurrencySelect}
        />

        <ThemeToggle />

        <div className="mt-6 pt-6 border-t border-text/10">
          <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
          <p className="text-sm text-text/80 mt-2 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            Delete Account
          </button>
          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone."
        isLoading={isDeleting}
      />
    </>
  );
});

export default PreferencesCard;
