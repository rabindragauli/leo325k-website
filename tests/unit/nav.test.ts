import { describe, expect, it } from "vitest";
import { isActivePath } from "@/lib/nav";

describe("isActivePath", () => {
  it("matches home only on /", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/about", "/")).toBe(false);
  });

  it("matches the exact page", () => {
    expect(isActivePath("/clubs", "/clubs")).toBe(true);
  });

  it("matches nested pages of a section", () => {
    expect(isActivePath("/clubs/pokhara-silver-mountains", "/clubs")).toBe(true);
  });

  it("ignores a trailing slash", () => {
    expect(isActivePath("/about/", "/about")).toBe(true);
  });

  it("does not match a sibling with the same prefix", () => {
    expect(isActivePath("/resources-old", "/resources")).toBe(false);
    expect(isActivePath("/about", "/leadership")).toBe(false);
  });
});
