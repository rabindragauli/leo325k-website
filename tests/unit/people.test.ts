import { describe, expect, it } from "vitest";
import {
  displayName,
  initials,
  isLeoYearSlug,
  isPlausibleLeoYearSlug,
  leoYearSlug,
  publicContact,
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
  it("joins prefix and name", () => {
    expect(displayName({ prefix: "PMJF Lion", fullName: "Ramesh Adhikari" })).toBe(
      "PMJF Lion Ramesh Adhikari",
    );
  });
});

describe("publicContact", () => {
  const base = {
    phone: "9800000000",
    email: "a@b.org",
    phonePublic: false,
    emailPublic: false,
    consentAt: "2026-09-01",
  };

  it("hides phone and email unless the toggle is on", () => {
    expect(publicContact(base)).toEqual({ phone: null, email: null });
    expect(publicContact({ ...base, phonePublic: true })).toEqual({
      phone: "9800000000",
      email: null,
    });
    expect(publicContact({ ...base, emailPublic: true })).toEqual({ phone: null, email: "a@b.org" });
  });

  it("returns nothing for a public toggle on an empty value", () => {
    expect(
      publicContact({ phone: "  ", email: null, phonePublic: true, emailPublic: true, consentAt: "2026-09-01" }),
    ).toEqual({ phone: null, email: null });
  });

  it("keeps both private without a consent date, even with the toggles on", () => {
    expect(publicContact({ ...base, phonePublic: true, emailPublic: true, consentAt: null })).toEqual({
      phone: null,
      email: null,
    });
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
