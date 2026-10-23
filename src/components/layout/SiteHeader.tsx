import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { atBannerHeight, brand, site, themeBadges } from "@/lib/site";
import { MainNav } from "./MainNav";
import { ThemeBadges } from "./ThemeBadges";

// 1×1 transparent GIF: the <picture> fallback below 1101 px, so mobile requests nothing.
const BLANK_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Full desktop header: theme banner + 4 px orange line + 60 px nav bar
 * (design/source/public/SiteHeader.dc.html, "full" variant). Shown above 860 px.
 *
 * The banner is laid out at 1440 × 216 (the design width) and every size in it is
 * `calc(N * var(--u))`, where `--u` is one design pixel: exactly 1px up to 1440 px wide, growing
 * with the header's width (container query units) above that, and capped at 270 / 216 px. So up
 * to 1440 it is the fixed-px layout, above it the banner scales as one unit, and past 1800 px the content stays
 * centred while the outer gradient fills the rest. Rule: docs/05_DESIGN_SYSTEM.md.
 */
export function SiteHeader({ className }: { className?: string }) {
  // Mountains are the largest image in the banner (the LCP on light pages), so they load
  // eagerly, but only where they are visible: the media-gated <source> keeps mobile from
  // downloading them (preload / loading="eager" would fetch them at every width).
  const mountains = getImageProps({
    src: brand.mountains.src,
    alt: "",
    ...atBannerHeight(brand.mountains, 76),
  }).props;

  return (
    <header
      className={cn(
        "@container w-full text-white [--u:clamp(1px,calc(100cqw/1440),1.25px)]",
        className,
      )}
    >
      <div className="relative h-[calc(216*var(--u))] overflow-hidden bg-banner-outer">
        <div className="relative mx-auto h-full max-w-[calc(1440*var(--u))] overflow-hidden bg-banner">
          <svg
            viewBox="0 0 700 216"
            aria-hidden="true"
            className="absolute top-0 left-0 h-full w-[calc(700*var(--u))]"
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
            {...atBannerHeight(brand.curtainLeft, 216)}
            className="absolute top-0 left-0 hidden h-full w-auto art:block"
          />
          <Image
            src={brand.curtainRight.src}
            alt=""
            {...atBannerHeight(brand.curtainRight, 216)}
            className="absolute top-0 right-0 hidden h-full w-auto art:block"
          />
          <picture>
            <source
              media="(min-width: 68.8125rem)"
              srcSet={mountains.srcSet}
              width={mountains.width}
              height={mountains.height}
            />
            {/* Art-directed <picture>: the srcset comes from getImageProps above */}
            <img
              src={BLANK_GIF}
              alt=""
              width={mountains.width}
              height={mountains.height}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute top-[calc(46*var(--u))] right-[calc(76*var(--u))] hidden h-[calc(76*var(--u))] w-auto art:block"
            />
          </picture>

          <Link
            href="/"
            className="absolute top-0 bottom-0 left-[calc(90*var(--u))] flex items-center gap-[calc(10*var(--u))] text-white no-underline"
          >
            <Image
              src={brand.lionsLogo.src}
              alt=""
              {...atBannerHeight(brand.lionsLogo, 76)}
              className="h-[calc(76*var(--u))] w-auto"
            />
            <span className="flex flex-col gap-[var(--u)] font-heading">
              <span className="text-[length:calc(25*var(--u))] leading-[1.15] font-black">
                Lions International
              </span>
              <span className="text-[length:calc(19*var(--u))] leading-[1.25]">{site.name}</span>
              <span className="text-[length:calc(19*var(--u))] leading-[1.25]">{site.leoYear}</span>
            </span>
            <Image
              src={brand.leoEmblem.src}
              alt=""
              {...atBannerHeight(brand.leoEmblem, 70)}
              className="ml-[calc(4*var(--u))] hidden h-[calc(70*var(--u))] w-auto brightness-[1.9] leo:block"
            />
          </Link>

          <p className="absolute top-[calc(110*var(--u))] right-[calc(447*var(--u))] left-[calc(610*var(--u))] hidden flex-col gap-[calc(9*var(--u))] font-heading leading-[1.2] font-black theme:flex">
            <span className="pl-[calc(26*var(--u))] text-[length:calc(21*var(--u))] tracking-[calc(0.4*var(--u))]">
              {site.theme.quote}
            </span>
            <span className="block bg-theme-ribbon py-[calc(5*var(--u))] pl-[calc(26*var(--u))] text-[length:calc(22*var(--u))] tracking-[calc(0.3*var(--u))] whitespace-nowrap [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
              {site.theme.motto}
            </span>
          </p>

          {/* Below 1101 px (no curtains) the badges sit 16 px from the edge and shrink with the
              width so they always stay right of the swoosh (x ≈ 590) and the Leo emblem:
              5 badges = 4.706 × height + gaps, hence (width − 632 px) / 4.72. */}
          <ThemeBadges
            height={atBannerHeight(themeBadges[0], 74).height}
            className="absolute right-4 bottom-[calc(10*var(--u))] items-end gap-[calc(6*var(--u))] art:right-[calc(76*var(--u))]"
            imageClassName="h-[clamp(48px,calc((100cqw-632px)/4.72),74px)] drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] art:h-[calc(74*var(--u))]"
          />
        </div>
      </div>

      {/* Nav shares the page/footer container (1240 px, 24 px gutters); only the banner art is wider */}
      <div className="border-t-4 border-orange bg-teal-900 px-6">
        <div className="mx-auto flex min-h-[60px] max-w-content flex-wrap items-center justify-between gap-3">
          <MainNav />
        </div>
      </div>
    </header>
  );
}
