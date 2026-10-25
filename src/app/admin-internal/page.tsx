import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { SignInScreen } from "@/components/admin/SignInScreen";
import { assertAdminGate } from "@/server/auth/guards";
import { getSession } from "@/server/auth/session";

export const metadata: Metadata = { title: "Admin portal" };

// /<ADMIN_SLUG>: the sign-in screen without a session, the dashboard with one.
export default async function AdminHomePage() {
  const { base } = await assertAdminGate();
  const session = await getSession();
  if (!session) return <SignInScreen />;

  return (
    <AdminFrame user={session.user} base={base}>
      <h1 className="font-heading text-[32px] font-bold text-teal-900">Dashboard</h1>
      <p className="text-base text-slate">Welcome, {session.user.displayName}.</p>
      {/* Sprint 5 fills the dashboard (docs/04) */}
    </AdminFrame>
  );
}
