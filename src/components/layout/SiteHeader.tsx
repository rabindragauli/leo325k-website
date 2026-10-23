import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { atHeight, brand, site } from "@/lib/site";
import { MainNav } from "./MainNav";
import { ThemeBadges } from "./ThemeBadges";

/**
 * Full desktop header: 216 px theme banner + 4 px orange line + 60 px nav bar
 * (design/source/public/SiteHeader.dc.html, "full" variant). Shown above 860 px.
 */
export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={cn("w-full text-white", className)}>
      <div className="relative h-[216px] overflow-hidden bg-banner-outer">
        <div className="relative mx-auto h-[216px] max-w-banner overflow-hidden bg-banner">
          <svg
            viewBox="0 0 700 216"
            width="700"
            height="216"
            aria-hidden="true"
            className="absolute top-0 left-0"
          >
            <path d="M640 0 C614 100 574 190 484 216 H700 V0 Z" fill="#1A4359" />
            <path d="M0 0 H585 C560 100 520 190 430 216 H0 Z" fill="#244D63" />
            <path
              d="M625 0 C600 100 560 190 470 216"
              fill="none"
              stroke="#2B6F96"
              strokeWidth="22"
            />
            <path
              d="M598 0 C573 100 533 190 443 216"
              fill="none"
              stroke="#FCCC0A"
              strokeWidth="14"
            />
          </svg>

          <Image
            src={brand.curtainLeft.src}
            alt=""
            {...atHeight(brand.curtainLeft, 216)}
            className="absolute top-0 left-0 hidden art:block"
          />
          <Image
            src={brand.curtainRight.src}
            alt=""
            {...atHeight(brand.curtainRight, 216)}
            className="absolute top-0 right-0 hidden art:block"
          />
          <Image
            src={brand.mountains.src}
            alt=""
            {...atHeight(brand.mountains, 76)}
            className="absolute top-[46px] right-[76px] hidden art:block"
          />

          <Link
            href="/"
            className="absolute top-0 bottom-0 left-[90px] flex items-center gap-2.5 text-white no-underline"
          >
            <Image
              src={brand.lionsLogo.src}
              alt=""
              {...atHeight(brand.lionsLogo, 76)}
              preload
            />
            <span className="flex flex-col gap-px font-heading">
              <span className="text-[25px] leading-[1.15] font-black">Lions International</span>
              <span className="text-[19px] leading-[1.25]">{site.name}</span>
              <span className="text-[19px] leading-[1.25]">{site.leoYear}</span>
            </span>
            <Image
              src={brand.leoEmblem.src}
              alt=""
              {...atHeight(brand.leoEmblem, 70)}
              className="ml-1 hidden brightness-[1.9] leo:block"
            />
          </Link>

          <p className="absolute top-[110px] right-[447px] left-[610px] hidden flex-col gap-[9px] font-heading leading-[1.2] font-black theme:flex">
            <span className="pl-[26px] text-[21px] tracking-[0.4px]">{site.theme.quote}</span>
            <span className="block bg-theme-ribbon py-[5px] pl-[26px] text-[22px] tracking-[0.3px] whitespace-nowrap [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
              {site.theme.motto}
            </span>
          </p>

          <ThemeBadges
            height={74}
            className="absolute right-[76px] bottom-2.5 items-end gap-1.5"
            imageClassName="drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)]"
          />
        </div>
      </div>

      <div className="border-t-4 border-orange bg-teal-900">
        <div className="mx-auto flex min-h-[60px] max-w-banner flex-wrap items-center justify-between gap-3 px-10">
          <MainNav />
        </div>
      </div>
    </header>
  );
}
