import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "article" | "section" | "li";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cn("rounded-card border border-line bg-white p-6 sm:p-8", className)}>
      {children}
    </Tag>
  );
}
