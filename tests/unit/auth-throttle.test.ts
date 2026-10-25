import { describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/auth/client-ip";
import {
  LOCK_MS,
  WINDOW_MS,
  afterFailure,
  backoffMs,
  isBlocked,
  throttleKeys,
  type ThrottleRow,
} from "@/lib/auth/throttle";

const t0 = new Date("2026-10-25T10:00:00Z");
const at = (ms: number) => new Date(t0.getTime() + ms);

/** Applies n failures, each `gap` ms apart. Returns the row and the time of the last failure. */
function fail(n: number, kind: "user" | "lock", gap = 0) {
  let row: ThrottleRow | null = null;
  let now = t0;
  for (let i = 0; i < n; i++) {
    now = at(i * gap);
    row = afterFailure(row, kind, now);
  }
  return { row: row!, now };
}

describe("throttleKeys", () => {
  it("are HMACs (no plain username or IP) and depend on the secret", () => {
    const keys = throttleKeys("user1", "203.0.113.7", "secret-a");
    expect(keys.user).toMatch(/^u:[0-9a-f]{64}$/);
    expect(keys.ip).toMatch(/^ip:[0-9a-f]{64}$/);
    expect(keys.userIp).toMatch(/^uip:[0-9a-f]{64}$/);
    expect(JSON.stringify(keys)).not.toMatch(/user1|203\.0\.113\.7/);
    expect(throttleKeys("user1", "203.0.113.7", "secret-b").user).not.toBe(keys.user);
  });

  it("treat unknown usernames exactly like real ones (same key shape)", () => {
    expect(throttleKeys("no-such-user", "203.0.113.7", "s").user).toMatch(/^u:[0-9a-f]{64}$/);
  });

  it("have no IP keys when the IP is unknown", () => {
    expect(throttleKeys("user1", null, "s")).toEqual({
      user: expect.stringMatching(/^u:/),
      ip: null,
      userIp: null,
    });
  });
});

describe("username backoff (never a lock)", () => {
  it("grows 0, 0, 0, 1 s, 2 s, 4 s … and is capped at 30 s", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 50].map(backoffMs)).toEqual([
      0, 0, 0, 1000, 2000, 4000, 8000, 16000, 30000, 30000,
    ]);
  });

  it("stores nextAllowedAt and refuses an earlier attempt at once, without waiting", () => {
    const { row, now } = fail(4, "user");
    expect(row.nextAllowedAt).toEqual(at(1000));
    expect(row.lockedUntil).toBeNull();
    expect(isBlocked({ user: row }, now)).toBe(true);
    expect(isBlocked({ user: row }, at(999))).toBe(true);
    expect(isBlocked({ user: row }, at(1000))).toBe(false);
  });

  it("never locks, however many failures", () => {
    const { row, now } = fail(100, "user");
    expect(row.lockedUntil).toBeNull();
    expect(isBlocked({ user: row }, new Date(now.getTime() + 30_000))).toBe(false);
  });

  it("starts again after 15 minutes without a failure", () => {
    const { row, now } = fail(8, "user");
    expect(afterFailure(row, "user", new Date(now.getTime() + WINDOW_MS)).failures).toBe(1);
  });
});

describe("IP and username+IP lock", () => {
  it("locks for 15 minutes after 5 failures", () => {
    const four = fail(4, "lock");
    expect(four.row.lockedUntil).toBeNull();
    expect(isBlocked({ ip: four.row }, four.now)).toBe(false);

    const five = fail(5, "lock");
    expect(five.row.lockedUntil).toEqual(new Date(five.now.getTime() + LOCK_MS));
    expect(isBlocked({ ip: five.row }, five.now)).toBe(true);
    expect(isBlocked({ userIp: five.row }, new Date(five.now.getTime() + LOCK_MS - 1))).toBe(true);
    expect(isBlocked({ userIp: five.row }, new Date(five.now.getTime() + LOCK_MS))).toBe(false);
  });

  it("does not count failures spread more than 15 minutes apart", () => {
    const { row } = fail(10, "lock", WINDOW_MS);
    expect(row.failures).toBe(1);
    expect(row.lockedUntil).toBeNull();
  });

  it("is not blocked when there are no rows", () => {
    expect(isBlocked({ user: null, ip: null, userIp: null }, t0)).toBe(false);
  });
});

describe("getClientIp", () => {
  const ip = (value?: string) => getClientIp(new Headers(value === undefined ? {} : { "x-forwarded-for": value }));

  it("trusts only the rightmost X-Forwarded-For entry (added by the server's proxy)", () => {
    expect(ip("198.51.100.9")).toBe("198.51.100.9");
    expect(ip("1.2.3.4, 198.51.100.9")).toBe("198.51.100.9");
    expect(ip("forged, 10.0.0.1 ,  203.0.113.7 ")).toBe("203.0.113.7");
  });

  it("accepts IPv6", () => {
    expect(ip("2001:db8::1")).toBe("2001:db8::1");
    expect(ip("::1")).toBe("::1");
  });

  it("returns null when missing or invalid", () => {
    expect(ip()).toBeNull();
    expect(ip("")).toBeNull();
    expect(ip("1.2.3.4, not-an-ip")).toBeNull();
    expect(ip("1.2.3.4,")).toBeNull();
    expect(ip("999.1.1.1")).toBeNull();
  });
});
