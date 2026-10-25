import { createHash, randomBytes } from "node:crypto";

// Session timing and cookie rules (docs/07). Pure: no database, no Next.js APIs.
export const IDLE_MS = 2 * 60 * 60 * 1000; // 2 h without activity
export const ABSOLUTE_MS = 12 * 60 * 60 * 1000; // 12 h after sign-in, whatever happens
export const TOUCH_MS = 5 * 60 * 1000; // write lastSeenAt at most this often

/** Random 32-byte session token for the cookie (only its hash is stored). */
export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionTimes = { lastSeenAt: Date; expiresAt: Date };

/** `touch` = valid, and lastSeenAt is old enough to be written again. */
export function sessionStatus({ lastSeenAt, expiresAt }: SessionTimes, now: Date) {
  const t = now.getTime();
  if (t >= expiresAt.getTime() || t - lastSeenAt.getTime() >= IDLE_MS) return "expired";
  if (t - lastSeenAt.getTime() >= TOUCH_MS) return "touch";
  return "valid";
}

// `__Host-` makes the browser insist on Secure, Path=/ and no Domain; it needs HTTPS, so local
// dev over http uses a plain name.
export function cookieName(isProd: boolean) {
  return isProd ? "__Host-leo_session" : "leo_session";
}

export function cookieOptions(isProd: boolean) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ABSOLUTE_MS / 1000,
  };
}
