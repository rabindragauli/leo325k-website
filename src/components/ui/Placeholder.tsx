import type { ReactNode } from "react";

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
