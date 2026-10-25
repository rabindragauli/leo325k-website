import { randomBytes } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/lib/auth/password.mjs";
import { IDLE_MS, TOUCH_MS, hashToken } from "@/lib/auth/session-rules";
import { throttleKeys } from "@/lib/auth/throttle";
import { db } from "@/server/db";

// Sessions and the login throttle against the real local database (`npm run test:db`).
// The cookie jar is in memory. Throwaway users, random test IPs (TEST-NET) and a test secret are
// used, and everything created here is deleted in afterAll.

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (options: string | { name: string }) => void jar.delete(typeof options === "string" ? options : options.name),
  }),
}));

const { createSession, endUserSessions, getSession } = await import("@/server/auth/session");
const { LOGIN_ERROR, attemptLogin } = await import("@/server/auth/login");

const SECRET = randomBytes(32).toString("hex");
const PASSWORD = "quiet amber harbour";
const started = new Date();
const userIds: string[] = [];
const throttleKeysUsed: string[] = [];

const testIp = () => `203.0.113.${1 + Math.floor(Math.random() * 254)}`;

async function makeUser(role: "ADMIN" | "EDITOR" = "ADMIN") {
  const username = `dbtest_${randomBytes(4).toString("hex")}`;
  const user = await db.user.create({
    data: { username, displayName: "DB Test", role, passwordHash: await hashPassword(PASSWORD) },
  });
  userIds.push(user.id);
  return user;
}

function keysFor(username: string, ip: string | null) {
  const keys = throttleKeys(username, ip, SECRET);
  throttleKeysUsed.push(...Object.values(keys).filter((k): k is string => !!k));
  return keys;
}

const token = () => [...jar.values()][0];
const row = (key: string | null) => db.loginThrottle.findUnique({ where: { key: key ?? "" } });

beforeEach(() => jar.clear());

afterAll(async () => {
  await db.loginThrottle.deleteMany({ where: { key: { in: throttleKeysUsed } } });
  await db.activityLog.deleteMany({
    where: {
      createdAt: { gte: started },
      action: { startsWith: "auth." },
      OR: [{ userId: { in: userIds } }, { userId: null }],
    },
  });
  await db.user.deleteMany({ where: { id: { in: userIds } } }); // sessions cascade
  await db.$disconnect();
});

describe("sessions", () => {
  it("store only the SHA-256 hash of the cookie token", async () => {
    const user = await makeUser();
    await createSession(user.id);
    const sessions = await db.session.findMany({ where: { userId: user.id } });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].tokenHash).toBe(hashToken(token()));
    expect(sessions[0].tokenHash).not.toContain(token());
    expect((await getSession())?.user).toEqual({
      id: user.id,
      username: user.username,
      displayName: "DB Test",
      role: "ADMIN",
    });
  });

  it("write lastSeenAt at most every 5 minutes", async () => {
    const user = await makeUser();
    await createSession(user.id);
    const recent = new Date(Date.now() - TOUCH_MS + 60_000);
    await db.session.updateMany({ where: { userId: user.id }, data: { lastSeenAt: recent } });
    await getSession();
    expect((await db.session.findFirst({ where: { userId: user.id } }))?.lastSeenAt).toEqual(recent);

    const old = new Date(Date.now() - TOUCH_MS - 1000);
    await db.session.updateMany({ where: { userId: user.id }, data: { lastSeenAt: old } });
    await getSession();
    const seen = (await db.session.findFirst({ where: { userId: user.id } }))!.lastSeenAt;
    expect(seen.getTime()).toBeGreaterThan(Date.now() - 10_000);
  });

  it("end after 2 h idle and 12 h absolute, deleting the row", async () => {
    const user = await makeUser();
    await createSession(user.id);
    await db.session.updateMany({ where: { userId: user.id }, data: { lastSeenAt: new Date(Date.now() - IDLE_MS - 1000) } });
    expect(await getSession()).toBeNull();
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);

    jar.clear();
    await createSession(user.id);
    await db.session.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await getSession()).toBeNull();
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  });

  it("are refused for unknown tokens and inactive users; deactivation ends all sessions", async () => {
    jar.set("leo_session", "not-a-real-token");
    expect(await getSession()).toBeNull();

    const user = await makeUser();
    await createSession(user.id);
    await createSession(user.id);
    await db.user.update({ where: { id: user.id }, data: { active: false } });
    expect(await getSession()).toBeNull();

    await endUserSessions(user.id);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  });
});

