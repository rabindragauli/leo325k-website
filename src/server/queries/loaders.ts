import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { DEFAULT_GROUP_ORDER } from "@/lib/leadership-groups";
import { isFieldPublic, type VisibilityField } from "@/lib/visibility";
import {
  toPublicPerson,
  toPublicPosition,
  type ClubSource,
  type LeadershipSource,
  type ResourceSource,
} from "./views";

// Uncached public loaders. Each takes the Prisma client (or a transaction, for tests/db) and
// returns plain, serialisable rows with explicit `select`s and Dates as ISO strings. ./public wraps
// them in 'use cache'.
//
// Person visibility is filtered IN THE QUERY (docs/07): people are read in two steps. Step 1 reads
// only names and switches; step 2 reads each private value (photo, home club, membership no., cell,
// landline, email, blood group, designation) only for the rows where it is public. Address is never
// read. Private values therefore never reach the cache or the pages.

type Client = PrismaClient | Prisma.TransactionClient;

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const personSwitchSelect = {
  id: true,
  title: true,
  fullName: true,
  under18: true,
  photoConsent: true,
  designationPublic: true,
  homeClubPublic: true,
  membershipPublic: true,
  phonePublic: true,
  landlinePublic: true,
  emailPublic: true,
  bloodGroupPublic: true,
} satisfies Prisma.PersonSelect;

/** Person value columns and the visibility field that guards each (photo: photoConsent). */
const VALUE_FIELD = {
  homeClubId: "homeClub",
  membershipId: "membershipNo",
  phone: "cell",
  landline: "landline",
  email: "email",
  bloodGroup: "bloodGroup",
} as const satisfies Record<string, VisibilityField>;
type ValueColumn = keyof typeof VALUE_FIELD | "photo";

/** One Person column for the given ids only (none → no query). */
async function readColumn(client: Client, column: ValueColumn, ids: string[]) {
  if (ids.length === 0) return new Map<string, string | null>();
  const select: Prisma.PersonSelect = { id: true, [column]: true };
  const rows = (await client.person.findMany({
    where: { id: { in: ids } },
    select,
  })) as unknown as Array<{ id: string } & Record<ValueColumn, string | null>>;
  return new Map(rows.map((row) => [row.id, row[column]]));
}

/** Current and published Leo Years, their published district teams, the President extras and Our Pride. */
export async function loadLeadership(client: Client): Promise<LeadershipSource> {
  const years = await client.leoYear.findMany({
    where: { OR: [{ isCurrent: true }, { published: true }] },
    select: { id: true, label: true, startsOn: true, isCurrent: true, published: true },
  });
  const publishedYearIds = years.filter((y) => y.published).map((y) => y.id);

  const [positions, prideEntries] = await Promise.all([
    // Public = PUBLISHED position in a published Leo Year (no current-year exception). No `role` here.
    client.position.findMany({
      where: {
        leoYearId: { in: publishedYearIds },
        status: "PUBLISHED",
        group: { in: [...DEFAULT_GROUP_ORDER] },
      },
      select: {
        id: true,
        personId: true,
        leoYearId: true,
        group: true,
        clubId: true,
        message: true,
        sortOrder: true,
        status: true,
      },
    }),
    client.prideEntry.findMany({
      select: { id: true, personId: true, honorTitle: true, note: true, sort: true },
    }),
  ]);

  const personIds = [...new Set([...positions, ...prideEntries].map((row) => row.personId))];
  const switches = await client.person.findMany({
    where: { id: { in: personIds } },
    select: personSwitchSelect,
  });
  const idsWhere = (test: (p: (typeof switches)[number]) => boolean) =>
    switches.filter(test).map((p) => p.id);
  const switchesOf = new Map(switches.map((p) => [p.id, p]));
  const shownPositionIds = positions
    .filter((pos) => {
      const person = switchesOf.get(pos.personId);
      return person !== undefined && isFieldPublic(person, "designation");
    })
    .map((pos) => pos.id);

  const columns = ["photo", ...(Object.keys(VALUE_FIELD) as (keyof typeof VALUE_FIELD)[])] as const;
  const [values, roles, awards, journeySteps] = await Promise.all([
    Promise.all(
      columns.map((column) =>
        readColumn(
          client,
          column,
          idsWhere((p) =>
            column === "photo" ? p.photoConsent : isFieldPublic(p, VALUE_FIELD[column]),
          ),
        ),
      ),
    ),
    shownPositionIds.length === 0
      ? []
      : client.position.findMany({
          where: { id: { in: shownPositionIds } },
          select: { id: true, role: true },
        }),
    client.award.findMany({
      where: { personId: { in: personIds } },
      select: { id: true, personId: true, title: true, year: true, sort: true },
    }),
    client.journeyStep.findMany({
      where: { personId: { in: personIds } },
      select: { id: true, personId: true, year: true, role: true, organisation: true, sort: true },
    }),
  ]);

  const people = switches.map((p) =>
    toPublicPerson({
      ...p,
      ...Object.fromEntries(columns.map((column, i) => [column, values[i].get(p.id) ?? null])),
    }),
  );
  const roleOf = new Map(roles.map((r) => [r.id, r.role]));
  const homeClubIds = [...new Set(people.flatMap((p) => p.homeClubId ?? []))];
  const clubs =
    homeClubIds.length === 0
      ? []
      : await client.club.findMany({
          where: { id: { in: homeClubIds } },
          select: { id: true, name: true },
        });

  return {
    leoYears: years.map((y) => ({ ...y, startsOn: isoDate(y.startsOn) })),
    people,
    positions: positions.map((pos) =>
      toPublicPosition({ ...pos, role: roleOf.get(pos.id) ?? null }, switchesOf.get(pos.personId)),
    ),
    awards,
    journeySteps,
    prideEntries,
    clubs,
  };
}

/** Clubs listed in the directory and the regions they can belong to. Unlisted clubs never. */
export async function loadClubs(client: Client): Promise<ClubSource> {
  const [clubs, regions] = await Promise.all([
    client.club.findMany({
      where: { listedInDirectory: true },
      select: {
        id: true,
        name: true,
        slug: true,
        regionId: true,
        city: true,
        type: true,
        charterYear: true,
        sponsor: true,
        logo: true,
        listedInDirectory: true,
      },
    }),
    client.region.findMany({ select: { id: true, name: true, sort: true } }),
  ]);
  return { clubs, regions };
}

/** Published resources and their categories. */
export async function loadResources(client: Client): Promise<ResourceSource> {
  const [resourceCategories, resources] = await Promise.all([
    client.resourceCategory.findMany({ select: { id: true, name: true, sort: true } }),
    client.resource.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        description: true,
        categoryId: true,
        kind: true,
        filePath: true,
        fileType: true,
        fileSize: true,
        url: true,
        featured: true,
        featuredOrder: true,
        published: true,
        sort: true,
      },
    }),
  ]);
  return { resourceCategories, resources };
}
