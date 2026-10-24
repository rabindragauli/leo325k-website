import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
  toPublicPerson,
  type ClubSource,
  type LeadershipSource,
  type ResourceSource,
} from "./views";

// Uncached public loaders. Each takes the Prisma client (or a transaction, for tests/db) and
// returns plain, serialisable rows: explicit `select` (membershipId is never selected), phone/email
// cleared unless public with consent, Dates as ISO strings. ./public wraps them in 'use cache'.

type Client = PrismaClient | Prisma.TransactionClient;

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const personSelect = {
  id: true,
  prefix: true,
  fullName: true,
  photo: true,
  homeClubId: true,
  homeLionsClub: true,
  phone: true,
  phonePublic: true,
  email: true,
  emailPublic: true,
  consentAt: true,
} satisfies Prisma.PersonSelect;

/** Current and published Leo Years, their district teams, the President extras and Our Pride. */
export async function loadLeadership(client: Client): Promise<LeadershipSource> {
  const years = await client.leoYear.findMany({
    where: { OR: [{ isCurrent: true }, { published: true }] },
    select: { id: true, label: true, startsOn: true, isCurrent: true, published: true },
  });
  const yearIds = years.map((y) => y.id);

  const [positions, prideEntries] = await Promise.all([
    client.position.findMany({
      where: { leoYearId: { in: yearIds }, group: { in: ["DISTRICT_LEO", "DISTRICT_LION"] } },
      select: {
        id: true,
        personId: true,
        leoYearId: true,
        group: true,
        role: true,
        clubId: true,
        message: true,
        sortOrder: true,
      },
    }),
    client.prideEntry.findMany({
      select: { id: true, personId: true, honorTitle: true, note: true, sort: true },
    }),
  ]);

  const personIds = [...new Set([...positions, ...prideEntries].map((row) => row.personId))];
  const [people, awards, journeySteps, clubs] = await Promise.all([
    client.person.findMany({ where: { id: { in: personIds } }, select: personSelect }),
    client.award.findMany({
      where: { personId: { in: personIds } },
      select: { id: true, personId: true, title: true, year: true, sort: true },
    }),
    client.journeyStep.findMany({
      where: { personId: { in: personIds } },
      select: { id: true, personId: true, year: true, role: true, organisation: true, sort: true },
    }),
    client.club.findMany({ select: { id: true, name: true } }),
  ]);

  return {
    leoYears: years.map((y) => ({ ...y, startsOn: isoDate(y.startsOn) })),
    people: people.map(toPublicPerson),
    positions,
    awards,
    journeySteps,
    prideEntries,
    clubs,
  };
}

/** Visible clubs and the regions they can belong to. */
export async function loadClubs(client: Client): Promise<ClubSource> {
  const [clubs, regions] = await Promise.all([
    client.club.findMany({
      where: { visible: true },
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
        visible: true,
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
