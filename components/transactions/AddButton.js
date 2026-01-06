import { FiPlus } from "react-icons/fi";

export default function AddButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-foreground px-5 py-3 font-semibold text-background hover:bg-primary transition whitespace-nowrap"
    >
      <FiPlus className="text-xl" />
      {children}
    </button>
  );
}
