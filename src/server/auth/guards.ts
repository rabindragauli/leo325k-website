import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { GATE_HEADER, adminEnv, isValidGate } from "@/lib/auth/admin-gate";
import { hasRole } from "@/lib/auth/roles";
import { getSession } from "./session";

// The admin security boundary (docs/07). Every admin page, layout, route handler and server action
// calls one of these first. proxy.ts is not trusted: server actions can be POSTed to any URL.

/**
 * 404 unless the request came through the /<ADMIN_SLUG> rewrite (valid gate header). Runs before any
 * auth check, so a request that skipped the proxy never gets a redirect that would reveal the slug.
 * Returns `base` ("/<slug>") for links and redirects, only ever used after this check passed.
 */
export async function assertAdminGate() {
  const env = adminEnv();
  if (!env || !isValidGate((await headers()).get(GATE_HEADER), env.secret)) notFound();
  return { base: `/${env.slug}`, secret: env.secret };
}

/** Signed-in user (any role). No session → the sign-in page at /<slug>. */
export async function requireUser() {
  const gate = await assertAdminGate();
  const session = await getSession();
  if (!session) redirect(gate.base);
  return { ...gate, ...session };
}

/** Signed-in Admin. Editors get a 404 (the screen does not exist for them). */
export async function requireAdmin() {
  const context = await requireUser();
  if (!hasRole(context.user, "ADMIN")) notFound();
  return context;
}