describe("attemptLogin and the throttle", () => {
  it("signs in with the right password and logs it", async () => {
    const user = await makeUser();
    const ip = testIp();
    keysFor(user.username, ip);
    expect(await attemptLogin(user.username, PASSWORD, ip, SECRET)).toEqual({ ok: true });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
    expect((await db.user.findUnique({ where: { id: user.id } }))?.lastLoginAt).not.toBeNull();
    const actions = (await db.activityLog.findMany({ where: { userId: user.id } })).map((l) => l.action);
    expect(actions).toEqual(["auth.login"]);
  });

  it("gives one generic error for wrong passwords, unknown and inactive users", async () => {
    const ip = testIp();
    const user = await makeUser();
    const inactive = await makeUser();
    await db.user.update({ where: { id: inactive.id }, data: { active: false } });
    for (const [name, password] of [
      [user.username, "wrong password here"],
      [`nobody_${randomBytes(3).toString("hex")}`, PASSWORD],
      [inactive.username, PASSWORD],
    ]) {
      keysFor(name, ip);
      expect(await attemptLogin(name, password, ip, SECRET)).toEqual({ ok: false, error: LOGIN_ERROR });
    }
    expect(LOGIN_ERROR).toBe("Username or password is incorrect");
    expect(await db.session.count({ where: { userId: inactive.id } })).toBe(0);
  });

  it("throttles unknown usernames exactly like real ones", async () => {
    const ip = testIp();
    const name = `nobody_${randomBytes(3).toString("hex")}`;
    const keys = keysFor(name, ip);
    await attemptLogin(name, "wrong password here", ip, SECRET);
    expect((await row(keys.user))?.failures).toBe(1);
    expect((await row(keys.ip))?.failures).toBe(1);
    expect((await row(keys.userIp))?.failures).toBe(1);
  });

  it("backs off per username (nextAllowedAt), refusing early attempts without counting them", async () => {
    const user = await makeUser();
    const keys = keysFor(user.username, null); // unknown IP: username rule only
    for (let i = 0; i < 4; i++) await attemptLogin(user.username, "wrong password here", null, SECRET);
    const backoff = await row(keys.user);
    expect(backoff?.failures).toBe(4);
    expect(backoff?.nextAllowedAt).not.toBeNull();
    expect(backoff?.lockedUntil).toBeNull();

    const before = Date.now();
    expect(await attemptLogin(user.username, PASSWORD, null, SECRET)).toEqual({ ok: false, error: LOGIN_ERROR });
    expect(Date.now() - before).toBeLessThan(1000 + 2000); // no server-side sleep beyond one bcrypt
    expect((await row(keys.user))?.failures).toBe(4);
  });

  it("locks IP and username+IP for 15 minutes after 5 failures, even for the right password", async () => {
    const user = await makeUser();
    const ip = testIp();
    const keys = keysFor(user.username, ip);
    for (let i = 0; i < 5; i++) {
      await db.loginThrottle.updateMany({ where: { key: keys.user }, data: { nextAllowedAt: null } }); // skip backoff
      await attemptLogin(user.username, "wrong password here", ip, SECRET);
    }
    const locked = await row(keys.userIp);
    expect(locked?.failures).toBe(5);
    expect(locked?.lockedUntil?.getTime()).toBeGreaterThan(Date.now() + 14 * 60_000);
    expect((await row(keys.ip))?.lockedUntil).not.toBeNull();
    expect((await row(keys.user))?.lockedUntil).toBeNull(); // username itself is never locked

    await db.loginThrottle.updateMany({ where: { key: keys.user }, data: { nextAllowedAt: null } });
    expect(await attemptLogin(user.username, PASSWORD, ip, SECRET)).toEqual({ ok: false, error: LOGIN_ERROR });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);

    const actions = (await db.activityLog.findMany({ where: { userId: user.id } })).map((l) => l.action);
    expect(actions.filter((a) => a === "auth.login_failed")).toHaveLength(5);
    expect(actions.filter((a) => a === "auth.lockout")).toHaveLength(2); // lock set + refused attempt

    // Another IP is not affected by that lock
    const otherIp = testIp();
    keysFor(user.username, otherIp);
    expect(await attemptLogin(user.username, PASSWORD, otherIp, SECRET)).toEqual({ ok: true });
    expect(await row(keys.user)).toBeNull(); // success clears the username backoff
  });

  it("cleans up expired sessions and old throttle rows on sign-in", async () => {
    const user = await makeUser();
    await createSession(user.id);
    await db.session.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });

    const stale = keysFor(`stale_${randomBytes(3).toString("hex")}`, null).user;
    await db.loginThrottle.create({ data: { key: stale, failures: 1, lastFailureAt: new Date() } });
    await db.$executeRaw`UPDATE LoginThrottle SET updatedAt = ${new Date(Date.now() - 25 * 3600_000)} WHERE \`key\` = ${stale}`;

    const name = `nobody_${randomBytes(3).toString("hex")}`;
    keysFor(name, null);
    await attemptLogin(name, "wrong password here", null, SECRET);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await row(stale)).toBeNull();
  });
});
