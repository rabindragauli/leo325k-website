import { describe, expect, it } from "vitest";
import {
  displayName,
  initials,
  isLeoYearSlug,
  isPlausibleLeoYearSlug,
  leoYearSlug,
} from "@/lib/people";
import { isPlaceholder, splitPlaceholders } from "@/lib/placeholders";

describe("initials", () => {
  it("uses the first and last name", () => {
    expect(initials("Prativa Shrestha")).toBe("PS");
    expect(initials("Durga Prasad Humagain")).toBe("DH");
    expect(initials("  ram  kumar lamichhane ")).toBe("RL");
  });
  it("handles a single name and empty input", () => {
    expect(initials("Prativa")).toBe("P");
    expect(initials("")).toBe("");
  });
});

describe("displayName", () => {
  it("joins title and name", () => {
    expect(displayName({ title: "PMJF Lion", fullName: "Ramesh Adhikari" })).toBe(
      "PMJF Lion Ramesh Adhikari",
    );
  });
});

describe("leoYearSlug", () => {
  it("turns the en dash into a hyphen", () => {
    expect(leoYearSlug("2025–26")).toBe("2025-26");
  });
});

describe("isLeoYearSlug", () => {
  it("accepts consecutive years only", () => {
    expect(isLeoYearSlug("2025-26")).toBe(true);
    expect(isLeoYearSlug("2099-00")).toBe(true);
    for (const slug of ["2025-27", "2025–26", "25-26", "2025-26x", "__placeholder__", "", "<script>"]) {
      expect(isLeoYearSlug(slug), slug).toBe(false);
    }
  });
});

describe("isPlausibleLeoYearSlug", () => {
  const now = new Date("2026-10-24T12:00:00Z");

  it("accepts 2015 up to the current year + 2", () => {
    for (const slug of ["2015-16", "2025-26", "2026-27", "2028-29"]) {
      expect(isPlausibleLeoYearSlug(slug, now), slug).toBe(true);
    }
  });

  it("rejects years outside the range and malformed slugs", () => {
    for (const slug of ["2014-15", "1999-00", "2029-30", "2099-00", "2025-27", "__placeholder__"]) {
      expect(isPlausibleLeoYearSlug(slug, now), slug).toBe(false);
    }
  });

  it("moves the upper bound with the clock", () => {
    expect(isPlausibleLeoYearSlug("2029-30", new Date("2027-01-01T00:00:00Z"))).toBe(true);
  });
});

describe("placeholders", () => {
  it("splits bracketed parts out of copy", () => {
    expect(splitPlaceholders("Write to [official district email]. We reply.")).toEqual([
      { text: "Write to ", placeholder: false },
      { text: "[official district email]", placeholder: true },
      { text: ". We reply.", placeholder: false },
    ]);
    expect(splitPlaceholders("No placeholder")).toEqual([
      { text: "No placeholder", placeholder: false },
    ]);
  });

  it("detects whole-value placeholders", () => {
    expect(isPlaceholder("[District vision statement]")).toBe(true);
    expect(isPlaceholder("Leadership")).toBe(false);
    expect(isPlaceholder(null)).toBe(true);
  });
});
