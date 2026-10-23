// Static seed records shaped like the Prisma models (prisma/schema.prisma), so Sprint 3 can load
// the same rows into MySQL and swap src/server/queries/* to Prisma without touching the pages.
// Dates are ISO strings here (Prisma returns Date objects).

export type TeamGroup = "DISTRICT_LEO" | "DISTRICT_LION" | "CLUB";
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

export type Person = {
  id: string;
  prefix: string; // Leo, Leo-Lion, Lion, MJF Lion, PMJF Lion
  fullName: string;
  photo: string | null;
  homeClubId: string | null;
  homeLionsClub: string | null;
  membershipId: string | null; // admin only, never public
  phone: string | null;
  phonePublic: boolean;
  email: string | null;
  emailPublic: boolean;
  consentAt: string | null;
};

export type Position = {
  id: string;
  personId: string;
  leoYearId: string;
  group: TeamGroup;
  role: string;
  clubId: string | null;
  message: string | null; // District President's message for the year
  sortOrder: number;
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
  city: string;
  type: ClubType | null;
  charterYear: number | null;
  sponsor: string | null;
  email: string | null;
  logo: string | null;
  visible: boolean;
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
  published: boolean;
  sort: number;
};
