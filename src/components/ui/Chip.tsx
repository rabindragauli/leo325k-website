import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ChipTone = "neutral" | "gold";

const tones: Record<ChipTone, string> = {
  neutral: "bg-line text-teal-900",
  gold: "bg-gold-tint text-gold-ink",
};

export function Chip({
  tone = "neutral",
  className,
  children,
}: {
  tone?: ChipTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-eyebrow font-bold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
