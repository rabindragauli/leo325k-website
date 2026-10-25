import { describe, expect, it } from "vitest";
import { checkAdminChange, hasRole } from "@/lib/auth/roles";

describe("hasRole", () => {
  it("lets an Admin do Admin and Editor things", () => {
    expect(hasRole({ role: "ADMIN" }, "ADMIN")).toBe(true);
    expect(hasRole({ role: "ADMIN" }, "EDITOR")).toBe(true);
  });
  it("keeps an Editor out of Admin-only actions", () => {
    expect(hasRole({ role: "EDITOR" }, "EDITOR")).toBe(true);
    expect(hasRole({ role: "EDITOR" }, "ADMIN")).toBe(false);
  });
});

describe("checkAdminChange", () => {
  const change = (activeAdminIds: string[], targetId: string, removesAdmin = true) =>
    checkAdminChange({ activeAdminIds, targetId, removesAdmin });

  it("hard-blocks deactivating or demoting the last active Admin", () => {
    expect(change(["a"], "a")).toEqual({ ok: false, reason: expect.stringMatching(/last active Admin/) });
  });

  it("warns when only one active Admin would remain", () => {
    expect(change(["a", "b"], "a")).toEqual({ ok: true, warning: expect.stringMatching(/Only one/) });
  });

  it("allows the change when 2 or more Admins remain", () => {
    expect(change(["a", "b", "c"], "a")).toEqual({ ok: true });
  });

  it("ignores changes that keep the Admin, and users who are not active Admins", () => {
    expect(change(["a"], "a", false)).toEqual({ ok: true });
    expect(change(["a"], "editor-1")).toEqual({ ok: true });
  });
});
