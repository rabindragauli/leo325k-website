"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { CloseIcon, MailIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { isActivePath } from "@/lib/nav";
import { atHeight, brand, contactHref, mainNav, site } from "@/lib/site";
import { SocialLinks } from "./SocialLinks";
import { ThemeBadges } from "./ThemeBadges";

const squareButton =
  "flex size-11 shrink-0 items-center justify-center rounded-btn border border-teal-400 text-white";

/**
 * Menu button + full-screen menu (design/source/public/MobileMenu.dc.html).
 * A native modal <dialog> provides the focus trap, Esc to close, inert page
 * and focus return to the menu button.
 */
export function MobileMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after any navigation (including browser back/forward while open)
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const openMenu = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const closeMenu = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={openMenu}
        className={squareButton}
      >
        <MenuIcon />
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-menu"
        aria-label="Menu"
        onClose={() => setOpen(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-teal-900 p-0 text-white backdrop:bg-teal-900"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex h-[68px] shrink-0 items-center gap-2.5 border-b-4 border-yellow bg-bar-mobile pr-3 pl-3.5">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Image src={brand.lionsLogo.src} alt="" {...atHeight(brand.lionsLogo, 42)} />
              <span className="flex min-w-0 flex-col font-heading">
                <span className="text-[15px] leading-[1.2] font-black">{site.shortName}</span>
                <span className="text-xs font-bold text-yellow">Nepal · {site.leoYear}</span>
              </span>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className={squareButton}
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Main" className="flex flex-col py-1.5">
            {mainNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center justify-between border-b border-teal-600 px-5 py-4 font-heading text-[23px] leading-[1.2] font-black no-underline",
                    active ? "text-yellow" : "text-white",
                  )}
                >
                  {item.label}
                  <span aria-hidden="true" className="text-xl text-yellow">
                    →
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col items-center gap-3 bg-badges-band px-4 py-[18px]">
            <ThemeBadges height={58} className="items-center justify-center gap-2.5" />
            <p className="flex flex-wrap items-center justify-center gap-2 font-heading text-[13px] font-black tracking-[0.5px]">
              <span>{site.theme.quote}</span>
              <span className="rounded-[3px] bg-gold-band px-[9px] py-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
                {site.theme.motto}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3.5 bg-teal-900 p-5">
            <ButtonLink href={contactHref} size="lg" onClick={closeMenu} className="w-full">
              <MailIcon size={20} />
              Contact us
            </ButtonLink>
            <SocialLinks className="justify-center" pillClassName="border-teal-400 text-sm" />
          </div>
        </div>
      </dialog>
    </>
  );
}
