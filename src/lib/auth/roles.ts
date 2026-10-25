import type { Role } from "@prisma/client";

// Role rules (docs/07). Pure, so they are unit-tested without a database.

/** ADMIN can do everything an EDITOR can; EDITOR only EDITOR things. */
export function hasRole(user: { role: Role }, needed: Role) {
  return needed === "EDITOR" || user.role === "ADMIN";
}

export type AdminChangeResult = { ok: false; reason: string } | { ok: true; warning?: string };

/**
 * Admin count rule for deactivating or demoting a user (Sprint 5 user management):
 * never leave zero active Admins; warn when fewer than 2 would remain.
 */
export function checkAdminChange({
  activeAdminIds,
  targetId,
  removesAdmin,
}: {
  activeAdminIds: string[];
  targetId: string;
  /** true when the change deactivates the user or turns an Admin into an Editor */
  removesAdmin: boolean;
}): AdminChangeResult {
  if (!removesAdmin || !activeAdminIds.includes(targetId)) return { ok: true };
  const remaining = activeAdminIds.length - 1;
  if (remaining < 1) {
    return { ok: false, reason: "This is the last active Admin. Make another user an Admin first." };
  }
  if (remaining < 2) {
    return { ok: true, warning: "Only one active Admin will remain. Two are recommended." };
  }
  return { ok: true };
}
