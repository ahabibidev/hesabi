"use client";

export default function PotActionsButtons({ onAddMoney, onWithdraw }) {
  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={onAddMoney}
        className="flex-1 justify-center flex items-center gap-2 rounded-lg bg-primary/20 hover:bg-foreground/90 dark:hover:text-background transition-all hover:cursor-pointer duration-200 px-4 py-3 md:px-5 md:py-5 font-semibold text-foreground shadow-lg hover:shadow-xl active:scale-95"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="hidden sm:inline">Add Money</span>
        <span className="sm:hidden">Add</span>
      </button>
      <button
        onClick={onWithdraw}
        className="flex-1 justify-center flex items-center gap-2 rounded-lg bg-foreground hover:bg-primary/20 dark:hover:bg-primary/20 dark:hover:text-foreground transition-all hover:cursor-pointer duration-200 px-4 py-3 md:px-5 md:py-5 font-semibold text-background shadow-lg hover:shadow-xl active:scale-95"
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
            d="M20 12H4"
          />
        </svg>
        <span>Withdraw</span>
      </button>
    </div>
  );
}
