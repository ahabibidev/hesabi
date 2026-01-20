import Link from "next/link";

export default function SectionHeader({
  title,
  linkHref,
  textSize = "text-2xl",
}) {
  return (
    <div className="flex justify-between items-center">
      <h3 className={`${textSize} md:text-xl font-semibold`}>{title}</h3>
      <Link
        className="text-foreground/80 text-xs hover:text-foreground transition-colors"
        href={linkHref}
      >
        See Details &gt;
      </Link>
    </div>
  );
}
