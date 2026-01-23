// components/dashboard/BudgetItem.jsx
import { formatCurrency } from "@/lib/constants";

export default function BudgetItem({
  name,
  spent,
  max,
  color,
  currency = "USD",
}) {
  // Use same styling as PotItem
  const colorStyle = color ? { backgroundColor: color } : {};
  const formattedAmount = formatCurrency(spent, currency);

  return (
    <div className="flex p-2 gap-3 ml-15">
      <div className="h-9.75 w-1 rounded-full" style={colorStyle}></div>
      <p className="text-foreground/80 text-sm font-medium flex flex-col gap-1">
        {name}
        <span className="font-bold text-sm text-foreground">{formattedAmount}</span>
      </p>
    </div>
  );
}
