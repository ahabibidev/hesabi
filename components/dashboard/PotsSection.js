// components/dashboard/PotsSection.jsx
import { BsPiggyBank } from "react-icons/bs";
import SectionHeader from "./SectionHeader";
import PotItem from "./PotItem";
import { formatCurrency } from "@/lib/constants";

export default function PotsSection({
  potsData,
  totalSaved,
  currency = "USD",
}) {
  // Convert database pots to display format
  const displayPots = potsData.map((pot) => ({
    name: pot.name,
    // Handle both old format (amount string) and new format (saved_amount number)
    amount:
      typeof pot.amount === "string"
        ? pot.amount
        : formatCurrency(pot.saved_amount || 0, currency),
    color: pot.color || "bg-primary",
    colorHex: pot.color && pot.color.startsWith("#") ? pot.color : null,
  }));
  const hasNoPots = !potsData || potsData.length === 0;

  return (
    <div className="flex flex-col w-full text-foreground shadow-xl bg-brand-gradient border border-text/10 mt-5 p-6 gap-5 rounded-2xl">
      <SectionHeader title="Pots" linkHref="/pots" />

      <div className="flex">
        <div className="flex w-full flex-col gap-5 md:flex-row justify-between">
          {/* Total Saved Card */}
          <div className="flex  gap-3 bg-accent/10 items-center pl-3 pr-15 rounded-2xl">
            <BsPiggyBank className="text-4xl text-primary" />
            <div className="flex text-sm flex-col">
              <p>Total Saved</p>
              <h3 className="text-foreground text-[18px] font-semibold">
                {totalSaved}
              </h3>
            </div>
          </div>

          {/* Pots Grid */}
          {hasNoPots ? (
            <div className="flex items-center text-sm justify-center flex-1 text-text/50">
              <p>No savings pots yet. Create one to start saving!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 grid-rows-2">
              {displayPots.map((pot) => (
                <PotItem
                  key={pot.name}
                  name={pot.name}
                  amount={pot.amount}
                  color={pot.color}
                  colorHex={pot.colorHex}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
