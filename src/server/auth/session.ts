import "server-only";
import type { Role } from "@prisma/client";
import { cookies } from "next/headers";
import {
  ABSOLUTE_MS,
  cookieName,
  cookieOptions,
  hashToken,
  newToken,
  sessionStatus,
} from "@/lib/auth/session-rules";
import { db } from "@/server/db";

// Database sessions (docs/07). The cookie holds a random token; the Session row holds only its hash.
// Setting or deleting the cookie works only in server actions and route handlers.

export type SessionUser = { id: string; username: string; displayName: string; role: Role };

const isProd = process.env.NODE_ENV === "production";
const COOKIE = cookieName(isProd);

/** New session with a fresh token (sign-in, password change). */
export async function createSession(userId: string) {
  const token = newToken();
  const now = new Date();
  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      lastSeenAt: now,
      expiresAt: new Date(now.getTime() + ABSOLUTE_MS),
    },
  });
  (await cookies()).set(COOKIE, token, cookieOptions(isProd));
}

/** The signed-in session and user, or null (no cookie, unknown, expired, or inactive user). */
export async function getSession(): Promise<{ sessionId: string; user: SessionUser } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      lastSeenAt: true,
      expiresAt: true,
      user: { select: { id: true, username: true, displayName: true, role: true, active: true } },
    },
  });
  if (!row) return null;

  const now = new Date();
  const status = sessionStatus(row, now);
  if (status === "expired" || !row.user.active) {
    await db.session.deleteMany({ where: { id: row.id } });
    return null;
  }
  if (status === "touch") {
    await db.session.update({ where: { id: row.id }, data: { lastSeenAt: now } });
  }
  const { id, username, displayName, role } = row.user;
  return { sessionId: row.id, user: { id, username, displayName, role } };
}

export async function getSessionUser() {
  return (await getSession())?.user ?? null;
}

/** Sign out: delete the row and the cookie. */
export async function deleteCurrentSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete({ name: COOKIE, path: "/", secure: isProd, httpOnly: true, sameSite: "lax" });
}

/** End a user's sessions (deactivation, password change), optionally keeping one. */
export async function endUserSessions(userId: string, exceptSessionId?: string) {
  await db.session.deleteMany({
    where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
  });
}
