import { describe, expect, it } from "vitest";
import {
  USERNAME_RE,
  checkNewPassword,
  hashPassword,
  normalizeUsername,
  verifyPassword,
} from "@/lib/auth/password.mjs";

const ok = (password: string, username = "user1") => checkNewPassword(password, { username });

describe("usernames", () => {
  it("are trimmed and lowercased", () => {
    expect(normalizeUsername("  User1 ")).toBe("user1");
  });
  it("match [a-z0-9._-]{3,32}", () => {
    expect(USERNAME_RE.test("user1")).toBe(true);
    expect(USERNAME_RE.test("a.b_c-d")).toBe(true);
    expect(USERNAME_RE.test("ab")).toBe(false);
    expect(USERNAME_RE.test("a".repeat(33))).toBe(false);
    expect(USERNAME_RE.test("user one")).toBe(false);
    expect(USERNAME_RE.test("User1")).toBe(false);
  });
});

describe("checkNewPassword", () => {
  it("needs at least 12 characters", async () => {
    expect(await ok("Tr0ub4dor&3x")).toEqual([]);
    expect(await ok("Tr0ub4dor&3")).toEqual(["Use at least 12 characters."]);
  });

  it("counts characters, not bytes, for the minimum", async () => {
    expect(await ok("काठमाडौं-उपत्यका")).toEqual([]); // 16 characters, 3 bytes each for most
  });

  it("allows at most 72 UTF-8 bytes (24 Devanagari letters = 72 bytes)", async () => {
    expect(await ok("क".repeat(24))).toEqual([]);
    const tooLong = await ok("क".repeat(25));
    expect(tooLong).toHaveLength(1);
    expect(tooLong[0]).toMatch(/at most 72 bytes/);
    expect(await ok("a".repeat(73))).toHaveLength(1);
  });

  it("refuses common passwords, in any case", async () => {
    expect(await ok("Password1234")).toEqual(["This password is too common."]);
    expect(await ok("QWERTY123456")).toEqual(["This password is too common."]);
  });

  it("refuses the username and the district words, in any case", async () => {
    expect(await ok("my-USER1-is-great", "user1")).toEqual(["Do not include your username."]);
    for (const word of ["Leo", "LIONS", "325K", "LeoDistrict"]) {
      expect(await ok(`quiet ${word} harbour`)).toEqual([
        "Do not include “leo”, “lions”, “325k” or “leodistrict”.",
      ]);
    }
  });

  it("must differ from the current password", async () => {
    const currentHash = await hashPassword("quiet amber harbour");
    expect(await checkNewPassword("quiet amber harbour", { username: "user1", currentHash })).toEqual([
      "Choose a password different from your current one.",
    ]);
    expect(await checkNewPassword("another amber harbour", { username: "user1", currentHash })).toEqual([]);
  });
});

describe("hashPassword / verifyPassword", () => {
  it("round-trips with bcrypt cost 12", async () => {
    const hash = await hashPassword("quiet amber harbour");
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
    expect(await verifyPassword("quiet amber harbour", hash)).toBe(true);
    expect(await verifyPassword("quiet amber harbouR", hash)).toBe(false);
  });

  it("never matches without a hash (unknown user)", async () => {
    expect(await verifyPassword("anything at all", null)).toBe(false);
    expect(await verifyPassword("anything at all", undefined)).toBe(false);
  });

  it("never matches over 72 bytes (bcrypt would ignore the extra bytes)", async () => {
    const base = "a".repeat(72);
    const hash = await hashPassword(base);
    expect(await verifyPassword(base, hash)).toBe(true);
    expect(await verifyPassword(`${base}extra`, hash)).toBe(false);
  });
});
