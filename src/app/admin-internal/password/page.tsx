import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { requireUser } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Change my password" };

export const instant = false; // reads the session cookie on every request (see ../page.tsx)

export default async function ChangePasswordPage() {
  const { base, user } = await requireUser();
  return (
    <AdminFrame user={user} base={base}>
      <h1 className="font-heading text-[32px] font-bold text-teal-900">Change my password</h1>
      <p className="max-w-[560px] text-base leading-[1.6] text-slate">
        Changing your password signs you out on every other device.
      </p>
      <ChangePasswordForm />
    </AdminFrame>
  );
}
