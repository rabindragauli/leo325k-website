import type { Prisma } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { loadClubs, loadLeadership, loadResources } from "@/server/queries/loaders";

// Privacy and visibility filtering of the public loaders against the real (seeded) database.
// Every test runs inside a transaction that is rolled back, so the data is left as seeded.
// Run with `npm run test:db` (local only; CI has no database).

const ROLLBACK = new Error("rollback");

async function rolledBack(fn: (tx: Prisma.TransactionClient) => Promise<void>) {
  try {
    await db.$transaction(async (tx) => {
      await fn(tx);
      throw ROLLBACK;
    });
  } catch (error) {
    if (error !== ROLLBACK) throw error;
  }
}

const ASHISH = "p-ashish-lamichhane"; // 2025–26 Vice District President (seed)
const PRIVATE = { phone: "9800000001", email: "private@example.org", membershipId: "M-TEST-325K" };

async function ashish(tx: Prisma.TransactionClient) {
  const source = await loadLeadership(tx);
  return { source, person: source.people.find((p) => p.id === ASHISH)! };
}

afterAll(() => db.$disconnect());

describe("loadLeadership: officer contact details", () => {
  it("never returns membershipId or the public toggles", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({ where: { id: ASHISH }, data: { ...PRIVATE, phonePublic: true, emailPublic: true, consentAt: new Date() } });
      const { source, person } = await ashish(tx);
      expect(Object.keys(person).sort()).toEqual(
        ["email", "fullName", "homeClubId", "homeLionsClub", "id", "phone", "photo", "prefix"],
      );
      expect(JSON.stringify(source)).not.toContain(PRIVATE.membershipId);
      expect(JSON.stringify(source)).not.toContain("membershipId");
    });
  });

  it("keeps phone/email private while the toggles are off", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({ where: { id: ASHISH }, data: { ...PRIVATE, consentAt: new Date() } });
      const { source, person } = await ashish(tx);
      expect(person).toMatchObject({ phone: null, email: null });
      expect(JSON.stringify(source)).not.toContain(PRIVATE.phone);
      expect(JSON.stringify(source)).not.toContain(PRIVATE.email);
    });
  });

  it("keeps phone/email private with the toggles on but no consent date", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({ where: { id: ASHISH }, data: { ...PRIVATE, phonePublic: true, emailPublic: true, consentAt: null } });
      const { source, person } = await ashish(tx);
      expect(person).toMatchObject({ phone: null, email: null });
      expect(JSON.stringify(source)).not.toContain(PRIVATE.phone);
    });
  });

  it("shows each value only when its own toggle is on and consent is recorded", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({ where: { id: ASHISH }, data: { ...PRIVATE, phonePublic: true, emailPublic: false, consentAt: new Date() } });
      const { person } = await ashish(tx);
      expect(person).toMatchObject({ phone: PRIVATE.phone, email: null });
    });
  });

  it("returns dates as strings (serialisable for client components)", async () => {
    const source = await loadLeadership(db);
    expect(source.leoYears.every((y) => typeof y.startsOn === "string")).toBe(true);
    expect(JSON.stringify(source)).not.toMatch(/T\d{2}:\d{2}:\d{2}/);
  });
});

describe("visibility filtering", () => {
  it("leaves out unpublished, non-current Leo Years and their teams", async () => {
    await rolledBack(async (tx) => {
      await tx.leoYear.update({ where: { id: "ly-2025-26" }, data: { published: false } });
      const source = await loadLeadership(tx);
      expect(source.leoYears.map((y) => y.id)).toEqual(["ly-2026-27"]);
      expect(source.positions).toEqual([]);
    });
  });

  it("leaves out hidden clubs", async () => {
    await rolledBack(async (tx) => {
      await tx.club.update({ where: { id: "club-baglung-kaligandaki" }, data: { visible: false } });
      const { clubs } = await loadClubs(tx);
      expect(clubs.map((c) => c.id)).not.toContain("club-baglung-kaligandaki");
      expect(clubs).toHaveLength(3);
    });
  });

  it("returns only published resources (the 2 seeded links)", async () => {
    const { resources } = await loadResources(db);
    expect(resources.map((r) => r.kind)).toEqual(["LINK", "LINK"]);
  });

  it("leaves the seeded data unchanged (every test rolled back)", async () => {
    const person = await db.person.findUniqueOrThrow({ where: { id: ASHISH } });
    expect(person).toMatchObject({ phone: null, email: null, membershipId: null, phonePublic: false, emailPublic: false, consentAt: null });
    expect(await db.club.count({ where: { visible: true } })).toBe(4);
  });
});
