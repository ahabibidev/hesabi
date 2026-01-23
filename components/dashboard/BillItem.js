// components/dashboard/BillItem.jsx
export default function BillItem({ name, amount, color, colorHex }) {
  // Support both Tailwind class (color) and hex color (colorHex)
  const colorStyle = colorHex ? { backgroundColor: colorHex } : {};

  return (
    <div className="flex bg-accent/10 rounded-2xl items-center">
      <div
        className={`h-13 w-1.5 rounded-tl-2xl rounded-bl-2xl ${
          !colorHex ? color : ""
        }`}
        style={colorStyle}
      ></div>
      <div className="flex justify-between w-full px-5">
        <p className="text-foreground text-sm font-semibold">{name}</p>
        <p className="text-foreground text-sm font-semibold">{amount}</p>
      </div>
    </div>
  );
}
