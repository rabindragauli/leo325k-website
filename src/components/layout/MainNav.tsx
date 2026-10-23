"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { MailIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { isActivePath } from "@/lib/nav";
import { contactHref, mainNav } from "@/lib/site";

/** Desktop nav bar contents: page links (active = yellow underline) + Contact us button. */
export function MainNav() {
  const pathname = usePathname();
  const contactActive = isActivePath(pathname, contactHref);

  return (
    <>
      <nav aria-label="Main" className="flex flex-wrap gap-1">
        {mainNav.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                // 15 px up to 1440 px wide, then grows with the header, max 18 px; fixed 24 px line keeps the bar 60 px
                "border-b-[3px] px-3.5 pt-[18px] pb-[15px] text-[length:clamp(15px,calc(100cqw*15/1440),18px)] leading-6 font-bold tracking-[0.3px] no-underline",
                active
                  ? "border-yellow text-white"
                  : "border-transparent text-nav hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href={contactHref}
        aria-current={contactActive ? "page" : undefined}
        className={buttonClasses({
          className: cn(
            "pl-4",
            contactActive &&
              "shadow-[0_0_0_2px_var(--color-teal-900),0_0_0_4px_var(--color-yellow)]",
          ),
        })}
      >
        <MailIcon />
        Contact us
      </Link>
    </>
  );
}
