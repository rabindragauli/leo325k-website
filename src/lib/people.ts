// Small pure helpers for people and Leo Years (shared by public queries and, later, admin).

/** "Durga Prasad Humagain" → "DH": first letter of the first and last name. */
export function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Prefix + name as shown publicly: "PMJF Lion Ramesh Adhikari". */
export function displayName(person: { prefix: string; fullName: string }): string {
  return [person.prefix, person.fullName].filter(Boolean).join(" ");
}

/**
 * Phone/email only when the person turned the matching public toggle on AND a "consent obtained
 * on" date is recorded (docs/07 privacy rule, docs/08 consent rule). Membership ID is never part
 * of a public view.
 */
export function publicContact(person: {
  phone: string | null;
  phonePublic: boolean;
  email: string | null;
  emailPublic: boolean;
  consentAt: Date | string | null;
}): { phone: string | null; email: string | null } {
  const consent = person.consentAt !== null;
  return {
    phone: consent && person.phonePublic && person.phone?.trim() ? person.phone.trim() : null,
    email: consent && person.emailPublic && person.email?.trim() ? person.email.trim() : null,
  };
}

/** A /leadership/<slug> segment in the "2025-26" form, the second year following the first. */
export function isLeoYearSlug(slug: string): boolean {
  const match = /^(\d{4})-(\d{2})$/.exec(slug);
  return match !== null && (Number(match[1]) + 1) % 100 === Number(match[2]);
}

export const FIRST_LEO_YEAR = 2015;

/**
 * A Leo Year slug starting between 2015 and the current year + 2. Used by the proxy so bots
 * cannot fill the ISR cache with stored 404 pages for far-off years. `now` is passed in because
 * reading the clock during a Cache Components prerender is not allowed (the page uses isLeoYearSlug).
 */
export function isPlausibleLeoYearSlug(slug: string, now: Date): boolean {
  if (!isLeoYearSlug(slug)) return false;
  const start = Number(slug.slice(0, 4));
  return start >= FIRST_LEO_YEAR && start <= now.getFullYear() + 2;
}

/** "2025–26" → "2025-26" (the /leadership/<slug> path segment). */
export function leoYearSlug(label: string): string {
  return label.replace(/[–—]/g, "-");
}
