import Image from "next/image";
import { cn } from "@/lib/cn";
import { atHeight, site, themeBadges } from "@/lib/site";

/**
 * The five LY theme badges. `height` is the largest height they are shown at (it sizes the
 * srcset); the shown height comes from `imageClassName` (e.g. `h-[46px]`), width stays auto.
 */
export function ThemeBadges({
  height,
  className,
  imageClassName,
}: {
  height: number;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <ul role="list" aria-label={`${site.leoYear} theme badges`} className={cn("flex", className)}>
      {themeBadges.map((badge) => (
        <li key={badge.src} className="shrink-0">
          <Image
            src={badge.src}
            alt={badge.alt}
            {...atHeight(badge, height)}
            className={cn("block w-auto", imageClassName)}
          />
        </li>
      ))}
    </ul>
  );
}
