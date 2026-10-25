// Pure view builders for the public pages: plain rows in, public view models out. No database and
// no Next.js APIs here, so the rules are unit-tested without MySQL (tests/unit/queries.test.ts).
// The rows come from ./loaders (Prisma, explicit `select`) through the cached wrappers in ./public.
import type {
  Award,
  Club,
  ClubType,
  JourneyStep,
  LeoYear,
  Person,
  Position,
  PrideEntry,
  Region,
  Resource,
  ResourceCategory,
} from "@/data/types";
import {
  DEFAULT_GROUP_ORDER,
  GROUP_LABELS,
  groupSlug,
  isPresidentDesignation,
  type DistrictGroup,
} from "@/lib/leadership-groups";
import { displayName, initials, leoYearSlug } from "@/lib/people";
import { isFieldPublic, type VisibilitySubject } from "@/lib/visibility";

// ── Rows ─────────────────────────────────────────────────────────────────────

/**
 * A person as the public site may hold them: never address or the switches; every other value
 * only when its switch (or the default) makes it public (src/lib/visibility.ts).
 */
export type PublicPerson = {
  id: string;
  title: string;
  fullName: string;
  photo: string | null;
  homeClubId: string | null;
  membershipNo: string | null;
  phone: string | null;
  landline: string | null;
  email: string | null;
  bloodGroup: string | null;
};

/** A published position; role (designation) is null when the person hides it. */
export type PublicPosition = Omit<Position, "role"> & { role: string | null };

export type YearRow = Pick<LeoYear, "id" | "label" | "startsOn" | "isCurrent" | "published">;
export type ClubRow = Pick<
  Club,
  "id" | "name" | "slug" | "regionId" | "city" | "type" | "charterYear" | "sponsor" | "logo" | "listedInDirectory"
>;

export type LeadershipSource = {
  leoYears: YearRow[];
  people: PublicPerson[];
  positions: PublicPosition[];
  awards: Award[];
  journeySteps: JourneyStep[];
  prideEntries: PrideEntry[];
  clubs: Pick<Club, "id" | "name">[]; // home club names (listed or not)
};
export type ClubSource = { clubs: ClubRow[]; regions: Region[] };
export type ResourceSource = { resourceCategories: ResourceCategory[]; resources: Resource[] };

/** The switches plus whichever values were read (./loaders reads a value only when it is public). */
export type PersonInput = VisibilitySubject &
  Pick<Person, "id" | "title" | "fullName" | "photoConsent"> &
  Partial<Pick<Person, "photo" | "homeClubId" | "membershipId" | "phone" | "landline" | "email" | "bloodGroup">>;

/**
 * The visibility rule, applied again to whatever the loader read (defence in depth) and to raw rows
 * in unit tests. Empty strings count as missing.
 */
export function toPublicPerson(person: PersonInput): PublicPerson {
  const value = (v: string | null | undefined) => v?.trim() || null;
  const ifPublic = (field: Parameters<typeof isFieldPublic>[1], v: string | null | undefined) =>
    isFieldPublic(person, field) ? value(v) : null;
  return {
    id: person.id,
    title: person.title,
    fullName: person.fullName,
    photo: person.photoConsent ? value(person.photo) : null,
    homeClubId: ifPublic("homeClub", person.homeClubId),
    membershipNo: ifPublic("membershipNo", person.membershipId),
    phone: ifPublic("cell", person.phone),
    landline: ifPublic("landline", person.landline),
    email: ifPublic("email", person.email),
    bloodGroup: ifPublic("bloodGroup", person.bloodGroup),
  };
}

/** Keeps the designation only when the person shows it. */
export function toPublicPosition(
  position: Omit<Position, "role"> & { role?: string | null },
  person: VisibilitySubject | undefined,
): PublicPosition {
  const show = person !== undefined && isFieldPublic(person, "designation");
  return { ...position, role: show ? (position.role?.trim() || null) : null };
}

// ── People ───────────────────────────────────────────────────────────────────

