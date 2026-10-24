import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LeadershipContent } from "@/components/public/Leadership";
import { isLeoYearSlug } from "@/lib/people";
import {
  getArchivedYearSlugs,
  getCurrentLeoYear,
  getLeadershipView,
  getPrideEntries,
} from "@/server/queries/public";

// Archived Leo Years, e.g. /leadership/2025-26. The build lists no real years (it must not need the
// database), only a placeholder, which Cache Components requires (at least one param) and which
// 404s here. Each real year is rendered on its first visit and stored as a static page (ISR);
// `ensureStatic = "navigation"` makes that first visit wait for the complete page, so the 404 and
// the redirect below are real HTTP statuses, not streamed ones. The page reads the tagged cached
// queries, so revalidateTag("leadership") (Sprint 5) also refreshes the stored copies.
// `params` is read outside <Suspense> on purpose (that is what makes the statuses real), so the
// route is marked as allowed to block: `instant = false`.
export const ensureStatic = "navigation";
export const instant = false;

export function generateStaticParams() {
  return [{ year: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/leadership/[year]">): Promise<Metadata> {
  const { year } = await params;
  return { title: `Leadership ${year.replace("-", "–")}` };
}

export default async function LeadershipYearPage({ params }: PageProps<"/leadership/[year]">) {
  const { year } = await params;
  // Before any data access: the build placeholder and malformed slugs never reach the database
  if (!isLeoYearSlug(year)) notFound();

  if (!(await getArchivedYearSlugs()).includes(year)) {
    // The current year lives at /leadership. Temporary (307): next year this URL becomes an archive page.
    if ((await getCurrentLeoYear())?.slug === year) redirect("/leadership");
    notFound();
  }

  const [view, pride] = await Promise.all([getLeadershipView(year), getPrideEntries()]);
  if (!view) notFound();
  return <LeadershipContent view={view} pride={pride} />;
}
