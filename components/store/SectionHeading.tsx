import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  label?: string;
  title: string;
  align?: "center" | "start";
  className?: string;
}

export function SectionHeading({ label, title, align = "center", className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-2 mb-10 md:mb-14",
        align === "center" ? "text-center" : "text-right",
        className
      )}
    >
      {label ? <span className="store-label block">{label}</span> : null}
      <h2 className="store-heading text-balance">{title}</h2>
    </div>
  );
}
