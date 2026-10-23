import type { Metadata } from "next";
import { LeadershipContent } from "@/components/public/Leadership";
import { getLeadershipView, getPrideEntries } from "@/server/queries/public";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "The Leos and Lions guiding District 325 K: District President, district officers, sponsoring Lions and Our Pride.",
};

// Current Leo Year (coming soon until published, with the latest published team below). Prerendered;
// Sprint 5: revalidatePath("/leadership") after an admin publishes a year or edits its team.
export default async function LeadershipPage() {
  const [view, pride] = await Promise.all([getLeadershipView(), getPrideEntries()]);
  if (!view) return null;
  return <LeadershipContent view={view} pride={pride} />;
}
