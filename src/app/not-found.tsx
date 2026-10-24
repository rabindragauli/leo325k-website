import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { ButtonLink } from "@/components/ui/Button";
import { notFoundLinks } from "@/data/content";
import { contactHref } from "@/lib/site";

export const metadata: Metadata = { title: "Page not found" };

// Branded 404 for every unmatched URL (design/source/public/NotFound.dc.html · 19_NotFound.png).
// The root not-found renders outside route groups, so it brings the public shell itself.
export default function NotFound() {
  return (
    <PublicShell>
      <section className="bg-hero-404 px-4 pt-16 pb-[72px] text-white sm:px-6 sm:pt-24 sm:pb-[104px]">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-[18px] text-center">
          <p aria-hidden="true" className="font-heading text-[72px] leading-none font-black text-yellow sm:text-[96px]">
            404
          </p>
          <h1 className="font-heading text-[2.25rem] leading-[1.1] font-black sm:text-[44px]">
            This page has moved or no longer exists
          </h1>
          <p className="max-w-[560px] text-lg leading-[1.6] text-on-dark">
            Our website was renewed for Leo Year 2026–27, so some old links changed. Try one of these instead.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" size="lg">
              Go to the home page
            </ButtonLink>
            <ButtonLink href={`${contactHref}?topic=feedback`} size="lg" variant="outline-dark">
              Tell us about a broken link
            </ButtonLink>
          </div>
        </div>
      </section>

      <nav aria-label="Popular pages" className="px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
        <ul role="list" className="mx-auto grid max-w-[1040px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          {notFoundLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex h-full flex-col gap-1.5 rounded-2xl border border-line p-5 text-ink no-underline hover:border-teal-400"
              >
                <span className="font-heading text-[19px] font-black text-teal-900">{link.title} →</span>
                <span className="text-sm leading-[1.5] text-slate">{link.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PublicShell>
  );
}
