import { NextResponse, type NextRequest } from "next/server";
import { isPlausibleLeoYearSlug } from "@/lib/people";

// Runs before rendering. Only /leadership/<year> is matched, and no database is used here.
//
// A malformed or implausible year (not "2025-26" style, or outside 2015 … current year + 2) gets
// the branded 404 straight away, so junk URLs never render or fill the ISR cache with stored 404s.
// Plausible years are handled by the page itself from the cached query: archived → page,
// current → 307 to /leadership, unknown → 404.
// Sprint 4 adds the ADMIN_SLUG rewrite and the direct /admin → 404 here as well.
export function proxy(request: NextRequest) {
  const year = request.nextUrl.pathname.split("/")[2] ?? "";
  if (isPlausibleLeoYearSlug(year, new Date())) return NextResponse.next();

  // Unmatched internal path → the branded not-found page with status 404
  return NextResponse.rewrite(new URL("/__leadership-year-not-found", request.url));
}

export const config = {
  matcher: "/leadership/:year",
};
