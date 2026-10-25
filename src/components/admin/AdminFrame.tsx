import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/admin-internal/actions";
import { atHeight, brand, site } from "@/lib/site";
import type { SessionUser } from "@/server/auth/session";

// Signed-in admin layout: the slim bar (design/source/admin/AdminBanner.dc.html, "compact" variant)
// with the user's name, "Change my password" and sign out (POST only), then the page content.
// The sidebar arrives with the admin screens in Sprint 5.
export function AdminFrame({ user, base, children }: { user: SessionUser; base: string; children: ReactNode }) {
  return (
    <>
      <header className="border-b-4 border-orange bg-admin-bar text-white">
        <div className="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-2 sm:px-6">
          <Link href={base} className="flex items-center gap-2.5 text-white no-underline">
            <Image src={brand.lionsLogo.src} alt="" {...atHeight(brand.lionsLogo, 40)} />
            <span className="flex flex-col font-heading">
              <span className="text-[15px] leading-[1.2] font-black">{site.name} · Admin portal</span>
              <span className="text-xs font-bold tracking-[0.5px] text-yellow">
                {site.leoYear} · LEADING WITH PURPOSE
              </span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-bold">{user.displayName}</span>
            <Link href={`${base}/password`} className="min-h-11 content-center text-white underline-offset-4 hover:underline">
              Change my password
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="min-h-11 rounded-btn border border-on-dark-muted px-4 font-bold text-white hover:bg-teal-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col bg-mist focus:outline-none">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-4 py-10 sm:px-6">{children}</div>
      </main>
    </>
  );
}
