import type { PositionGroup } from "@/data/types";

// Leadership page sections (Phase 1 decisions). To add a group: a value in the PositionGroup enum
// (prisma/schema.prisma + src/data/types.ts) and its label here.

export const GROUP_LABELS: Record<PositionGroup, string> = {
  DISTRICT_BOARD: "District Board",
  DISTRICT_ADVISORS: "District Advisors",
  DISTRICT_PRESIDENT_ADVISORS: "District President Advisors",
  CLUB: "Club board",
};

/** Groups shown on the Leadership page, in the default order (an Admin can change it, Batch 4). */
export const DEFAULT_GROUP_ORDER = [
  "DISTRICT_BOARD",
  "DISTRICT_ADVISORS",
  "DISTRICT_PRESIDENT_ADVISORS",
] as const satisfies readonly PositionGroup[];
export type DistrictGroup = (typeof DEFAULT_GROUP_ORDER)[number];

/** "DISTRICT_BOARD" → "district-board" (section id on the public page). */
export const groupSlug = (group: PositionGroup) => group.toLowerCase().replace(/_/g, "-");

// The District Board position with this designation gets the President feature (message, awards,
// journey). Matched trimmed and case-insensitive. TODO Sprint 5a Batch 3a: revisit (e.g. a flag).
export const PRESIDENT_DESIGNATION = "District President";

export function isPresidentDesignation(role: string | null): boolean {
  return role?.trim().toLowerCase() === PRESIDENT_DESIGNATION.toLowerCase();
}
