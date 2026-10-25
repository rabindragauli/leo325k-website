// Static seed records shaped like the Prisma models (prisma/schema.prisma), so Sprint 3 can load
// the same rows into MySQL and swap src/server/queries/* to Prisma without touching the pages.
// Dates are ISO strings here (Prisma returns Date objects).

export type PositionGroup =
  "DISTRICT_BOARD" | "DISTRICT_ADVISORS" | "DISTRICT_PRESIDENT_ADVISORS" | "CLUB";
export type PositionStatus = "DRAFT" | "PUBLISHED";
export type ClubType = "ALPHA" | "OMEGA";
export type ResourceKind = "FILE" | "LINK";

export type LeoYear = {
  id: string;
  label: string; // "2025–26"
  startsOn: string; // 1 July
  endsOn: string; // 30 June
  isCurrent: boolean;
  published: boolean;
  publishedAt: string | null;
};

// *Public switches: null = follow PUBLIC_BY_DEFAULT (src/lib/visibility.ts). address is admin-only.
export type Person = {
  id: string;
  title: string; // PERSON_TITLES (src/lib/people.ts)
  fullName: string;
  photo: string | null;
  photoConsent: boolean;
  under18: boolean;
  homeClubId: string | null;
  membershipId: string | null;
  phone: string | null; // cell
  landline: string | null;
  email: string | null;
  bloodGroup: string | null;
  address: string | null;
  designationPublic: boolean | null;
  homeClubPublic: boolean | null;
  membershipPublic: boolean | null;
  phonePublic: boolean | null;
  landlinePublic: boolean | null;
  emailPublic: boolean | null;
  bloodGroupPublic: boolean | null;
};

export type Position = {
  id: string;
  personId: string;
  leoYearId: string;
  group: PositionGroup;
  role: string; // designation
  clubId: string | null;
  message: string | null; // District President's message for the year
  sortOrder: number;
  status: PositionStatus;
};

export type Award = { id: string; personId: string; title: string; year: string; sort: number };

export type JourneyStep = {
  id: string;
  personId: string;
  year: string;
  role: string;
  organisation: string;
  sort: number;
};

export type PrideEntry = {
  id: string;
  personId: string;
  honorTitle: string;
  note: string | null;
  sort: number;
};

export type Region = { id: string; name: string; sort: number };

export type Club = {
  id: string;
  name: string;
  slug: string;
  regionId: string | null;
  city: string | null; // null only for unlisted clubs
  type: ClubType | null;
  charterYear: number | null;
  sponsor: string | null;
  email: string | null;
  logo: string | null;
  listedInDirectory: boolean;
};

export type ResourceCategory = { id: string; name: string; sort: number };

export type Resource = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  kind: ResourceKind;
  filePath: string | null;
  fileType: string | null; // PDF, DOCX, ZIP
  fileSize: number | null;
  url: string | null;
  featured: boolean;
  featuredOrder: number | null; // "Essentials for every club" order
  published: boolean;
  sort: number;
};
