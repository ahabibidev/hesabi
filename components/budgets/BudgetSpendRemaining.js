export default function BudgetSpendRemaining({
  spend,
  remaining,
  budgetColor,
}) {
  return (
    <div className="flex justify-between mt-3">
      <div className="flex md:flex-1 flex-1/5 items-center gap-5">
        <div className={`h-13 rounded-md ${budgetColor} w-1`}></div>
        <p className="flex flex-col font-semibold">
          ${spend.toFixed(2)}{" "}
          <span className="text-text font-normal">Spend</span>
        </p>
      </div>
      <div className="flex md:flex-1 items-center gap-5">
        <div className="h-13 rounded-md bg-orange-600 w-1"></div>
        <p className="flex flex-col font-semibold">
          ${remaining.toFixed(2)}{" "}
          <span className="text-text font-normal">Remaining</span>
        </p>
      </div>
    </div>
  );
}
