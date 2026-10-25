import Image from "next/image";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteHeaderMobile } from "@/components/layout/SiteHeaderMobile";
import { atHeight, brand, site } from "@/lib/site";
import { SignInForm } from "./SignInForm";

// Admin sign-in (design/source/admin/Login.dc.html · 01_Login.png) with the full banner.
// Not in Sprint 4 (removed from the design until Sprint 6): email field, "Forgot password?",
// "Keep me signed in" and the 6-digit code note.
export function SignInScreen() {
  return (
    <>
      <SiteHeader nav={false} className="max-desk:hidden" />
      <SiteHeaderMobile menu={false} className="desk:hidden" />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-wrap focus:outline-none">
        <section className="flex flex-[1_1_480px] flex-col justify-between gap-10 bg-teal-900 px-6 py-10 text-white sm:p-14">
          <div className="flex items-center gap-3">
            <Image
              src={brand.leoEmblem.src}
              alt=""
              {...atHeight(brand.leoEmblem, 52)}
              className="brightness-[1.9]"
            />
            <span className="flex flex-col">
              <span className="font-heading text-lg font-bold">{site.shortName}</span>
              <span className="text-[13px] text-on-dark-3">NEPAL</span>
            </span>
          </div>
          <div className="flex max-w-[460px] flex-col gap-4">
            <span className="text-sm font-bold tracking-[1px] text-yellow uppercase">Admin portal</span>
            <span className="font-heading text-[36px] leading-[1.05] font-extrabold sm:text-[46px]">
              Keep the district’s website up to date
            </span>
            <span className="text-[17px] leading-[1.6] text-on-dark-2">
              Update leadership, clubs, resources and contact details — no coding needed.
            </span>
          </div>
          <span className="text-[13px] text-on-dark-muted">
            For authorized district officers only. All changes are logged.
          </span>
        </section>

        <section className="flex flex-[1_1_480px] items-center justify-center bg-mist px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex w-full max-w-[420px] flex-col gap-5 rounded-[22px] border border-line bg-white p-6 shadow-[0_16px_40px_rgba(11,31,68,0.10)] sm:p-9">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-heading text-[28px] font-bold text-teal-900">Sign in</h1>
              <p className="text-[15px] text-slate">Use the username the website admin gave you.</p>
            </div>
            <SignInForm />
            <p className="text-center text-[13px] text-slate">Need access? Ask the website admin.</p>
          </div>
        </section>
      </main>
    </>
  );
}
