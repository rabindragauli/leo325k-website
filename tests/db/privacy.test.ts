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
const PRIVATE = {
  phone: "9800000001",
  landline: "01-4000001",
  email: "private@example.org",
  membershipId: "M-TEST-325K",
  bloodGroup: "AB-",
  address: "ADDRESS-TEST-325K",
};
const UNSET = {
  designationPublic: null,
  homeClubPublic: null,
  membershipPublic: null,
  phonePublic: null,
  landlinePublic: null,
  emailPublic: null,
  bloodGroupPublic: null,
};
const ALL_ON = {
  designationPublic: true,
  homeClubPublic: true,
  membershipPublic: true,
  phonePublic: true,
  landlinePublic: true,
  emailPublic: true,
  bloodGroupPublic: true,
};

async function ashish(tx: Prisma.TransactionClient) {
  const source = await loadLeadership(tx);
  return {
    source,
    json: JSON.stringify(source),
    person: source.people.find((p) => p.id === ASHISH)!,
    position: source.positions.find((p) => p.personId === ASHISH)!,
  };
}

afterAll(() => db.$disconnect());

describe("loadLeadership: person visibility", () => {
  it("never returns address or the switches, even with every switch on", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({ where: { id: ASHISH }, data: { ...PRIVATE, ...ALL_ON } });
      const { json, person } = await ashish(tx);
      expect(Object.keys(person).sort()).toEqual(
        ["bloodGroup", "email", "fullName", "homeClubId", "id", "landline", "membershipNo", "phone", "photo", "title"],
      );
      expect(json).not.toContain(PRIVATE.address);
      expect(json).not.toMatch(/address|Public"/);
    });
  });

  it("returns only designation and home club by default", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({ where: { id: ASHISH }, data: { ...PRIVATE, ...UNSET } });
      const { json, person, position } = await ashish(tx);
      expect(person).toMatchObject({
        homeClubId: "club-pokhara-silver-mountains",
        membershipNo: null,
        phone: null,
        landline: null,
        email: null,
        bloodGroup: null,
      });
      expect(position.role).toBe("Vice District President");
      for (const value of Object.values(PRIVATE)) expect(json).not.toContain(value);
    });
  });

  it("returns each value only when its own switch is on", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({
        where: { id: ASHISH },
        data: { ...PRIVATE, ...UNSET, phonePublic: true, emailPublic: false, bloodGroupPublic: true },
      });
      const { json, person } = await ashish(tx);
      expect(person).toMatchObject({ phone: PRIVATE.phone, email: null, bloodGroup: "AB-", membershipNo: null });
      expect(json).not.toContain(PRIVATE.email);
      expect(json).not.toContain(PRIVATE.membershipId);
    });
  });

  it("does not read designation or home club when switched off", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({ where: { id: ASHISH }, data: { designationPublic: false, homeClubPublic: false } });
      const { json, person, position } = await ashish(tx);
      expect(person.homeClubId).toBeNull();
      expect(position.role).toBeNull();
      expect(json).not.toContain("Vice District President");
    });
  });

  it("never returns contact data, membership no. or blood group of under-18 members", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({ where: { id: ASHISH }, data: { ...PRIVATE, ...ALL_ON, under18: true } });
      const { json, person } = await ashish(tx);
      expect(person).toMatchObject({ phone: null, landline: null, email: null, membershipNo: null, bloodGroup: null });
      for (const value of Object.values(PRIVATE)) expect(json).not.toContain(value);
    });
  });

  it("returns a photo only with photo consent", async () => {
    await rolledBack(async (tx) => {
      await tx.person.update({ where: { id: ASHISH }, data: { photo: "photo-test-325k.webp" } });
      expect((await ashish(tx)).json).not.toContain("photo-test-325k");
      await tx.person.update({ where: { id: ASHISH }, data: { photoConsent: true } });
      expect((await ashish(tx)).person.photo).toBe("photo-test-325k.webp");
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

  it("never returns draft positions, nor published ones in an unpublished year", async () => {
    await rolledBack(async (tx) => {
      await tx.position.update({ where: { id: "pos-2025-26-district_leo-3" }, data: { status: "DRAFT" } });
      await tx.position.create({
        data: {
          id: "pos-test-unpublished-year",
          personId: ASHISH,
          leoYearId: "ly-2026-27",
          group: "DISTRICT_BOARD",
          role: "Draft-year role TEST",
          status: "PUBLISHED",
        },
      });
      const source = await loadLeadership(tx);
      const ids = source.positions.map((p) => p.id);
      expect(ids).not.toContain("pos-2025-26-district_leo-3");
      expect(ids).not.toContain("pos-test-unpublished-year");
      expect(ids).toHaveLength(8);
    });
  });

  it("leaves out clubs not listed in the directory, but still names them as home clubs", async () => {
    await rolledBack(async (tx) => {
      await tx.club.update({ where: { id: "club-baglung-kaligandaki" }, data: { listedInDirectory: false } });
      const { clubs } = await loadClubs(tx);
      expect(clubs.map((c) => c.id)).not.toContain("club-baglung-kaligandaki");
      expect(clubs.some((c) => c.id.startsWith("club-unlisted-"))).toBe(false);
      expect(clubs).toHaveLength(3);
      const leadership = await loadLeadership(tx);
      expect(leadership.clubs.map((c) => c.name)).toContain("LC Pokhara Peace Chautari");
    });
  });

  it("returns only published resources (the 2 seeded links)", async () => {
    const { resources } = await loadResources(db);
    expect(resources.map((r) => r.kind)).toEqual(["LINK", "LINK"]);
  });

  it("leaves the seeded data unchanged (every test rolled back)", async () => {
    const person = await db.person.findUniqueOrThrow({ where: { id: ASHISH } });
    expect(person).toMatchObject({
      phone: null,
      email: null,
      membershipId: null,
      address: null,
      under18: false,
      photoConsent: false,
      phonePublic: false,
      emailPublic: false,
      designationPublic: null,
    });
    expect(await db.club.count({ where: { listedInDirectory: true } })).toBe(4);
    expect(await db.position.count({ where: { status: "PUBLISHED" } })).toBe(9);
  });
});
