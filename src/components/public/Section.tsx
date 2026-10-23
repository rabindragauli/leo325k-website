import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  white: "bg-white",
  mist: "bg-mist",
  dark: "bg-teal-900 text-white",
};

const spacings = {
  default: "py-12 sm:py-[88px]", // About, Home
  compact: "py-12 sm:py-20", // Leadership (80 px)
};

/** Page band: 88 px (or 80 px compact) vertical padding on desktop, 48 px on mobile, 1240 px content width. */
export function Section({
  tone = "white",
  spacing = "default",
  labelledBy,
  className,
  innerClassName,
  children,
}: {
  tone?: keyof typeof tones;
  spacing?: keyof typeof spacings;
  labelledBy?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn("px-4 sm:px-6", spacings[spacing], tones[tone], className)}
    >
      <div className={cn("mx-auto max-w-content", innerClassName)}>{children}</div>
    </section>
  );
}
