import { describe, expect, it } from "vitest";
import { ALL, countByCategory, distinct, filterClubs, filterResources, matchesQuery } from "@/lib/filters";
import { getClubs, type ResourceItem } from "@/server/queries/public";

// Own fixture: independent of which resources are published in the seed data
const resource = (title: string, description: string, category: string): ResourceItem => ({
  id: title,
  title,
  description,
  category,
  kind: "FILE",
  fileType: "DOCX",
  fileSize: null,
  href: null,
  featured: false,
});

const categories = ["Forms", "Club Administration", "Brand & Logos", "Official Links"];
const items: ResourceItem[] = [
  resource("New Member Registration Form", "Details for adding new Leos.", "Forms"),
  resource("Club Officers Report Form", "Report your club officers.", "Forms"),
  resource("Monthly Club Report Template", "Standard monthly report format for club secretaries.", "Club Administration"),
  resource("Meeting Minutes Template", "Format for recording club meetings.", "Club Administration"),
  resource("District Letterhead Template", "Official letterhead.", "Brand & Logos"),
  { ...resource("Leo Multiple District 325, Nepal", "Official page.", "Official Links"), kind: "LINK", fileType: null },
];

describe("matchesQuery", () => {
  it("is case-insensitive, ignores extra spaces and needs every word", () => {
    expect(matchesQuery("Leo Club of Pokhara Silver Mountains", "  pokhara   SILVER ")).toBe(true);
    expect(matchesQuery("Leo Club of Pokhara Silver Mountains", "pokhara rainbow")).toBe(false);
    expect(matchesQuery("anything", "")).toBe(true);
  });
});

describe("filterClubs", () => {
  it("filters by city, region and name together", async () => {
    const clubs = await getClubs();
    const none = { query: "", region: ALL, city: ALL };
    expect(filterClubs(clubs, none)).toHaveLength(4);
    expect(filterClubs(clubs, { ...none, city: "Kathmandu" }).map((c) => c.slug)).toEqual([
      "kathmandu-machhapokhari",
      "kathmandu-rainbow-city",
    ]);
    expect(filterClubs(clubs, { ...none, city: "Kathmandu", query: "rainbow" })).toHaveLength(1);
    expect(filterClubs(clubs, { ...none, city: "Pokhara", query: "rainbow" })).toHaveLength(0);
    // No regions assigned yet: any specific region matches nothing
    expect(filterClubs(clubs, { ...none, region: "Gandaki" })).toHaveLength(0);
  });

  it("lists distinct cities in first-seen order", async () => {
    expect(distinct((await getClubs()).map((c) => c.city))).toEqual(["Baglung", "Kathmandu", "Pokhara"]);
    expect(distinct([null, "A", "B", "A"])).toEqual(["A", "B"]);
  });
});

describe("filterResources / countByCategory", () => {
  it("searches title and description within a category", () => {
    expect(filterResources(items, { query: "", category: ALL })).toHaveLength(6);
    expect(filterResources(items, { query: "", category: "Forms" })).toHaveLength(2);
    expect(filterResources(items, { query: "letterhead", category: ALL }).map((i) => i.title)).toEqual([
      "District Letterhead Template",
    ]);
    // "secretaries" only appears in a description
    expect(filterResources(items, { query: "secretaries", category: ALL })).toHaveLength(1);

    expect(filterResources(items, { query: "template", category: "Forms" })).toHaveLength(0);

    expect(countByCategory(items, categories, "template")).toEqual({
      [ALL]: 3,
      Forms: 0,
      "Club Administration": 2,
      "Brand & Logos": 1,
      "Official Links": 0,
    });
  });
});