export type PersonCard = {
  id: string;
  name: string;
  initials: string;
  role: string | null; // null: designation hidden
  homeClub: string | null; // null → "[Home club]" placeholder (Batch 4: no placeholder when hidden)
  photo: string | null;
  membershipNo: string | null;
  phone: string | null;
  landline: string | null;
  email: string | null;
  bloodGroup: string | null;
};

function homeClubName(person: PublicPerson, db: LeadershipSource): string | null {
  return person.homeClubId ? (db.clubs.find((c) => c.id === person.homeClubId)?.name ?? null) : null;
}

function personCard(person: PublicPerson, role: string | null, db: LeadershipSource): PersonCard {
  return {
    id: person.id,
    name: displayName(person),
    initials: initials(person.fullName),
    role,
    homeClub: homeClubName(person, db),
    photo: person.photo,
    membershipNo: person.membershipNo,
    phone: person.phone,
    landline: person.landline,
    email: person.email,
    bloodGroup: person.bloodGroup,
  };
}

// ── Leo Years / Leadership ───────────────────────────────────────────────────

export type YearRef = { slug: string; label: string; isCurrent: boolean };

export type President = PersonCard & {
  message: string | null;
  awards: { title: string; year: string }[];
  journey: { year: string; role: string; organisation: string }[];
};

export type TeamSection = { group: DistrictGroup; id: string; label: string; people: PersonCard[] };

export type Team = {
  year: YearRef;
  president: President | null;
  /** Non-empty groups in the configured order. */
  sections: TeamSection[];
};

export type LeadershipView = {
  /** Switcher: the current year (even before it is published) and every published year, newest first. */
  years: YearRef[];
  selected: YearRef;
  current: YearRef | null;
  /** Current year selected but not published yet → "coming soon" block above the latest team. */
  comingSoon: boolean;
  /** The team shown: the selected year, or the latest published year while the current one is coming soon. */
  team: Team | null;
};

const yearRef = (y: YearRow): YearRef => ({
  slug: leoYearSlug(y.label),
  label: y.label,
  isCurrent: y.isCurrent,
});

const newestFirst = (a: YearRow, b: YearRow) => b.startsOn.localeCompare(a.startsOn);

function team(year: YearRow, db: LeadershipSource): Team {
  // Only published positions of a published year (the loader already filters; kept here too).
  const group = (g: DistrictGroup) =>
    db.positions
      .filter((p) => p.leoYearId === year.id && p.group === g && p.status === "PUBLISHED" && year.published)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .flatMap((p) => {
        const person = db.people.find((x) => x.id === p.personId);
        return person ? [{ position: p, person }] : [];
      });

  const lead = group("DISTRICT_BOARD").find((r) => isPresidentDesignation(r.position.role));
  const president: President | null = lead
    ? {
        ...personCard(lead.person, lead.position.role, db),
        message: lead.position.message,
        awards: db.awards
          .filter((a) => a.personId === lead.person.id)
          .sort((a, b) => a.sort - b.sort)
          .map(({ title, year: y }) => ({ title, year: y })),
        journey: db.journeySteps
          .filter((j) => j.personId === lead.person.id)
          .sort((a, b) => a.sort - b.sort)
          .map(({ year: y, role, organisation }) => ({ year: y, role, organisation })),
      }
    : null;

  return {
    year: yearRef(year),
    president,
    sections: DEFAULT_GROUP_ORDER.map((g) => ({
      group: g,
      id: groupSlug(g),
      label: GROUP_LABELS[g],
      people: group(g).map((r) => personCard(r.person, r.position.role, db)),
    })).filter((s) => s.people.length > 0),
  };
}

export function currentLeoYear(db: Pick<LeadershipSource, "leoYears">) {
  const current = db.leoYears.find((y) => y.isCurrent);
  return current ? { ...yearRef(current), published: current.published } : null;
}

/** Published past years, served at /leadership/<slug>. */
export function archivedYearSlugs(db: Pick<LeadershipSource, "leoYears">): string[] {
  return db.leoYears
    .filter((y) => y.published && !y.isCurrent)
    .sort(newestFirst)
    .map((y) => leoYearSlug(y.label));
}

