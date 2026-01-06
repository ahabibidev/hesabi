export default function BillItem({ name, amount, color }) {
  return (
    <div className="flex bg-accent/10 rounded-2xl items-center">
      <div
        className={`h-18 w-1.5 ${color} rounded-tl-2xl rounded-bl-2xl`}
      ></div>
      <div className="flex justify-between w-full px-5">
        <p className="text-foreground font-semibold">{name}</p>
        <p className="text-foreground font-semibold">{amount}</p>
      </div>
    </div>
  );
}
