import { createHmac, timingSafeEqual } from "node:crypto";

// Admin path settings shared by src/proxy.ts and the server guards. Server code only: ADMIN_SLUG and
// AUTH_SECRET are read from the runtime environment and never sent to the browser.
//
// The proxy rewrites /<ADMIN_SLUG>/… to the internal admin route and sets GATE_HEADER to
// HMAC(AUTH_SECRET, "admin-gate") on that rewrite only (any incoming copy is deleted first). The guards
// compare it, so a request that reaches the internal route any other way gets a 404.
export const GATE_HEADER = "x-leo-admin-gate";
export const INTERNAL_ADMIN = "/admin-internal";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{7,63}$/;
// Top-level public segments the slug must never shadow.
const RESERVED = new Set([
  "about",
  "admin",
  "admin-internal",
  "api",
  "clubs",
  "contact",
  "leadership",
  "media",
  "privacy",
  "resources",
  "style-guide",
]);

export type AdminEnv = { slug: string; secret: string };

let warned = false;

/** Valid ADMIN_SLUG + AUTH_SECRET, or null (admin disabled: everything under it is a 404). */
export function adminEnv(env: Record<string, string | undefined> = process.env): AdminEnv | null {
  const slug = env.ADMIN_SLUG ?? "";
  const secret = env.AUTH_SECRET ?? "";
  const slugOk = SLUG_RE.test(slug) && !RESERVED.has(slug);
  const secretOk = secret.length >= 32;
  if (slugOk && secretOk) return { slug, secret };
  if (!warned) {
    warned = true;
    // Names only, never values
    if (!slugOk) console.error("Admin disabled: ADMIN_SLUG missing or invalid.");
    if (!secretOk) console.error("Admin disabled: AUTH_SECRET missing or shorter than 32 characters.");
  }
  return null;
}

export function gateValue(secret: string) {
  return createHmac("sha256", secret).update("admin-gate").digest("hex");
}

/** Constant-time check of the gate header value. */
export function isValidGate(value: string | null, secret: string) {
  const expected = Buffer.from(gateValue(secret));
  const given = Buffer.from(value ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
