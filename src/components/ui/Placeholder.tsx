import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { splitPlaceholders } from "@/lib/placeholders";

/**
 * Council-supplied content that is still missing, e.g. "[official district email]".
 * Renders the bracketed text unchanged; `data-placeholder` makes open items easy to find.
 * Every placeholder is listed in docs/08_CONTENT_AND_SEED.md → "Open placeholders".
 */
export function Placeholder({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span data-placeholder="" className={className}>
      {children}
    </span>
  );
}

/** Copy that may contain [bracketed] placeholders: each bracketed part becomes a <Placeholder>. */
export function PlaceholderText({ text }: { text: string }) {
  return (
    <>
      {splitPlaceholders(text).map((part, i) =>
        part.placeholder ? <Placeholder key={i}>{part.text}</Placeholder> : part.text,
      )}
    </>
  );
}

/** Box standing in for a photo or map the council has not supplied yet, e.g. "[Photo: …]". */
export function PlaceholderMedia({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      data-placeholder=""
      role="img"
      aria-label={typeof children === "string" ? children : undefined}
      className={cn(
        "flex items-center justify-center rounded-[22px] border p-4 text-center text-[15px] font-semibold",
        tone === "dark"
          ? // on-dark-2: the design's #9FB0D0 is only 4.14:1 on teal-700 (WCAG AA needs 4.5)
          "border-teal-500 bg-teal-700 text-on-dark-2"
          : "border-line bg-mist text-slate",
        className,
      )}
    >
      {children}
    </div>
  );
}
