import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { atHeight, brand, site } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { ThemeBadges } from "./ThemeBadges";

/**
 * Sticky mobile header: 68 px bar + 4 px yellow + 3 px blue + 60 px badges row + 3 px orange
 * = 138 px (design/source/public/SiteHeaderMobile.dc.html). Shown at 860 px and below.
 */
export function SiteHeaderMobile({ className, menu = true }: { className?: string; menu?: boolean }) {
  return (
    <header className={cn("sticky top-0 z-50 text-white", className)}>
      <div className="flex h-[68px] items-center gap-2.5 bg-bar-mobile pr-3 pl-3.5">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2.5 text-white no-underline"
        >
          <Image src={brand.lionsLogo.src} alt="" {...atHeight(brand.lionsLogo, 42)} />
          <span className="flex min-w-0 flex-col font-heading">
            <span className="text-[15px] leading-[1.2] font-black">{site.shortName}</span>
            <span className="text-xs font-bold text-yellow">Nepal · {site.leoYear}</span>
          </span>
        </Link>
        {/* The admin sign-in page has no public menu */}
        {menu && <MobileMenu />}
      </div>
      <div className="h-1 bg-yellow" />
      <div className="h-[3px] bg-blue-bright" />
      <ThemeBadges
        height={46}
        className="h-[60px] items-center justify-center gap-2.5 bg-badges-band"
        imageClassName="h-[46px]"
      />
      <div className="h-[3px] bg-orange" />
    </header>
  );
}
