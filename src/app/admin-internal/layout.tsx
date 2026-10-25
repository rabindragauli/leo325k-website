import type { Metadata } from "next";
import { assertAdminGate } from "@/server/auth/guards";

// Internal admin route: reached only through the /<ADMIN_SLUG> rewrite in src/proxy.ts. Without the
// gate header this is a 404 (before any auth check). Pages and actions guard themselves as well.
// Admin pages read cookies on every request: never prerendered, never `use cache`.
export const instant = false;

export const metadata: Metadata = {
  title: "Admin portal",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function AdminLayout({ children }: LayoutProps<"/admin-internal">) {
  await assertAdminGate();
  return children;
}
