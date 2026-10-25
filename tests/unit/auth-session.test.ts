import { describe, expect, it } from "vitest";
import {
  ABSOLUTE_MS,
  IDLE_MS,
  TOUCH_MS,
  cookieName,
  cookieOptions,
  hashToken,
  newToken,
  sessionStatus,
} from "@/lib/auth/session-rules";

const t0 = new Date("2026-10-25T10:00:00Z");
const at = (ms: number) => new Date(t0.getTime() + ms);
const session = { lastSeenAt: t0, expiresAt: at(ABSOLUTE_MS) };

describe("tokens", () => {
  it("are 32 random bytes", () => {
    const token = newToken();
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(newToken()).not.toBe(token);
  });
  it("are stored as a SHA-256 hex hash", () => {
    const token = newToken();
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toContain(token);
  });
});

describe("sessionStatus", () => {
  it("is valid right after sign-in and touches lastSeen only after 5 minutes", () => {
    expect(sessionStatus(session, t0)).toBe("valid");
    expect(sessionStatus(session, at(TOUCH_MS - 1))).toBe("valid");
    expect(sessionStatus(session, at(TOUCH_MS))).toBe("touch");
  });

  it("expires after 2 h idle", () => {
    expect(sessionStatus(session, at(IDLE_MS - 1))).toBe("touch");
    expect(sessionStatus(session, at(IDLE_MS))).toBe("expired");
  });

  it("expires 12 h after sign-in even when active", () => {
    const active = { lastSeenAt: at(ABSOLUTE_MS - 60_000), expiresAt: at(ABSOLUTE_MS) };
    expect(sessionStatus(active, at(ABSOLUTE_MS - 1))).toBe("valid");
    expect(sessionStatus(active, at(ABSOLUTE_MS))).toBe("expired");
  });
});

describe("cookie", () => {
  it("uses __Host- with Secure in production, a plain name in dev", () => {
    expect(cookieName(true)).toBe("__Host-leo_session");
    expect(cookieName(false)).toBe("leo_session");
    expect(cookieOptions(true)).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });
    expect(cookieOptions(false).secure).toBe(false);
  });
});
