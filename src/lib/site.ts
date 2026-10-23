// Static site content for the shared header/footer (design/source/public/Site*.dc.html).
// Sprint 3 moves the Leo Year theme, contact details and social links into the database
// (Site content in the admin portal). Bracketed strings are open placeholders (docs/08).

export type NavItem = { label: string; href: string };
export type Badge = { src: string; alt: string; width: number; height: number };
export type SocialLink = { label: string; url: string | null };

export const site = {
  name: "Leo District Council 325 K, Nepal",
  shortName: "Leo District Council 325 K",
  description:
    "Leo District Council 325 K, Nepal: the youth program of Lions Clubs International District 325 K.",
  tagline:
    "Youth leadership through community service. Sponsored by Lions Clubs International District 325 K.",
  parentLine: "Part of Leo Multiple District 325, Nepal",
  copyrightYear: 2026,
  leoYear: "LY 2026–27",
  theme: {
    quote: "“LEADING WITH PURPOSE”",
    motto: "EXECUTION WITH EXCELLENCE",
  },
} as const;

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Leadership", href: "/leadership" },
  { label: "Clubs", href: "/clubs" },
  { label: "Resources", href: "/resources" },
];

export const footerNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Leadership", href: "/leadership" },
  { label: "Club directory", href: "/clubs" },
  { label: "Resources", href: "/resources" },
];

export const contactHref = "/contact";
export const privacyHref = "/privacy";

export const contactDetails = {
  email: "[official district email]",
  hours: "Sunday – Friday, 10:00 AM – 5:00 PM",
  address: "[District office address], Nepal",
};

// url: null until the council supplies it; unset links are not rendered.
export const socialLinks: SocialLink[] = [
  { label: "Facebook", url: null },
  { label: "Instagram", url: null },
  { label: "YouTube", url: null },
];

// Desktop banner: laid out at 1440 × 216, scales with the width above 1440 px up to a
// 270 px tall banner (scale 1.25, reached at 1800 px). See SiteHeader and docs/05.
export const banner = { width: 1440, height: 216, maxHeight: 270, maxScale: 270 / 216 } as const;

/** Width/height props for showing an image at a fixed CSS height (next/image then serves 1× and 2×). */
export function atHeight(img: { width: number; height: number }, height: number) {
  return { width: Math.round((img.width * height) / img.height), height };
}

/**
 * Width/height props for a banner image shown at `height` design px (CSS sets the real size).
 * Sized ≥ 2 px above the largest scaled size on both axes, so the srcset covers it and CSS
 * always changes both dimensions (next/image warns when only one differs from the attributes).
 */
export function atBannerHeight(img: { width: number; height: number }, height: number) {
  const largest = height * banner.maxScale;
  return atHeight(img, Math.ceil(largest + 2 * Math.max(1, img.height / img.width)));
}

// Intrinsic sizes of public/brand/* (1× artwork; 2× originals requested, docs/05)
export const brand = {
  lionsLogo: { src: "/brand/lions-international-logo.png", width: 232, height: 220 },
  leoEmblem: { src: "/brand/leo-emblem.png", width: 237, height: 220 },
  curtainLeft: { src: "/brand/curtain-left.png", width: 56, height: 176 },
  curtainRight: { src: "/brand/curtain-right.png", width: 56, height: 176 },
  mountains: { src: "/brand/mountains-flag.png", width: 676, height: 158 },
};

export const themeBadges: Badge[] = [
  {
    src: "/brand/badge-1-we-serve.png",
    alt: "We Serve — Rooted in Service",
    width: 160,
    height: 160,
  },
  {
    src: "/brand/badge-2-lions-325k-round.png",
    alt: "Lions District 325 K: Leading with Purpose, LY 2026–27 (round)",
    width: 161,
    height: 160,
  },
  {
    src: "/brand/badge-3-lions-325k-quatrefoil.png",
    alt: "Lions District 325 K: Leading with Purpose, LY 2026–27 (quatrefoil)",
    width: 156,
    height: 160,
  },
  {
    src: "/brand/badge-4-leo-md325.png",
    alt: "Leo Multiple District 325, Nepal: Every Step Inspires",
    width: 146,
    height: 160,
  },
  {
    src: "/brand/badge-5-ldc325k-execution.png",
    alt: "Leo District Council 325 K: Execution with Excellence",
    width: 130,
    height: 160,
  },
];
