// components/pots/PotCard.jsx
"use client";

import { memo, useState } from "react";
import PotCardDropdown from "./PotCardDropdown";
import PotProgressBar from "./PotProgressBar";
import PotActionsButtons from "./PotActionsButtons";
import PotInfoFooter from "./PotInfoFooter";
import DeleteConfirmationModal from "../ui/DeleteConfirmationModal";
import { formatCurrency } from "@/lib/constants";
import { getColorHex } from "@/utils/potsUtils";

function PotCard({
  pot,
  currency = "USD",
  openDropdownId,
  onDropdownToggle,
  onEdit,
  onDelete,
  onAddMoney,
  onWithdraw,
  isDeleting = false,
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const colorHex = getColorHex(pot.color);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(pot.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="shadow-xl bg-brand-gradient border border-text/10 p-5 md:p-8 rounded-2xl">
        {/* Pot Header */}
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colorHex }}
            ></div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">{pot.name}</h2>
              {pot.description && pot.description !== pot.name && (
                <p className="text-sm text-text/70">{pot.description}</p>
              )}
            </div>
          </div>

          <PotCardDropdown
            potId={pot.id}
            isOpen={openDropdownId === pot.id}
            onToggle={onDropdownToggle}
            onEdit={() => onEdit(pot)}
            onDelete={handleDeleteClick} // ✅ Changed to handleDeleteClick
          />
        </div>

        {/* Pot Content */}
        <div className="flex flex-col w-full mt-6 md:mt-8 gap-5">
          {/* Total Saved */}
          <p className="flex justify-between w-full items-center">
            <span className="text-text/70">Total Saved:</span>
            <span className="text-xl md:text-2xl font-bold">
              {formatCurrency(pot.saved, currency)}
            </span>
          </p>

          {/* Progress Bar */}
          <PotProgressBar
            saved={pot.saved}
            target={pot.target}
            progressColor={colorHex}
            currency={currency}
          />

          {/* Action Buttons */}
          <PotActionsButtons
            onAddMoney={onAddMoney}
            onWithdraw={onWithdraw}
            canAdd={pot.saved < pot.target}
            canWithdraw={pot.saved > 0}
          />

          {/* Additional Info */}
          <PotInfoFooter
            createdAt={pot.createdAt}
            target={pot.target}
            saved={pot.saved}
            currency={currency}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Savings Pot"
        message={`Are you sure you want to delete this savings pot? This will permanently remove "${pot.name}" and all associated data. This action cannot be undone.`}
        itemName={pot.name}
        isLoading={isDeleting}
      />
    </>
  );
}

export default memo(PotCard);
