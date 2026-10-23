import { describe, expect, it } from "vitest";
import {
  getArchivedYearSlugs,
  getClubs,
  getLeadershipView,
  getPrideEntries,
  getResourceLibrary,
  staticSource,
  type DataSource,
} from "@/server/queries/public";

describe("getLeadershipView (seed data)", () => {
  it("defaults to the unpublished current year: coming soon + latest published team", async () => {
    const view = (await getLeadershipView())!;
    expect(view.selected.slug).toBe("2026-27");
    expect(view.comingSoon).toBe(true);
    expect(view.team?.year.slug).toBe("2025-26");
    expect(view.years.map((y) => y.slug)).toEqual(["2026-27", "2025-26"]);
  });

  it("shows an archived year when asked for it", async () => {
    const view = (await getLeadershipView("2025-26"))!;
    expect(view.comingSoon).toBe(false);
    expect(view.selected.slug).toBe("2025-26");
    expect(view.team?.leos.map((p) => p.role)).toEqual([
      "District President",
      "Vice District President",
      "District Secretary",
      "District Treasurer",
    ]);
    expect(view.team?.lions).toHaveLength(5);
  });

  it("falls back to the default view for unknown years", async () => {
    for (const year of ["1999-00", "", "<script>"]) {
      expect((await getLeadershipView(year))!.selected.slug).toBe("2026-27");
    }
  });

  it("builds the District President with message, awards and journey", async () => {
    const president = (await getLeadershipView("2025-26"))!.team!.president!;
    expect(president.name).toBe("Leo Prativa Shrestha");
    expect(president.initials).toBe("PS");
    expect(president.homeClub).toBe("Leo Club of Kathmandu Machhapokhari");
    expect(president.message).toMatch(/^Welcome to Leo District Council 325 K Nepal/);
    expect(president.awards).toHaveLength(8);
    expect(president.journey).toHaveLength(9);
  });

  it("leaves an unknown home club empty (placeholder) and Lions keep their LC", async () => {
    const lions = (await getLeadershipView("2025-26"))!.team!.lions;
    expect(lions[0]).toMatchObject({ name: "MJF Lion Durga Prasad Humagain", homeClub: "LC Pokhara Peace Chautari" });
    expect(lions[4]).toMatchObject({ role: "Cabinet Treasurer", homeClub: null });
  });

  it("never exposes private fields", async () => {
    const view = (await getLeadershipView("2025-26"))!;
    for (const card of [...view.team!.leos, ...view.team!.lions]) {
      expect(card).not.toHaveProperty("membershipId");
      expect(card.phone).toBeNull();
      expect(card.email).toBeNull();
    }
  });

  it("shows phone/email only for people who made them public", async () => {
    const db: DataSource = {
      ...staticSource,
      people: staticSource.people.map((p) =>
        p.id === "p-ashish-lamichhane"
          ? { ...p, phone: "98", phonePublic: true, email: "x@y.org", emailPublic: false, membershipId: "M1" }
          : p,
      ),
    };
    const ashish = (await getLeadershipView("2025-26", db))!.team!.leos[1];
    expect(ashish).toMatchObject({ phone: "98", email: null });
    expect(JSON.stringify(ashish)).not.toContain("M1");
  });

  it("shows the current year once it is published", async () => {
    const db: DataSource = {
      ...staticSource,
      leoYears: staticSource.leoYears.map((y) => (y.isCurrent ? { ...y, published: true } : y)),
    };
    const view = (await getLeadershipView(null, db))!;
    expect(view.comingSoon).toBe(false);
    expect(view.team?.year.slug).toBe("2026-27");
    expect(view.team?.leos).toEqual([]);
  });

  it("hides unpublished past years from the switcher", async () => {
    const db: DataSource = {
      ...staticSource,
      leoYears: staticSource.leoYears.map((y) => (y.isCurrent ? y : { ...y, published: false })),
    };
    const view = (await getLeadershipView("2025-26", db))!;
    expect(view.years.map((y) => y.slug)).toEqual(["2026-27"]);
    expect(view.comingSoon).toBe(true);
    expect(view.team).toBeNull();
  });
});

describe("getArchivedYearSlugs", () => {
  it("lists published past years only (current year lives at /leadership)", async () => {
    expect(await getArchivedYearSlugs()).toEqual(["2025-26"]);
    const db: DataSource = {
      ...staticSource,
      leoYears: staticSource.leoYears.map((y) => (y.isCurrent ? { ...y, published: true } : { ...y, published: false })),
    };
    expect(await getArchivedYearSlugs(db)).toEqual([]);
  });
});

describe("getPrideEntries", () => {
  it("lists the five entries in order, one person record for Prativa", async () => {
    const pride = await getPrideEntries();
    expect(pride.map((p) => p.honorTitle)).toEqual([
      "MDP 2010–11",
      "MDP 325 B 2017–18",
      "DP 325 B 2019–20",
      "DP 325 K 2022–23",
      "DP 325 K 2025–26",
    ]);
    expect(pride[4]).toMatchObject({ name: "Leo Prativa Shrestha", initials: "PS" });
    expect(staticSource.people.filter((p) => p.fullName === "Prativa Shrestha")).toHaveLength(1);
  });
});

describe("getClubs", () => {
  it("returns visible clubs A–Z with slugs", async () => {
    const list = await getClubs();
    expect(list.map((c) => c.slug)).toEqual([
      "baglung-kaligandaki",
      "kathmandu-machhapokhari",
      "kathmandu-rainbow-city",
      "pokhara-silver-mountains",
    ]);
  });

  it("drops hidden clubs", async () => {
    const db = { ...staticSource, clubs: staticSource.clubs.map((c, i) => ({ ...c, visible: i !== 0 })) };
    expect(await getClubs(db)).toHaveLength(3);
  });
});

describe("getResourceLibrary", () => {
  it("shows only published resources and hides empty categories", async () => {
    const lib = await getResourceLibrary();
    expect(lib.items).toHaveLength(12);
    expect(lib.items.some((i) => i.title.startsWith("District Constitution"))).toBe(false);
    expect(lib.categories).toEqual([
      "Forms",
      "Club Administration",
      "Brand & Logos",
      "Training & Guides",
      "Official Links",
    ]);
  });

  it("lists the three essentials and leaves unattached items without a link", async () => {
    const lib = await getResourceLibrary();
    expect(lib.featured.map((i) => i.title)).toEqual([
      "Monthly Club Report Template",
      "Official Leo Logo Pack",
      "New Leo Orientation Guide",
    ]);
    expect(lib.items.every((i) => i.href === null)).toBe(true);
  });
});
