"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";
import { ALL, distinct, filterClubs } from "@/lib/filters";
import { contactHref } from "@/lib/site";
import type { ClubCard } from "@/server/queries/public";

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// Shared field shape only: colour, padding and size are set per field (cn() does not merge conflicts)
const fieldClasses = "h-[54px] rounded-[12px] border bg-white";

/** "Contact this club" pre-selects the club on the contact form (docs/04). */
export const clubContactHref = (slug: string) => `${contactHref}?topic=club&club=${encodeURIComponent(slug)}`;

function ClubCardView({ club, yearLabel }: { club: ClubCard; yearLabel: string }) {
  const details = [
    club.sponsor && `Sponsored by ${club.sponsor}`,
    club.charterYear && `Chartered ${club.charterYear}`,
    club.type && (club.type === "ALPHA" ? "Alpha Leo club" : "Omega Leo club"),
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-4 rounded-[20px] border border-line p-6">
      <div className="flex items-center gap-3.5">
        {club.logo ? (
          <Image src={club.logo} alt="" width={112} height={112} className="size-14 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-teal-900 font-heading text-[13px] font-black tracking-[0.5px] text-yellow"
          >
            LEO
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-[19px] leading-[1.3] font-bold text-teal-900">{club.name}</h2>
          <p className="flex flex-wrap gap-1.5 text-xs font-bold">
            <span className="rounded-full bg-gold-tint px-2.5 py-1 text-gold-ink">
              {club.region ?? <Placeholder>[Region]</Placeholder>}
            </span>
            <span className="rounded-full bg-line px-2.5 py-1 text-teal-900">{club.city}</span>
          </p>
        </div>
      </div>
      <p className="flex items-center gap-2 border-t border-line pt-3.5 text-sm text-slate">
        {details.length > 0 ? (
          details.join(" · ")
        ) : (
          <>
            <ClockIcon />
            Sponsor, charter year and {yearLabel} officers coming soon
          </>
        )}
      </p>
      <Link
        href={clubContactHref(club.slug)}
        aria-label={`Contact ${club.name}`}
        className="inline-flex min-h-11 items-center self-start rounded-btn border border-on-dark-2 px-4 text-sm font-bold text-teal-900 no-underline hover:border-teal-400"
      >
        Contact this club
      </Link>
    </article>
  );
}

/**
 * Club directory: search, region select and city chips in the dark intro, results below
 * (design/source/public/Clubs.dc.html, MClubs.dc.html). Filtering runs in the browser; without
 * JavaScript every club is listed.
 */
export function ClubDirectory({
  clubs,
  regions,
  yearLabel,
}: {
  clubs: ClubCard[];
  regions: string[];
  yearLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const cities = distinct(clubs.map((c) => c.city));
  const shown = filterClubs(clubs, { query, region, city });

  function reset() {
    setQuery("");
    setRegion(ALL);
    setCity(ALL);
    searchRef.current?.focus();
  }

  return (
    <>
      <section className="bg-teal-900 px-4 pt-10 pb-12 text-white sm:px-6 sm:pt-14 sm:pb-16">
        <div className="mx-auto flex max-w-content flex-col gap-6">
          <div className="flex max-w-[680px] flex-col gap-3">
            <Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: "Clubs" }]} />
            <h1 className="font-heading text-[2.25rem] leading-[1.05] font-black sm:text-display">Find a Leo club</h1>
            <p className="text-lg leading-[1.6] text-on-dark-2">
              Every approved Leo club in District 325 K. Search by name, or filter by region and city to find one near
              you.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor={`${id}-search`} className="sr-only">
              Search clubs
            </label>
            <input
              ref={searchRef}
              id={`${id}-search`}
              type="search"
              placeholder="Search by club name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                fieldClasses,
                "min-w-0 flex-[1_1_360px] border-teal-500 px-[18px] text-base text-ink placeholder:text-slate sm:max-w-[560px]",
              )}
            />
            <label htmlFor={`${id}-region`} className="sr-only">
              Region
            </label>
            <select
              id={`${id}-region`}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={cn(fieldClasses, "border-teal-400 px-3.5 text-[15px] font-bold text-teal-900")}
            >
              <option value={ALL}>All regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              {regions.length === 0 && <option disabled>[Region names from the council]</option>}
            </select>
            <div
              role="group"
              aria-label="Filter by city"
              className="-mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0"
            >
              {[ALL, ...cities].map((c) => {
                const pressed = c === city;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setCity(c)}
                    className={cn(
                      "min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold",
                      pressed ? "border-yellow bg-yellow text-teal-900" : "border-teal-400 text-white hover:border-white",
                    )}
                  >
                    {c === ALL ? "All cities" : c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Clubs" className="px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-[88px]">
        <div className="mx-auto flex max-w-content flex-col gap-6">
          <div
            role="note"
            className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-gold-tint px-5 py-4 text-ink"
          >
            <span className="text-[15px] font-semibold">
              We’re updating the club directory for Leo Year {yearLabel}. Don’t see your club yet?
            </span>
            <Link href={contactHref} className="text-[15px] font-bold">
              Let us know →
            </Link>
          </div>

          <p aria-live="polite" className="text-[15px] font-semibold text-slate">
            Showing {shown.length} of {clubs.length} clubs
          </p>

          {shown.length > 0 ? (
            <ul role="list" className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6">
              {shown.map((club) => (
                <li key={club.id}>
                  <ClubCardView club={club} yearLabel={yearLabel} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No clubs match your search"
              action={
                <Button variant="secondary" onClick={reset}>
                  Show all clubs
                </Button>
              }
            >
              Try another name, or contact us and we’ll connect you with the nearest club.
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
