import Image from "next/image";
import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";
import { atHeight, brand, contactDetails, contactHref, footerNav, privacyHref, site } from "@/lib/site";
import { SocialLinks } from "./SocialLinks";

const columnHeading = "text-eyebrow font-bold tracking-[1px] text-yellow uppercase";

/** Desktop footer (design/source/public/SiteFooter.dc.html). Shown above 860 px. */
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn("border-t-4 border-orange bg-teal-900 px-6 pt-16 pb-7 text-on-dark", className)}
    >
      <div className="mx-auto flex max-w-content flex-col gap-10">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="flex flex-[1_1_320px] flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex shrink-0 items-center gap-2">
                <Image
                  src={brand.lionsLogo.src}
                  alt="Lions International"
                  {...atHeight(brand.lionsLogo, 52)}
                />
                <Image
                  src={brand.leoEmblem.src}
                  alt="Leo emblem"
                  {...atHeight(brand.leoEmblem, 50)}
                  className="brightness-[1.9]"
                />
              </span>
              <span className="font-heading text-xl font-bold text-white">{site.name}</span>
            </div>
            <p className="max-w-[420px] text-[15px] leading-[1.6]">{site.tagline}</p>
            <SocialLinks pillClassName="border-teal-500 text-sm" />
          </div>

          <nav aria-labelledby="footer-explore" className="flex flex-[0_1_200px] flex-col gap-2.5">
            <h2 id="footer-explore" className={columnHeading}>
              Explore
            </h2>
            <ul role="list" className="flex flex-col gap-2.5 text-[15px] leading-[1.2]">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-on-dark no-underline hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-[0_1_300px] flex-col gap-2.5 text-[15px] leading-[1.2]">
            <h2 className={columnHeading}>Contact</h2>
            <Placeholder>{contactDetails.email}</Placeholder>
            <span>{contactDetails.hours}</span>
            <Placeholder>{contactDetails.address}</Placeholder>
            <Link href={contactHref} className="self-start font-bold text-white underline">
              Contact us →
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-teal-600 pt-[22px] text-sm text-on-dark-muted">
          <span>
            © {site.copyrightYear} {site.name}
          </span>
          <span className="flex flex-wrap gap-4">
            <Link href={privacyHref} className="text-on-dark underline">
              Privacy notice
            </Link>
            <span>{site.parentLine}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
