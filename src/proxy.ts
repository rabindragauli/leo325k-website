import { NextResponse, type NextRequest } from "next/server";
import { GATE_HEADER, INTERNAL_ADMIN, adminEnv, gateValue } from "@/lib/auth/admin-gate";
import { isPlausibleLeoYearSlug } from "@/lib/people";

// Runs before rendering, without the database. It is NOT the security boundary: every admin page and
// server action checks the gate and the session itself (src/server/auth/guards.ts).
//
// 1. Any incoming x-leo-admin-gate header is deleted, so only the rewrite below can set it.
// 2. /admin and the internal admin route → branded 404 (the slug is the only way in).
// 3. /<ADMIN_SLUG>/… → internal admin route, with the gate header and admin response headers.
// 4. /leadership/<year>: a malformed or implausible year (not "2025-26" style, or outside 2015 …
//    current year + 2) gets the branded 404 straight away, so junk URLs never render or fill the ISR
//    cache with stored 404s. Plausible years are handled by the page from the cached query.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const parts = pathname.split("/");
  const first = decodeSegment(parts[1] ?? "");

  const headers = new Headers(request.headers);
  headers.delete(GATE_HEADER);

  if (first === "admin" || first === INTERNAL_ADMIN.slice(1)) return notFound(request);

  const env = adminEnv();
  if (env && first === env.slug) {
    headers.set(GATE_HEADER, gateValue(env.secret));
    const url = request.nextUrl.clone();
    url.pathname = INTERNAL_ADMIN + pathname.slice(1 + parts[1].length);
    const response = NextResponse.rewrite(url, { request: { headers } });
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }

  if (first === "leadership" && parts.length === 3 && !isPlausibleLeoYearSlug(parts[2], new Date())) {
    return notFound(request);
  }

  return NextResponse.next({ request: { headers } });
}

// Unmatched internal path → the branded not-found page with status 404
function notFound(request: NextRequest) {
  return NextResponse.rewrite(new URL("/__not-found", request.url));
}

// "/%61dmin" must not slip past the checks above (the guards would still 404 it).
function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment).toLowerCase();
  } catch {
    return segment;
  }
}

export const config = {
  // Everything except build assets and files with an extension (the slug is only known at runtime).
  matcher: "/((?!_next/static|_next/image|.*\\.[A-Za-z0-9]+$).*)",
};
