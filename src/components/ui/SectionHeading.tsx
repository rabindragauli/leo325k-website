import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Eyebrow + heading + optional lead. Use `as="h1"` once per page. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  as: Heading = "h2",
  tone = "light",
  align = "left",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "text-eyebrow font-bold tracking-[1px] uppercase",
            dark ? "text-yellow" : "text-gold-text",
          )}
        >
          {eyebrow}
        </p>
      )}
      <Heading
        className={cn(
          "font-heading",
          Heading === "h1"
            ? "text-[2.25rem] leading-[1.1] font-black sm:text-display"
            : "text-[1.75rem] leading-[1.2] font-bold sm:text-h2",
          dark ? "text-white" : "text-teal-900",
        )}
      >
        {title}
      </Heading>
      {lead && (
        <p
          className={cn(
            "max-w-[65ch] text-base sm:text-lg",
            dark ? "text-on-dark" : "text-slate",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
