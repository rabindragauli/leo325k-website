import { NextResponse, type NextRequest } from "next/server";
import { getArchivedYearSlugs } from "@/server/queries/public";

// Runs before rendering (Node.js runtime). Only /leadership/<year> is matched.
//
// Why: with Cache Components, a year that generateStaticParams did not list is rendered on request
// behind the static public layout, so the 200 status is sent before the page can call notFound().
// Checking the year here returns a real 404 instead. (We run one Node server on cPanel, so importing
// the data layer is fine; Sprint 3 swaps it to a small Prisma query.)
// Sprint 4 adds the ADMIN_SLUG rewrite and the direct /admin → 404 here as well.
export async function proxy(request: NextRequest) {
  const year = request.nextUrl.pathname.split("/")[2] ?? "";
  if ((await getArchivedYearSlugs()).includes(year)) return NextResponse.next();

  // Unmatched internal path → the branded not-found page with status 404
  return NextResponse.rewrite(new URL("/__leadership-year-not-found", request.url));
}

export const config = {
  matcher: "/leadership/:year",
};
