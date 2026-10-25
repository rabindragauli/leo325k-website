import { describe, expect, it } from "vitest";
import { clubs, regions } from "@/data/clubs";
import { awards, journeySteps, leoYears, people, positions, prideEntries } from "@/data/leadership";
import { resourceCategories, resources } from "@/data/resources";
import {
  archivedYearSlugs,
  clubCards,
  leadershipView,
  prideCards,
  resourceLibrary,
  toPublicPerson,
  toPublicPosition,
  type LeadershipView,
} from "@/server/queries/views";

// The seed rows (src/data) as the loaders would return them, with people still raw so tests can
// set private fields; toSource applies the same visibility rule as src/server/queries/loaders.ts.
const staticSource = {
  leoYears,
  people,
  positions,
  awards,
  journeySteps,
  prideEntries,
  clubs,
  regions,
  resourceCategories,
  resources,
};
type DataSource = typeof staticSource;

const toSource = (db: DataSource) => ({
  ...db,
  people: db.people.map(toPublicPerson),
  positions: db.positions.map((pos) => toPublicPosition(pos, db.people.find((p) => p.id === pos.personId))),
});
const section = (view: LeadershipView, id: string) => view.team?.sections.find((s) => s.id === id)?.people ?? [];
const getLeadershipView = async (year?: string | null, db = staticSource) => leadershipView(toSource(db), year);
const getArchivedYearSlugs = async (db = staticSource) => archivedYearSlugs(db);
const getPrideEntries = async (db = staticSource) => prideCards(toSource(db));
const getClubs = async (db = staticSource) => clubCards(db);
const getResourceLibrary = async (db = staticSource) => resourceLibrary(db);

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
    expect(view.team?.sections.map((s) => s.label)).toEqual(["District Board", "District Advisors"]);
    expect(section(view, "district-board").map((p) => p.role)).toEqual([
      "District President",
      "Vice District President",
      "District Secretary",
      "District Treasurer",
    ]);
    expect(section(view, "district-advisors")).toHaveLength(5);
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

  it("leaves an unknown home club empty (placeholder) and Lions show their unlisted club", async () => {
    const advisors = section((await getLeadershipView("2025-26"))!, "district-advisors");
    expect(advisors[0]).toMatchObject({ name: "MJF Lion Durga Prasad Humagain", homeClub: "LC Pokhara Peace Chautari" });
    expect(advisors[4]).toMatchObject({ role: "Cabinet Treasurer", homeClub: null });
  });

  // Ashish with every private value filled in, and the given switches
  const ashishWith = (switches: Partial<DataSource["people"][number]>): DataSource => ({
    ...staticSource,
    people: staticSource.people.map((p) =>
      p.id === "p-ashish-lamichhane"
        ? {
            ...p,
            phone: "9800000001",
            landline: "01-0000001",
            email: "x@y.org",
            membershipId: "M-TEST",
            bloodGroup: "AB-",
            address: "ADDRESS-TEST",
            ...switches,
          }
        : p,
    ),
  });
  const ashishCard = async (switches: Partial<DataSource["people"][number]>) =>
    section((await getLeadershipView("2025-26", ashishWith(switches)))!, "district-board")[1];

  it("shows only designation and home club by default, never address", async () => {
    const card = await ashishCard({ phonePublic: null, emailPublic: null });
    expect(card).toMatchObject({
      role: "Vice District President",
      homeClub: "Leo Club of Pokhara Silver Mountains",
      membershipNo: null,
      phone: null,
      landline: null,
      email: null,
      bloodGroup: null,
    });
    expect(JSON.stringify(await getLeadershipView("2025-26", ashishWith({})))).not.toMatch(/ADDRESS-TEST|M-TEST|9800000001/);
  });

  it("shows each value only when its own switch is on", async () => {
    const card = await ashishCard({ phonePublic: true, emailPublic: false, membershipPublic: true, bloodGroupPublic: true });
    expect(card).toMatchObject({ phone: "9800000001", email: null, membershipNo: "M-TEST", bloodGroup: "AB-", landline: null });
  });

  it("hides designation and home club when switched off", async () => {
    const card = await ashishCard({ designationPublic: false, homeClubPublic: false });
    expect(card).toMatchObject({ role: null, homeClub: null });
  });

  it("hides contact, membership no. and blood group for under-18 members, whatever the switches", async () => {
    const card = await ashishCard({
      under18: true,
      phonePublic: true,
      landlinePublic: true,
      emailPublic: true,
      membershipPublic: true,
      bloodGroupPublic: true,
    });
    expect(card).toMatchObject({ phone: null, landline: null, email: null, membershipNo: null, bloodGroup: null });
    expect(card.role).toBe("Vice District President");
  });

  it("shows a photo only with photo consent", async () => {
    expect((await ashishCard({ photo: "abc.webp" })).photo).toBeNull();
    expect((await ashishCard({ photo: "abc.webp", photoConsent: true })).photo).toBe("abc.webp");
  });

  it("leaves out draft positions", async () => {
    const db: DataSource = {
      ...staticSource,
      positions: staticSource.positions.map((p) => (p.role === "District Treasurer" ? { ...p, status: "DRAFT" } : p)),
    };
    const roles = section((await getLeadershipView("2025-26", db))!, "district-board").map((p) => p.role);
    expect(roles).not.toContain("District Treasurer");
    expect(roles).toHaveLength(3);
  });

  it("finds the District President case-insensitively", async () => {
    const db: DataSource = {
      ...staticSource,
      positions: staticSource.positions.map((p) => (p.sortOrder === 0 && p.group === "DISTRICT_BOARD" ? { ...p, role: " district president " } : p)),
    };
    expect((await getLeadershipView("2025-26", db))!.team!.president?.name).toBe("Leo Prativa Shrestha");
  });

  it("shows the current year once it is published", async () => {
    const db: DataSource = {
      ...staticSource,
      leoYears: staticSource.leoYears.map((y) => (y.isCurrent ? { ...y, published: true } : y)),
    };
    const view = (await getLeadershipView(null, db))!;
    expect(view.comingSoon).toBe(false);
    expect(view.team?.year.slug).toBe("2026-27");
    expect(view.team?.sections).toEqual([]);
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
  it("returns listed clubs A–Z with slugs (unlisted home clubs never)", async () => {
    const list = await getClubs();
    expect(list.map((c) => c.slug)).toEqual([
      "baglung-kaligandaki",
      "kathmandu-machhapokhari",
      "kathmandu-rainbow-city",
      "pokhara-silver-mountains",
    ]);
  });

  it("drops clubs not listed in the directory", async () => {
    const db = { ...staticSource, clubs: staticSource.clubs.map((c, i) => (i === 0 ? { ...c, listedInDirectory: false } : c)) };
    expect(await getClubs(db)).toHaveLength(3);
  });
});

describe("getResourceLibrary", () => {
  it("publishes only the 2 official links until files are uploaded (docs/08)", async () => {
    const lib = await getResourceLibrary();
    expect(lib.items.map((i) => i.title)).toEqual([
      "Leo Club Program — Lions Clubs International",
      "Leo Multiple District 325, Nepal",
    ]);
    expect(lib.categories).toEqual(["Official Links"]);
    // Featured items are all files, so there are no essentials yet
    expect(lib.featured).toEqual([]);
    // Link URLs are an open placeholder: nothing to link to yet
    expect(lib.items.every((i) => i.href === null)).toBe(true);
  });

  it("orders essentials by featuredOrder once they are published", async () => {
    const db = { ...staticSource, resources: staticSource.resources.map((r) => ({ ...r, published: true })) };
    const lib = await getResourceLibrary(db);
    expect(lib.featured.map((i) => i.title)).toEqual([
      "Official Leo Logo Pack",
      "Monthly Club Report Template",
      "New Leo Orientation Guide",
    ]);
  });
});
