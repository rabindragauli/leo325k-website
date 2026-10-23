// Public data access. Returns only public fields: never membershipId, phone/email only when the
// person's public toggle is on, only visible clubs and published resources and Leo Years.
// Sprint 2 reads the static seed in src/data; Sprint 3 swaps the default source for Prisma
// (explicit `select`, server-only) and the pages stay as they are.
import { clubs, regions } from "@/data/clubs";
import {
  awards,
  journeySteps,
  leoYears,
  people,
  positions,
  prideEntries,
} from "@/data/leadership";
import { resourceCategories, resources } from "@/data/resources";
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
import { displayName, initials, leoYearSlug, publicContact } from "@/lib/people";

export type DataSource = {
  leoYears: LeoYear[];
  people: Person[];
  positions: Position[];
  awards: Award[];
  journeySteps: JourneyStep[];
  prideEntries: PrideEntry[];
  clubs: Club[];
  regions: Region[];
  resourceCategories: ResourceCategory[];
  resources: Resource[];
};

export const staticSource: DataSource = {
  leoYears,
  people,
  positions,
  awards,
  journeySteps,
  prideEntries,
  clubs,
  regions,
  resourceCategories,
  resources,
};

// ── People ───────────────────────────────────────────────────────────────────

export type PersonCard = {
  id: string;
  name: string;
  initials: string;
  role: string;
  homeClub: string | null; // null → "[Home club]" placeholder
  photo: string | null;
  phone: string | null;
  email: string | null;
};

function homeClubName(person: Person, db: DataSource): string | null {
  if (person.homeClubId) return db.clubs.find((c) => c.id === person.homeClubId)?.name ?? null;
  return person.homeLionsClub;
}

function personCard(person: Person, role: string, db: DataSource): PersonCard {
  return {
    id: person.id,
    name: displayName(person),
    initials: initials(person.fullName),
    role,
    homeClub: homeClubName(person, db),
    photo: person.photo,
    ...publicContact(person),
  };
}

// ── Leo Years / Leadership ───────────────────────────────────────────────────

export type YearRef = { slug: string; label: string; isCurrent: boolean };

export type President = PersonCard & {
  message: string | null;
  awards: { title: string; year: string }[];
  journey: { year: string; role: string; organisation: string }[];
};

export type Team = {
  year: YearRef;
  president: President | null;
  leos: PersonCard[];
  lions: PersonCard[];
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

const yearRef = (y: LeoYear): YearRef => ({
  slug: leoYearSlug(y.label),
  label: y.label,
  isCurrent: y.isCurrent,
});

const newestFirst = (a: LeoYear, b: LeoYear) => b.startsOn.localeCompare(a.startsOn);

function team(year: LeoYear, db: DataSource): Team {
  const group = (g: Position["group"]) =>
    db.positions
      .filter((p) => p.leoYearId === year.id && p.group === g)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .flatMap((p) => {
        const person = db.people.find((x) => x.id === p.personId);
        return person ? [{ position: p, person }] : [];
      });

  const leoRows = group("DISTRICT_LEO");
  const lead = leoRows.find((r) => r.position.role === "District President");
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
    leos: leoRows.map((r) => personCard(r.person, r.position.role, db)),
    lions: group("DISTRICT_LION").map((r) => personCard(r.person, r.position.role, db)),
  };
}

export async function getCurrentLeoYear(db: DataSource = staticSource) {
  const current = db.leoYears.find((y) => y.isCurrent);
  return current ? { ...yearRef(current), published: current.published } : null;
}

/** `yearSlug` comes from `?year=`; anything unknown falls back to the default (current) view. */
export async function getLeadershipView(
  yearSlug?: string | null,
  db: DataSource = staticSource,
): Promise<LeadershipView | null> {
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

export async function getPrideEntries(db: DataSource = staticSource): Promise<PrideCard[]> {
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

/** Visible clubs only, A–Z. */
export async function getClubs(db: DataSource = staticSource): Promise<ClubCard[]> {
  return db.clubs
    .filter((c) => c.visible)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      city: c.city,
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

export async function getResourceLibrary(
  db: DataSource = staticSource,
): Promise<ResourceLibrary> {
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
    featured: items.filter((i) => i.featured),
  };
}
