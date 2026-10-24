// Seed from src/data (docs/08_CONTENT_AND_SEED.md). Nothing here is invented: the records are the
// approved design data, and everything not supplied stays null (open placeholders).
//
// Idempotent: every row is upserted on its stable src/data id with `update: {}` (create-only), so
// running it again changes nothing and never overwrites edits made later in the admin portal.
// To load changed seed data locally, use `npm run db:reset`.
import { PrismaClient } from "@prisma/client";
import { clubs, regions } from "../src/data/clubs";
import {
  awards,
  journeySteps,
  leoYears,
  people,
  positions,
  prideEntries,
} from "../src/data/leadership";
import { resourceCategories, resources } from "../src/data/resources";

const prisma = new PrismaClient();

const date = (iso: string | null) => (iso ? new Date(iso) : null);

async function main() {
  for (const { id, ...data } of regions) {
    await prisma.region.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }
  for (const { id, ...data } of clubs) {
    await prisma.club.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }

  // Officers start private (docs/08 consent rule): no phone/email shown, no consent date.
  for (const { id, consentAt, ...data } of people) {
    await prisma.person.upsert({
      where: { id },
      create: { id, ...data, consentAt: date(consentAt) },
      update: {},
    });
  }

  for (const { id, startsOn, endsOn, publishedAt, ...data } of leoYears) {
    await prisma.leoYear.upsert({
      where: { id },
      create: {
        id,
        ...data,
        startsOn: new Date(startsOn),
        endsOn: new Date(endsOn),
        publishedAt: date(publishedAt),
      },
      update: {},
    });
  }
  for (const { id, ...data } of positions) {
    await prisma.position.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }
  for (const { id, ...data } of awards) {
    await prisma.award.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }
  for (const { id, ...data } of journeySteps) {
    await prisma.journeyStep.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }
  for (const { id, ...data } of prideEntries) {
    await prisma.prideEntry.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }

  for (const { id, ...data } of resourceCategories) {
    await prisma.resourceCategory.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }
  for (const { id, ...data } of resources) {
    await prisma.resource.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }

  const counts = {
    LeoYear: await prisma.leoYear.count(),
    Person: await prisma.person.count(),
    Position: await prisma.position.count(),
    Award: await prisma.award.count(),
    JourneyStep: await prisma.journeyStep.count(),
    PrideEntry: await prisma.prideEntry.count(),
    Region: await prisma.region.count(),
    Club: await prisma.club.count(),
    ResourceCategory: await prisma.resourceCategory.count(),
    Resource: await prisma.resource.count(),
    "Resource (published)": await prisma.resource.count({ where: { published: true } }),
    "Person (phone/email public)": await prisma.person.count({
      where: { OR: [{ phonePublic: true }, { emailPublic: true }] },
    }),
  };
  console.table(counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
