import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  white: "bg-white",
  mist: "bg-mist",
  dark: "bg-teal-900 text-white",
};

/** Page band: 88 px vertical padding on desktop, 48 px on mobile, 1240 px content width. */
export function Section({
  tone = "white",
  labelledBy,
  className,
  innerClassName,
  children,
}: {
  tone?: keyof typeof tones;
  labelledBy?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn("px-4 py-12 sm:px-6 sm:py-[88px]", tones[tone], className)}
    >
      <div className={cn("mx-auto max-w-content", innerClassName)}>{children}</div>
    </section>
  );
}
