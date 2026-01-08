"use client";

import { memo } from "react";
import PotCardDropdown from "./PotCardDropdown";
import PotProgressBar from "./PotProgressBar";
import PotActionsButtons from "./PotActionsButtons";
import PotInfoFooter from "./PotInfoFooter";
import { formatCurrency } from "@/utils/potsUtils";

function PotCard({
  pot,
  openDropdownId,
  onDropdownToggle,
  onEdit,
  onDelete,
  onAddMoney,
  onWithdraw,
}) {
  return (
    <div className="bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 p-5 md:p-8 rounded-2xl">
      {/* Pot Header */}
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${pot.color}`}></div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold">{pot.name}</h2>
            <p className="text-sm text-text/70">{pot.description}</p>
          </div>
        </div>

        <PotCardDropdown
          potId={pot.id}
          isOpen={openDropdownId === pot.id}
          onToggle={onDropdownToggle}
          onEdit={() => onEdit(pot)}
          onDelete={() => onDelete(pot.id)}
        />
      </div>

      {/* Pot Content */}
      <div className="flex flex-col w-full mt-6 md:mt-8 gap-5">
        {/* Total Saved */}
        <p className="flex justify-between w-full items-center">
          <span className="text-text/70">Total Saved:</span>
          <span className="text-xl md:text-2xl font-bold">
            ${formatCurrency(pot.saved)}
          </span>
        </p>

        {/* Progress Bar */}
        <PotProgressBar
          saved={pot.saved}
          target={pot.target}
          progressColor={pot.progressColor}
        />

        {/* Action Buttons */}
        <PotActionsButtons
          onAddMoney={() => onAddMoney(pot.id, pot.name)}
          onWithdraw={() => onWithdraw(pot.id, pot.name, pot.saved)}
        />

        {/* Additional Info */}
        <PotInfoFooter
          createdAt={pot.createdAt}
          target={pot.target}
          saved={pot.saved}
        />
      </div>
    </div>
  );
}

export default memo(PotCard);
