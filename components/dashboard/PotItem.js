// components/dashboard/PotItem.jsx
export default function PotItem({ name, amount, color, colorHex }) {
  // Support both Tailwind class (color) and hex color (colorHex)
  const colorStyle = colorHex ? { backgroundColor: colorHex } : {};

  return (
    <div className="flex p-2 gap-3">
      <div
        className={`h-9.75 w-1 rounded-full ${!colorHex ? color : ""}`}
        style={colorStyle}
      ></div>
      <p className="text-foreground/80 text-xs font-medium flex flex-col gap-1">
        {name}
        <span className="font-bold text-md text-foreground">{amount}</span>
      </p>
    </div>
  );
}
