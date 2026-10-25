import { createHmac } from "node:crypto";

// Login throttle rules (docs/07). Pure: the database part is src/server/auth/login.ts.
//
// - Per username ("u:"): failures only add a growing delay (nextAllowedAt), never a lock, so nobody
//   can lock out a real admin. An attempt before nextAllowedAt is refused at once (no sleeping).
// - Per IP ("ip:") and per username+IP ("uip:"): 5 failures → locked for 15 minutes.
// - A counter starts again after 15 minutes without a failure.
// - Unknown usernames get the same keys and rules as real ones.
// - Unknown IP (null): only the username rule applies, so nobody can fill a shared "unknown" bucket.
export const WINDOW_MS = 15 * 60 * 1000;
export const LOCK_AFTER = 5;
export const LOCK_MS = 15 * 60 * 1000;
export const FREE_FAILURES = 3; // username failures before any delay
export const MAX_DELAY_MS = 30 * 1000;

export type ThrottleRow = {
  failures: number;
  lastFailureAt: Date;
  nextAllowedAt: Date | null;
  lockedUntil: Date | null;
};

export type ThrottleKeys = { user: string; ip: string | null; userIp: string | null };

const hmac = (secret: string, value: string) => createHmac("sha256", secret).update(value).digest("hex");

/** Row keys: HMACs, so plain usernames and IPs are never stored. */
export function throttleKeys(username: string, ip: string | null, secret: string): ThrottleKeys {
  return {
    user: `u:${hmac(secret, `u|${username}`)}`,
    ip: ip ? `ip:${hmac(secret, `ip|${ip}`)}` : null,
    userIp: ip ? `uip:${hmac(secret, `uip|${username}|${ip}`)}` : null,
  };
}

/** 0 for the first 3 failures, then 1 s, 2 s, 4 s … capped at 30 s. */
export function backoffMs(failures: number) {
  if (failures <= FREE_FAILURES) return 0;
  return Math.min(1000 * 2 ** (failures - FREE_FAILURES - 1), MAX_DELAY_MS);
}

const after = (date: Date | null | undefined, now: Date) => !!date && date.getTime() > now.getTime();

export function isBlocked(
  rows: { user?: ThrottleRow | null; ip?: ThrottleRow | null; userIp?: ThrottleRow | null },
  now: Date,
) {
  return (
    after(rows.user?.nextAllowedAt, now) ||
    after(rows.ip?.lockedUntil, now) ||
    after(rows.userIp?.lockedUntil, now)
  );
}

/** The row after one more failure. `kind` = "user" (backoff) or "lock" (IP and username+IP). */
export function afterFailure(row: ThrottleRow | null, kind: "user" | "lock", now: Date): ThrottleRow {
  const recent = row && now.getTime() - row.lastFailureAt.getTime() < WINDOW_MS;
  const failures = recent ? row.failures + 1 : 1;
  const at = (ms: number) => new Date(now.getTime() + ms);
  if (kind === "user") {
    const delay = backoffMs(failures);
    return { failures, lastFailureAt: now, nextAllowedAt: delay ? at(delay) : null, lockedUntil: null };
  }
  return {
    failures,
    lastFailureAt: now,
    nextAllowedAt: null,
    lockedUntil: failures >= LOCK_AFTER ? at(LOCK_MS) : null,
  };
}
