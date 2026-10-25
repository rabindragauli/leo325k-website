import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/server/db";
import { loadClubs, loadLeadership, loadResources } from "./loaders";
import {
  archivedYearSlugs,
  clubCards,
  currentLeoYear,
  leadershipView,
  prideCards,
  resourceLibrary,
  type ClubCard,
  type LeadershipView,
  type PrideCard,
  type ResourceLibrary,
} from "./views";

export type {
  ClubCard,
  LeadershipView,
  PersonCard,
  President,
  PrideCard,
  ResourceItem,
  ResourceLibrary,
  Team,
  TeamSection,
  YearRef,
} from "./views";

// Public data access for the pages. Only public fields leave ./loaders (person values are read only
// when their visibility switch makes them public; address never), and only clubs listed in the
// directory, published resources, current/published Leo Years and published positions.
//
// Caching (Cache Components): each source is a 'use cache' function with the "publicContent"
// lifetime (next.config.ts) and a tag. Pages that call these after `connection()` render per request
// from the in-memory cache, so `next build` never needs the database. /leadership/[year] calls them
// without `connection()` and is stored as a static page per year (ISR), refreshed by the same tags.
// Cached functions take no arguments: the Prisma client is not serialisable, so it is used inside.
//
// TODO Sprint 5: after every admin mutation call revalidateTag (next/cache) for the affected tag:
//   "leadership": Leo Years (publish/archive), positions, people, awards, journey, Our Pride
//   "clubs":      clubs and regions (also refreshes "leadership", which shows home club names)
//   "resources":  resources and categories

async function leadershipSource() {
  "use cache";
  cacheLife("publicContent");
  cacheTag("leadership", "clubs");
  return loadLeadership(db);
}

async function clubSource() {
  "use cache";
  cacheLife("publicContent");
  cacheTag("clubs");
  return loadClubs(db);
}

async function resourceSource() {
  "use cache";
  cacheLife("publicContent");
  cacheTag("resources");
  return loadResources(db);
}

export async function getCurrentLeoYear() {
  return currentLeoYear(await leadershipSource());
}

/** Published past years, served at /leadership/<slug>. */
export async function getArchivedYearSlugs(): Promise<string[]> {
  return archivedYearSlugs(await leadershipSource());
}

/** No slug (or an unknown one) gives the default (current year) view. */
export async function getLeadershipView(yearSlug?: string | null): Promise<LeadershipView | null> {
  return leadershipView(await leadershipSource(), yearSlug);
}

export async function getPrideEntries(): Promise<PrideCard[]> {
  return prideCards(await leadershipSource());
}

/** Clubs listed in the directory only, A–Z. */
export async function getClubs(): Promise<ClubCard[]> {
  return clubCards(await clubSource());
}

export async function getResourceLibrary(): Promise<ResourceLibrary> {
  return resourceLibrary(await resourceSource());
}
