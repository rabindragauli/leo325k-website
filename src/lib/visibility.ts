// Person visibility rules (docs/07, Phase 1 decisions). Pure, so they are unit-tested without a
// database; the public loaders use them to decide which values they may read at all.

export const VISIBILITY_FIELDS = [
  "designation",
  "homeClub",
  "membershipNo",
  "cell",
  "landline",
  "email",
  "bloodGroup",
] as const;
export type VisibilityField = (typeof VISIBILITY_FIELDS)[number];

/** The Person column holding each field's switch (null = follow PUBLIC_BY_DEFAULT). */
export const SWITCH_COLUMN = {
  designation: "designationPublic",
  homeClub: "homeClubPublic",
  membershipNo: "membershipPublic",
  cell: "phonePublic",
  landline: "landlinePublic",
  email: "emailPublic",
  bloodGroup: "bloodGroupPublic",
} as const satisfies Record<VisibilityField, string>;
export type SwitchColumn = (typeof SWITCH_COLUMN)[VisibilityField];

/**
 * THE default for every switch left unset (the one config value). Until the District President
 * confirms in writing, everything is hidden except designation and home club. The council's
 * proposal "public by default" is pending that written confirmation: do not change this without it.
 */
export const PUBLIC_BY_DEFAULT: Readonly<Record<VisibilityField, boolean>> = {
  designation: true,
  homeClub: true,
  membershipNo: false,
  cell: false,
  landline: false,
  email: false,
  bloodGroup: false,
};

/** Always hidden for under-18 members, whatever the switches say (no override). */
export const UNDER18_ALWAYS_HIDDEN: readonly VisibilityField[] = [
  "membershipNo",
  "cell",
  "landline",
  "email",
  "bloodGroup",
];

export type VisibilitySubject = { under18: boolean } & Record<SwitchColumn, boolean | null>;

export function isFieldPublic(person: VisibilitySubject, field: VisibilityField): boolean {
  if (person.under18 && UNDER18_ALWAYS_HIDDEN.includes(field)) return false;
  return person[SWITCH_COLUMN[field]] ?? PUBLIC_BY_DEFAULT[field];
}
