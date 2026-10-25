import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GATE_HEADER, adminEnv, gateValue, isValidGate } from "@/lib/auth/admin-gate";

// The server guards on their own (no proxy, no database): next/headers, next/navigation and the
// session module are replaced, so these tests show what the guards do when a request reaches the
// internal admin route or an admin server action directly (CVE-2025-29927 lesson, docs/07).

const SLUG = "test-admin-slug";
const SECRET = "s".repeat(40);

const request = vi.hoisted(() => ({ headers: new Headers() }));
const session = vi.hoisted(() => ({ value: null as unknown }));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => request.headers }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));
vi.mock("@/server/auth/session", () => ({ getSession: async () => session.value }));

const { assertAdminGate, requireAdmin, requireUser } = await import("@/server/auth/guards");

const signedIn = (role: "ADMIN" | "EDITOR") => ({
  sessionId: "s1",
  user: { id: "u1", username: "user1", displayName: "User One", role },
});

beforeEach(() => {
  vi.stubEnv("ADMIN_SLUG", SLUG);
  vi.stubEnv("AUTH_SECRET", SECRET);
  request.headers = new Headers({ [GATE_HEADER]: gateValue(SECRET) });
  session.value = null;
});
afterEach(() => vi.unstubAllEnvs());

describe("adminEnv", () => {
  it("accepts a valid slug and secret", () => {
    expect(adminEnv({ ADMIN_SLUG: SLUG, AUTH_SECRET: SECRET })).toEqual({ slug: SLUG, secret: SECRET });
  });
  it("disables admin for a missing, short, malformed or reserved slug, or a short secret", () => {
    const silence = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const ADMIN_SLUG of [undefined, "", "short", "Has-Upper-Case", "with space x", "admin-internal", "leadership"]) {
      expect(adminEnv({ ADMIN_SLUG, AUTH_SECRET: SECRET })).toBeNull();
    }
    expect(adminEnv({ ADMIN_SLUG: SLUG, AUTH_SECRET: "too-short" })).toBeNull();
    silence.mockRestore();
  });
  it("logs variable names only, never values", async () => {
    // adminEnv warns once per process, so use a fresh copy of the module
    vi.resetModules();
    const fresh = await import("@/lib/auth/admin-gate");
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    fresh.adminEnv({ ADMIN_SLUG: "Bad Slug Value", AUTH_SECRET: "short-secret-value" });
    const messages = logged.mock.calls.map(([message]) => String(message));
    expect(messages).toEqual([
      "Admin disabled: ADMIN_SLUG missing or invalid.",
      "Admin disabled: AUTH_SECRET missing or shorter than 32 characters.",
    ]);
    logged.mockRestore();
  });
});

describe("isValidGate", () => {
  it("accepts only HMAC(AUTH_SECRET, 'admin-gate')", () => {
    expect(isValidGate(gateValue(SECRET), SECRET)).toBe(true);
    expect(isValidGate(gateValue("another secret, 40 characters long......"), SECRET)).toBe(false);
    expect(isValidGate(SLUG, SECRET)).toBe(false);
    expect(isValidGate("forged", SECRET)).toBe(false);
    expect(isValidGate(null, SECRET)).toBe(false);
  });
});

describe("assertAdminGate", () => {
  it("passes with the gate header set by the slug rewrite", async () => {
    await expect(assertAdminGate()).resolves.toEqual({ base: `/${SLUG}`, secret: SECRET });
  });

  it("is a 404 without the gate header (request skipped the proxy)", async () => {
    request.headers = new Headers();
    await expect(assertAdminGate()).rejects.toThrow("NOT_FOUND");
  });

  it("is a 404 with a forged gate header, including the slug itself", async () => {
    for (const forged of ["1", "forged", SLUG, gateValue("x".repeat(40))]) {
      request.headers = new Headers({ [GATE_HEADER]: forged });
      await expect(assertAdminGate()).rejects.toThrow("NOT_FOUND");
    }
  });

  it("is a 404 when admin is disabled (no slug or secret)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("ADMIN_SLUG", "");
    await expect(assertAdminGate()).rejects.toThrow("NOT_FOUND");
  });
});

describe("requireUser / requireAdmin", () => {
  it("404s before any auth redirect when the gate is missing (no slug in a Location header)", async () => {
    request.headers = new Headers();
    await expect(requireUser()).rejects.toThrow("NOT_FOUND");
    await expect(requireAdmin()).rejects.toThrow("NOT_FOUND");
  });

  it("redirects to the sign-in page at /<slug> without a session", async () => {
    await expect(requireUser()).rejects.toThrow(`REDIRECT /${SLUG}`);
  });

  it("returns the user and session for any role", async () => {
    session.value = signedIn("EDITOR");
    await expect(requireUser()).resolves.toMatchObject({ base: `/${SLUG}`, sessionId: "s1", user: { role: "EDITOR" } });
  });

  it("keeps Editors out of Admin-only actions (404)", async () => {
    session.value = signedIn("EDITOR");
    await expect(requireAdmin()).rejects.toThrow("NOT_FOUND");
    session.value = signedIn("ADMIN");
    await expect(requireAdmin()).resolves.toMatchObject({ user: { role: "ADMIN" } });
  });
});
