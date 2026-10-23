import Image from "next/image";
import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";
import { atHeight, brand, contactDetails, contactHref, footerNav, privacyHref, site } from "@/lib/site";
import { SocialLinks } from "./SocialLinks";

/** Mobile footer (design/source/public/SiteFooterMobile.dc.html). Shown at 860 px and below. */
export function SiteFooterMobile({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "flex flex-col gap-[22px] border-t-4 border-orange bg-teal-900 px-4 pt-9 pb-6 text-on-dark",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex shrink-0 items-center gap-1.5">
          <Image
            src={brand.lionsLogo.src}
            alt="Lions International"
            {...atHeight(brand.lionsLogo, 44)}
          />
          <Image
            src={brand.leoEmblem.src}
            alt="Leo emblem"
            {...atHeight(brand.leoEmblem, 42)}
            className="brightness-[1.9]"
          />
        </span>
        <span className="font-heading text-[17px] font-bold text-white">{site.name}</span>
      </div>

      <p className="text-sm leading-[1.6]">{site.tagline}</p>

      <nav aria-label="Footer">
        <ul role="list" className="grid grid-cols-2 gap-x-3 gap-y-1">
          {footerNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-11 items-center text-[15px] font-semibold text-white no-underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-1.5 text-sm leading-[1.2]">
        <Placeholder>{contactDetails.email}</Placeholder>
        <span>{contactDetails.hours}</span>
        <Placeholder>{contactDetails.address}</Placeholder>
        <Link href={contactHref} className="mt-1 self-start font-bold text-yellow underline">
          Contact us →
        </Link>
      </div>

      <SocialLinks pillClassName="border-teal-500 px-[13px] text-[13px]" />

      <div className="flex flex-col gap-1 border-t border-teal-600 pt-4 text-xs text-on-dark-muted">
        <span>
          © {site.copyrightYear} {site.name}
        </span>
        <span>{site.parentLine}</span>
        <Link href={privacyHref} className="self-start text-on-dark underline">
          Privacy notice
        </Link>
      </div>
    </footer>
  );
}
