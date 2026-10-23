import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadershipContent } from "@/components/public/Leadership";
import { getArchivedYearSlugs, getLeadershipView, getPrideEntries } from "@/server/queries/public";

// Archived Leo Years, e.g. /leadership/2025-26, prerendered at build time.
// Sprint 5: after an admin publishes/archives a year, revalidatePath("/leadership/[year]", "page").
export async function generateStaticParams() {
  return (await getArchivedYearSlugs()).map((year) => ({ year }));
}

export async function generateMetadata({ params }: PageProps<"/leadership/[year]">): Promise<Metadata> {
  const { year } = await params;
  return { title: `Leadership ${year.replace("-", "–")}` };
}

// `dynamicParams` is not available with Cache Components: unlisted years render on request and 404 here.
export default async function LeadershipYearPage({ params }: PageProps<"/leadership/[year]">) {
  const { year } = await params;
  if (!(await getArchivedYearSlugs()).includes(year)) notFound();

  const [view, pride] = await Promise.all([getLeadershipView(year), getPrideEntries()]);
  if (!view) notFound();
  return <LeadershipContent view={view} pride={pride} />;
}
