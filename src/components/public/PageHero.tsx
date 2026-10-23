import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/cn";

/**
 * Dark page intro shared by the inner pages: breadcrumb, the page's <h1>, lead, optional aside
 * (photo/summary). `width="narrow"` for text pages (Privacy, 860 px).
 */
export function PageHero({
  title,
  crumb,
  lead,
  aside,
  width = "content",
  className,
}: {
  title: ReactNode;
  crumb: string;
  lead?: ReactNode;
  aside?: ReactNode;
  width?: "content" | "narrow";
  className?: string;
}) {
  return (
    <section className={cn("bg-teal-900 px-4 pt-10 pb-12 text-white sm:px-6 sm:pt-14 sm:pb-[72px]", className)}>
      <div
        className={cn(
          "mx-auto flex flex-wrap items-center gap-8 lg:gap-12",
          width === "narrow" ? "max-w-[860px]" : "max-w-content",
        )}
      >
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-3.5">
          <Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: crumb }]} />
          <h1 className="font-heading text-[2.5rem] leading-[1.05] font-black sm:text-display">{title}</h1>
          {lead && (
            <p
              className={cn(
                "text-lg leading-[1.65] text-on-dark-2",
                width === "content" && "max-w-[620px]",
              )}
            >
              {lead}
            </p>
          )}
        </div>
        {aside && <div className="min-w-0 flex-[1_1_400px]">{aside}</div>}
      </div>
    </section>
  );
}
