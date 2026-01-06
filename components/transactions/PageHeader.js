export default function PageHeader({ title, action }) {
  return (
    <div className="flex justify-between w-full items-center mb-6">
      <h1 className="text-foreground text-4xl font-bold">{title}</h1>
      {action}
    </div>
  );
}
