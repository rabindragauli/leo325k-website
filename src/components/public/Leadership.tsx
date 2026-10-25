import Image from "next/image";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { PlaceholderMedia } from "@/components/ui/Placeholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { contactHref } from "@/lib/site";
import type { LeadershipView, President, PrideCard, Team, YearRef } from "@/server/queries/public";
import { OurPride } from "./OurPride";
import { HomeClub, LionCard, OfficerCard } from "./People";
import { Section } from "./Section";

// Leadership page body, shared by /leadership (current year) and /leadership/[year] (archived years).
// design/source/public/Leadership.dc.html (desktop) · MLeadership.dc.html (mobile)

/** Current year lives at /leadership, past years at /leadership/2025-26 (prerendered, plain links). */
export const leadershipHref = (year: Pick<YearRef, "slug" | "isCurrent">) =>
  year.isCurrent ? "/leadership" : `/leadership/${year.slug}`;

function YearSwitcher({ view }: { view: LeadershipView }) {
  return (
    <nav aria-label="Leo Year">
      <ul role="list" className="flex flex-wrap gap-1.5 rounded-[14px] border border-teal-500 bg-teal-700 p-1.5">
        {view.years.map((year) => {
          const selected = year.slug === view.selected.slug;
          return (
            <li key={year.slug}>
              <Link
                href={leadershipHref(year)}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center rounded-btn px-5 text-[15px] font-bold no-underline",
                  selected ? "bg-yellow text-teal-900" : "text-on-dark hover:bg-teal-600 hover:text-white",
                )}
              >
                {year.label}
                {year.isCurrent && " (current)"}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CalendarCheckIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18M9 15l2 2 4-4" />
    </svg>
  );
}

function ComingSoon({ year, previous }: { year: YearRef; previous: YearRef | null }) {
  return (
    <section aria-labelledby="coming-soon" className="px-4 pt-12 pb-4 sm:px-6 sm:pt-16 sm:pb-6">
      <div className="mx-auto flex max-w-[820px] flex-col items-center gap-[18px] text-center">
        <span className="flex size-[72px] items-center justify-center rounded-full bg-gold-tint text-gold-ink">
          <CalendarCheckIcon />
        </span>
        <p className="text-sm font-bold tracking-[1px] text-gold-text uppercase">Leo Year {year.label}</p>
        <h2 id="coming-soon" className="font-heading text-[28px] leading-[1.15] font-bold text-teal-900 sm:text-[40px]">
          The {year.label} district team is coming soon
        </h2>
        <p className="text-[17px] leading-[1.65] text-slate">
          Profiles of the District President, district officers and our sponsoring Lions will be published here after
          the official installation.
          {previous && ` Until then, the previous district team (${previous.label}) is shown below.`}
        </p>
        <ButtonLink href={contactHref} variant="outline" size="lg" className="mt-2">
          Contact the district office
        </ButtonLink>
      </div>
    </section>
  );
}

function PresidentFeature({ president, year }: { president: President; year: YearRef }) {
  return (
    <Section labelledBy="president" spacing="compact" innerClassName="flex flex-wrap items-start gap-10 lg:gap-14">
      <div className="flex min-w-[260px] flex-[0_1_340px] flex-col gap-4">
        {president.photo ? (
          <Image
            src={president.photo}
            alt={president.name}
            width={680}
            height={840}
            className="h-[420px] w-full rounded-[20px] object-cover"
          />
        ) : (
          <PlaceholderMedia className="h-[320px] sm:h-[420px]">[Portrait: {president.name}]</PlaceholderMedia>
        )}
        <ButtonLink href={contactHref} size="lg">
          Contact the District President
        </ButtonLink>
      </div>

      <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-5">
        <p className="self-start rounded-full bg-gold-tint px-3 py-1.5 text-eyebrow font-bold tracking-[1px] text-gold-ink uppercase">
          District President · {year.label}
        </p>
        <h2 id="president" className="font-heading text-[2rem] leading-[1.1] font-black text-teal-900 sm:text-[44px]">
          {president.name}
        </h2>
        <p className="text-[17px] font-medium text-slate">
          Home club: <HomeClub name={president.homeClub} />
        </p>
        {president.message && (
          <div className="flex flex-col gap-2.5 rounded-2xl bg-mist p-6">
            <h3 className="text-sm font-bold tracking-[1px] text-gold-text uppercase">Message for the year</h3>
            <p className="text-lg leading-[1.65]">{president.message}</p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-8">
          {president.awards.length > 0 && (
            <div className="flex flex-col gap-3.5">
              <h3 className="text-xl font-bold text-teal-900">Awards &amp; recognition</h3>
              <ul role="list" className="flex flex-col gap-3.5">
                {president.awards.map((award) => (
                  <li key={`${award.title}-${award.year}`} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-[7px] size-2.5 shrink-0 rounded-full bg-yellow" />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-semibold">{award.title}</span>
                      <span className="text-eyebrow text-slate">{award.year}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {president.journey.length > 0 && (
            <div className="flex flex-col">
              <h3 className="mb-3.5 text-xl font-bold text-teal-900">Leo journey</h3>
              <ol role="list">
                {president.journey.map((step) => (
                  <li key={`${step.year}-${step.role}`} className="flex gap-3.5">
                    <span aria-hidden="true" className="flex flex-col items-center">
                      <span className="size-3 shrink-0 rounded-full border-2 border-yellow bg-teal-900" />
                      <span className="min-h-7 w-0.5 flex-1 bg-line" />
                    </span>
                    <span className="flex flex-col gap-0.5 pb-3.5">
                      <span className="text-eyebrow font-bold text-gold-text">{step.year}</span>
                      <span className="text-[15px] font-semibold">{step.role}</span>
                      <span className="text-eyebrow text-slate">{step.organisation}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

function TeamSections({ team }: { team: Team }) {
  return (
    <>
      {team.president && <PresidentFeature president={team.president} year={team.year} />}

      {/* Sections in the configured order (Batch 4 redesigns this page) */}
      {team.sections.map((section, index) => {
        const board = section.group === "DISTRICT_BOARD";
        const Card = board ? OfficerCard : LionCard;
        return (
          <Section
            key={section.id}
            tone={index % 2 === 0 ? "mist" : undefined}
            labelledBy={section.id}
            spacing="compact"
            innerClassName="flex flex-col gap-8"
          >
            <SectionHeading id={section.id} eyebrow={`Leo Year ${team.year.label}`} title={section.label} />
            <ul
              role="list"
              className={cn(
                "grid gap-5",
                board
                  ? "grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))]"
                  : "grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]",
              )}
            >
              {section.people.map((person) => (
                <li key={`${section.id}-${person.id}`}>
                  <Card person={person} />
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </>
  );
}

export function LeadershipContent({ view, pride }: { view: LeadershipView; pride: PrideCard[] }) {
  return (
    <>
      <section className="bg-teal-900 px-4 pt-10 pb-12 text-white sm:px-6 sm:pt-14 sm:pb-16">
        <div className="mx-auto flex max-w-content flex-wrap items-end justify-between gap-8">
          <div className="flex max-w-[640px] flex-col gap-3">
            <Breadcrumb
              tone="dark"
              items={[
                { label: "Home", href: "/" },
                ...(view.selected.isCurrent
                  ? [{ label: "Leadership" }]
                  : [{ label: "Leadership", href: "/leadership" }, { label: view.selected.label }]),
              ]}
            />
            <h1 className="font-heading text-[2.5rem] leading-[1.05] font-black sm:text-display">District leadership</h1>
            <p className="text-lg leading-[1.6] text-on-dark-2">
              The Leos and Lions guiding District 325 K. Choose a Leo Year to see that year’s team.
            </p>
          </div>
          {view.years.length > 1 && <YearSwitcher view={view} />}
        </div>
      </section>

      {!view.selected.isCurrent && view.current && (
        <p className="bg-gold-tint px-6 py-3.5 text-center text-[15px] font-semibold text-gold-ink">
          You are viewing an archived Leo Year ({view.selected.label}).{" "}
          <Link href="/leadership" className="font-bold text-teal-900 underline">
            Back to the current team
          </Link>
        </p>
      )}

      {view.comingSoon && <ComingSoon year={view.selected} previous={view.team?.year ?? null} />}
      {view.team && <TeamSections team={view.team} />}

      <OurPride entries={pride} />
    </>
  );
}
