import { SlMagnifier } from "react-icons/sl";

export default function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
}) {
  return (
    <div className="relative w-full md:w-72">
      <input
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-text/20 bg-background px-4 py-3 pr-10 text-foreground placeholder:text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
        placeholder={placeholder}
      />
      <SlMagnifier className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text" />
    </div>
  );
}
