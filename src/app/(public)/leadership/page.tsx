import type { Metadata } from "next";
import { connection } from "next/server";
import { LeadershipContent } from "@/components/public/Leadership";
import { getLeadershipView, getPrideEntries } from "@/server/queries/public";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "The Leos and Lions guiding District 325 K: District President, district officers, sponsoring Lions and Our Pride.",
};

// Rendered per request from the cached queries (src/server/queries/public.ts) and sent as complete
// HTML (no streamed shell), so it works without JavaScript. `instant = false` allows this blocking
// render and opts the page out of the static-shell check.
export const instant = false;

// Current Leo Year (coming soon until published, with the latest published team below).
// Refreshed by revalidateTag("leadership") after an admin publishes a year or edits its team (Sprint 5).
export default async function LeadershipPage() {
  await connection(); // request time, from the cache: the build never needs the database
  const [view, pride] = await Promise.all([getLeadershipView(), getPrideEntries()]);
  if (!view) return null;
  return <LeadershipContent view={view} pride={pride} />;
}
