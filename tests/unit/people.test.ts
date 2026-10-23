import { describe, expect, it } from "vitest";
import { displayName, initials, leoYearSlug, publicContact } from "@/lib/people";
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
  const base = { phone: "9800000000", email: "a@b.org", phonePublic: false, emailPublic: false };

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
      publicContact({ phone: "  ", email: null, phonePublic: true, emailPublic: true }),
    ).toEqual({ phone: null, email: null });
  });
});

describe("leoYearSlug", () => {
  it("turns the en dash into a hyphen", () => {
    expect(leoYearSlug("2025–26")).toBe("2025-26");
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
