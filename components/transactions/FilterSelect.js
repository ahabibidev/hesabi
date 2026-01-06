export default function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-3 text-text">
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-lg border border-text/20 bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-40"
      >
        {options.map((option) => (
          <option
            key={option.value}
            className="bg-background text-foreground"
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
