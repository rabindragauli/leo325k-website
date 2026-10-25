import "server-only";
import { verifyPassword } from "@/lib/auth/password.mjs";
import { IDLE_MS } from "@/lib/auth/session-rules";
import {
  afterFailure,
  isBlocked,
  throttleKeys,
  type ThrottleKeys,
  type ThrottleRow,
} from "@/lib/auth/throttle";
import { db } from "@/server/db";
import { createSession } from "./session";

// Sign-in with the DB-backed throttle (docs/07). Every outcome that is not a success returns the same
// message, and every path runs exactly one bcrypt compare, so responses do not reveal whether a
// username exists, is inactive or is locked.
export const LOGIN_ERROR = "Username or password is incorrect";

const DAY_MS = 24 * 60 * 60 * 1000;

type Result = { ok: true } | { ok: false; error: string };

export async function attemptLogin(
  username: string,
  password: string,
  ip: string | null,
  secret: string,
): Promise<Result> {
  const now = new Date();
  await cleanup(now);

  const keys = throttleKeys(username, ip, secret);
  const rows = await loadRows(keys);
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true, passwordHash: true, active: true },
  });

  if (isBlocked(rows, now)) {
    await verifyPassword(password, null); // same cost as a real attempt
    await log("auth.lockout", user?.id ?? null, "Sign-in refused: too many failed attempts");
    return { ok: false, error: LOGIN_ERROR };
  }

  const match = await verifyPassword(password, user?.passwordHash);
  if (!user || !user.active || !match) {
    const locked = await recordFailure(keys, rows, now);
    // The typed username is not logged for unknown accounts: people sometimes type a password there.
    await log(
      "auth.login_failed",
      user?.id ?? null,
      !user
        ? "Sign-in failed: unknown username"
        : user.active
          ? "Sign-in failed: wrong password"
          : "Sign-in failed: account inactive",
    );
    if (locked) await log("auth.lockout", user?.id ?? null, "Sign-in locked for 15 minutes");
    return { ok: false, error: LOGIN_ERROR };
  }

  await db.loginThrottle.deleteMany({
    where: { key: { in: [keys.user, keys.userIp].filter((k): k is string => !!k) } },
  });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: now } });
  await createSession(user.id);
  await log("auth.login", user.id, "Signed in");
  return { ok: true };
}

/** A wrong current password on "change my password" counts like a failed sign-in for user+IP. */
export async function recordPasswordCheckFailure(username: string, ip: string | null, secret: string) {
  const keys = throttleKeys(username, ip, secret);
  await recordFailure(keys, await loadRows(keys), new Date());
}

export async function isLoginBlocked(username: string, ip: string | null, secret: string) {
  return isBlocked(await loadRows(throttleKeys(username, ip, secret)), new Date());
}

const SELECT = { key: true, failures: true, lastFailureAt: true, nextAllowedAt: true, lockedUntil: true };

async function loadRows(keys: ThrottleKeys) {
  const list = await db.loginThrottle.findMany({
    where: { key: { in: Object.values(keys).filter((k): k is string => !!k) } },
    select: SELECT,
  });
  const find = (key: string | null) => list.find((row) => row.key === key) ?? null;
  return { user: find(keys.user), ip: find(keys.ip), userIp: find(keys.userIp) };
}

async function recordFailure(
  keys: ThrottleKeys,
  rows: Record<keyof ThrottleKeys, ThrottleRow | null>,
  now: Date,
) {
  let locked = false;
  const writes = (["user", "ip", "userIp"] as const).flatMap((name) => {
    const key = keys[name];
    if (!key) return [];
    const data = afterFailure(rows[name], name === "user" ? "user" : "lock", now);
    locked ||= data.lockedUntil !== null;
    return [db.loginThrottle.upsert({ where: { key }, create: { key, ...data }, update: data })];
  });
  await db.$transaction(writes);
  return locked; // true when this failure starts (or extends) an IP or username+IP lock
}

// Opportunistic housekeeping on every sign-in attempt (no cron needed for these tables).
async function cleanup(now: Date) {
  await db.session.deleteMany({
    where: {
      OR: [{ expiresAt: { lte: now } }, { lastSeenAt: { lte: new Date(now.getTime() - IDLE_MS) } }],
    },
  });
  await db.loginThrottle.deleteMany({
    where: {
      updatedAt: { lte: new Date(now.getTime() - DAY_MS) },
      OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
    },
  });
}

export async function log(action: string, userId: string | null, summary: string) {
  await db.activityLog.create({ data: { action, userId, entity: "User", entityId: userId, summary } });
}
