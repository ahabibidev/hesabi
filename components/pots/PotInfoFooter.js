import {
  formatDate,
  formatCurrency,
  calculateRemaining,
} from "@/utils/potsUtils";

export default function PotInfoFooter({ createdAt, target, saved }) {
  const remaining = calculateRemaining(target, saved);

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-text/10">
      <p className="text-sm text-center text-text/70">
        Started on {formatDate(createdAt)}
      </p>
      <p className="text-sm text-center text-text/70">
        ${formatCurrency(remaining)} left to reach target
      </p>
    </div>
  );
}
