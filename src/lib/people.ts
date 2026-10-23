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
 * Phone/email only when the person turned the matching public toggle on (docs/07 privacy rule).
 * Membership ID is never part of a public view.
 */
export function publicContact(person: {
  phone: string | null;
  phonePublic: boolean;
  email: string | null;
  emailPublic: boolean;
}): { phone: string | null; email: string | null } {
  return {
    phone: person.phonePublic && person.phone?.trim() ? person.phone.trim() : null,
    email: person.emailPublic && person.email?.trim() ? person.email.trim() : null,
  };
}

/** "2025–26" → "2025-26" (the /leadership/<slug> path segment). */
export function leoYearSlug(label: string): string {
  return label.replace(/[–—]/g, "-");
}
