// components/dashboard/StatCard.jsx
export default function StatCard({ title, value, variant = "default" }) {
  const baseClasses =
    "flex md:flex-1 flex-col h-35 p-5 gap-3 justify-center rounded-2xl";

  const variantClasses = {
    default: "bg-foreground",
    gradient: "bg-background shadow-xl bg-brand-gradient border border-text/10",
  };

  const textColorClasses = {
    default: "text-background",
    gradient: "text-foreground",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <p className={`text-md ${textColorClasses[variant]}`}>{title}</p>
      <p className={`${textColorClasses[variant]} text-3xl font-semibold`}>
        {value}
      </p>
    </div>
  );
}
