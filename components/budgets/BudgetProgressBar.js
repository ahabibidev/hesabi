import { memo } from "react";

function BudgetProgressBar({ spend, max, color }) {
  const progressPercentage = Math.min((spend / max) * 100, 100);

  return (
    <div
      data-testid="progress-bar-container"
      className="h-10 w-full px-1 bg-background/70 rounded-md flex items-center"
    >
      <div
        data-testid="progress-bar"
        className="h-6 rounded-md transition-all duration-300 ease-in-out"
        style={{
          width: `${progressPercentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

export default memo(BudgetProgressBar);
