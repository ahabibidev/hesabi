// components/pots/PotInfoFooter.jsx
import { formatDate, calculateRemaining } from "@/utils/potsUtils";
import { formatCurrency } from "@/lib/constants";

export default function PotInfoFooter({
  createdAt,
  target,
  saved,
  currency = "USD",
}) {
  const remaining = calculateRemaining(target, saved);

  return (
    <div className="flex items-left justify-between mt-4 pt-4 border-t border-text/10">
      <p className="text-sm text-left text-text/70">
        Started on {formatDate(createdAt)}
      </p>
      <p className="text-sm text-right text-text/70">
        {remaining > 0
          ? `${formatCurrency(remaining, currency)} left to reach target`
          : "🎉 Target reached!"}
      </p>
    </div>
  );
}