/** No slug (or an unknown one) gives the default (current year) view; /leadership/[year] 404s unknown years itself. */
export function leadershipView(db: LeadershipSource, yearSlug?: string | null): LeadershipView | null {
  const current = db.leoYears.find((y) => y.isCurrent) ?? null;
  const published = db.leoYears.filter((y) => y.published).sort(newestFirst);
  const listed = [...(current && !current.published ? [current] : []), ...published].sort(
    newestFirst,
  );
  if (listed.length === 0) return null;

  const fallback = current ?? listed[0];
  const selected = listed.find((y) => leoYearSlug(y.label) === yearSlug) ?? fallback;
  const comingSoon = !selected.published;
  const shown = comingSoon ? (published[0] ?? null) : selected;

  return {
    years: listed.map(yearRef),
    selected: yearRef(selected),
    current: current ? yearRef(current) : null,
    comingSoon,
    team: shown ? team(shown, db) : null,
  };
}

// ── Our Pride ────────────────────────────────────────────────────────────────

export type PrideCard = {
  id: string;
  name: string;
  initials: string;
  honorTitle: string;
  note: string | null;
  photo: string | null;
};

export function prideCards(db: Pick<LeadershipSource, "prideEntries" | "people">): PrideCard[] {
  return [...db.prideEntries]
    .sort((a, b) => a.sort - b.sort)
    .flatMap((entry) => {
      const person = db.people.find((p) => p.id === entry.personId);
      if (!person) return [];
      return [
        {
          id: entry.id,
          name: displayName(person),
          initials: initials(person.fullName),
          honorTitle: entry.honorTitle,
          note: entry.note,
          photo: person.photo,
        },
      ];
    });
}

// ── Clubs ────────────────────────────────────────────────────────────────────

export type ClubCard = {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string | null;
  type: ClubType | null;
  charterYear: number | null;
  sponsor: string | null;
  logo: string | null;
};

/** Clubs listed in the directory only, A–Z. */
export function clubCards(db: ClubSource): ClubCard[] {
  return db.clubs
    .filter((c) => c.listedInDirectory)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      city: c.city ?? "",
      region: db.regions.find((r) => r.id === c.regionId)?.name ?? null,
      type: c.type,
      charterYear: c.charterYear,
      sponsor: c.sponsor,
      logo: c.logo,
    }));
}

// ── Resources ────────────────────────────────────────────────────────────────

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  kind: Resource["kind"];
  fileType: string | null;
  fileSize: number | null;
  /** Download (/media/…) or external URL; null while nothing is attached → disabled placeholder button. */
  href: string | null;
  featured: boolean;
};

export type ResourceLibrary = {
  /** Only categories with at least one published resource, in admin order. */
  categories: string[];
  items: ResourceItem[];
  featured: ResourceItem[];
};

export function resourceLibrary(db: ResourceSource): ResourceLibrary {
  const categories = [...db.resourceCategories].sort((a, b) => a.sort - b.sort);
  const items = db.resources
    .filter((r) => r.published)
    .sort((a, b) => {
      const ca = categories.findIndex((c) => c.id === a.categoryId);
      const cb = categories.findIndex((c) => c.id === b.categoryId);
      return ca - cb || a.sort - b.sort;
    })
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: categories.find((c) => c.id === r.categoryId)?.name ?? "",
      kind: r.kind,
      fileType: r.fileType,
      fileSize: r.fileSize,
      href: r.kind === "LINK" ? r.url : r.filePath ? `/media/${r.filePath}` : null,
      featured: r.featured,
    }));

  return {
    categories: categories
      .filter((c) => items.some((i) => i.category === c.name))
      .map((c) => c.name),
    items,
    // "Essentials for every club": featured published items in featuredOrder (docs/03)
    featured: db.resources
      .filter((r) => r.published && r.featured)
      .sort((a, b) => (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity))
      .flatMap((r) => items.find((i) => i.id === r.id) ?? []),
  };
}
