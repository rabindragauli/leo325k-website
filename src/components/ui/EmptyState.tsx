import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** "Nothing here yet" panel for empty lists and search results. */
export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-card bg-mist px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="text-teal-400">{icon}</div>}
      <h3 className="font-heading text-card-title font-bold text-teal-900">{title}</h3>
      {children && <div className="max-w-[48ch] text-slate">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
