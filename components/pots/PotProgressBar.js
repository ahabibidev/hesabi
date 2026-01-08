import { memo } from "react";
import {
  calculateProgress,
  formatPercentage,
  formatCurrency,
} from "@/utils/potsUtils";

function PotProgressBar({ saved, target, progressColor }) {
  const progressPercentage = calculateProgress(saved, target);
  const formattedPercentage = formatPercentage(saved, target);

  return (
    <div>
      <div
        data-testid="progress-bar-container"
        className="h-3 w-full px-1 bg-foreground/10 dark:bg-background/70 rounded-md flex items-center"
      >
        <div
          data-testid="progress-bar"
          className="h-2 rounded-md transition-all duration-300 ease-in-out"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>
      <p className="flex justify-between mt-2 font-bold text-sm">
        <span>{formattedPercentage}%</span>
        <span className="font-normal text-text">
          of ${formatCurrency(target)}
        </span>
      </p>
    </div>
  );
}

export default memo(PotProgressBar);
