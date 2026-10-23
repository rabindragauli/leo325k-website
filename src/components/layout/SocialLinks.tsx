import { cn } from "@/lib/cn";
import { socialLinks, type SocialLink } from "@/lib/site";

/** Pill links to social profiles. Links without a URL (not yet supplied) are not rendered. */
export function SocialLinks({
  links = socialLinks,
  className,
  pillClassName,
}: {
  links?: SocialLink[];
  className?: string;
  pillClassName?: string;
}) {
  const available = links.filter((link): link is SocialLink & { url: string } => !!link.url);
  if (available.length === 0) return null;

  return (
    <ul role="list" aria-label="Social media" className={cn("flex flex-wrap gap-2", className)}>
      {available.map((link) => (
        <li key={link.label}>
          <a
            href={link.url}
            rel="noopener"
            className={cn(
              "inline-flex min-h-11 items-center rounded-full border px-3.5 font-semibold text-white no-underline hover:bg-teal-700",
              pillClassName,
            )}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
