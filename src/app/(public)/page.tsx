import { connection } from "next/server";
import Link from "next/link";
import { leadershipHref } from "@/components/public/Leadership";
import { OurPride } from "@/components/public/OurPride";
import { ButtonLink } from "@/components/ui/Button";
import { Placeholder, PlaceholderMedia } from "@/components/ui/Placeholder";
import { home } from "@/data/content";
import { socialLinks } from "@/lib/site";
import { getCurrentLeoYear, getLeadershipView, getPrideEntries } from "@/server/queries/public";

// Rendered per request from the cached queries (src/server/queries/public.ts) and sent as complete
// HTML (no streamed shell), so it works without JavaScript. `instant = false` allows this blocking
// render and opts the page out of the static-shell check.
export const instant = false;

function PhotoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 17l-5-5-9 8" />
    </svg>
  );
}

// design/source/public/Main.dc.html (desktop) · Mobile.dc.html (mobile, same content stacked)
export default async function HomePage() {
  await connection(); // request time, from the cache: the build never needs the database
  const [current, leadership, pride] = await Promise.all([
    getCurrentLeoYear(),
    getLeadershipView(),
    getPrideEntries(),
  ]);
  const yearLabel = current?.label ?? "";
  // "See past district teams" opens the latest published year (shown below the coming-soon block)
  const pastTeam = leadership?.team ? leadershipHref(leadership.team.year) : "/leadership";
  const socialSet = socialLinks.some((link) => link.url);

  return (
    <>
      <section className="bg-teal-900 px-4 pt-10 pb-24 text-white sm:px-6 sm:pt-[72px] sm:pb-[120px]">
        <div className="mx-auto flex max-w-content flex-wrap items-center gap-10 lg:gap-14">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
            {yearLabel && (
              <p className="self-start rounded-full border border-yellow px-3.5 py-1.5 text-sm font-bold tracking-[1px] text-yellow uppercase">
                Leo Year {yearLabel}
              </p>
            )}
            <h1 className="font-heading text-[2.5rem] leading-[1.02] font-black tracking-[-1px] sm:text-[64px]">
              Leadership.
              <br />
              Experience.
              <br />
              Opportunity.
            </h1>
            <p className="max-w-[560px] text-[19px] leading-[1.6] text-on-dark-2">{home.heroLead}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <ButtonLink href="/clubs" size="lg">
                Find a club near you
              </ButtonLink>
              <ButtonLink href="/about" size="lg" variant="outline-dark">
                About the district →
              </ButtonLink>
            </div>
          </div>
          <PlaceholderMedia tone="dark" className="h-[240px] min-w-0 flex-[1_1_440px] flex-col gap-3 sm:h-[420px]">
            <PhotoIcon />
            <span>[Photo: district-wide service event, Leos in uniform]</span>
          </PlaceholderMedia>
        </div>
      </section>

      <section aria-label="District in numbers" className="px-4 sm:px-6">
        <dl className="relative mx-auto -mt-16 grid max-w-[calc(var(--container-content)+64px)] grid-cols-2 gap-6 rounded-[20px] border border-line bg-white p-6 sm:p-8 lg:grid-cols-4">
          {home.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1.5 px-2 py-1">
              <dt className="text-[15px] font-medium text-slate">{stat.label}</dt>
              <dd className="font-heading text-[36px] leading-none font-black text-teal-900 sm:text-[44px]">
                <Placeholder>{stat.value}</Placeholder>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {current && !current.published && (
        <section aria-labelledby="home-coming-soon" className="px-4 py-14 sm:px-6 sm:py-[104px]">
          <div className="mx-auto flex max-w-[calc(var(--container-content)+96px)] flex-wrap items-center gap-10 rounded-panel border border-line bg-mist p-6 sm:p-12">
            <div
              aria-hidden="true"
              className="flex size-[140px] shrink-0 flex-col items-center justify-center rounded-full border-4 border-yellow bg-teal-900 text-white"
            >
              <span className="text-xs font-bold tracking-[1px] text-yellow">LEO YEAR</span>
              <span className="font-heading text-[28px] font-black">{current.label}</span>
            </div>
            <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3.5">
              <p className="text-sm font-bold tracking-[1px] text-gold-text uppercase">Coming soon</p>
              <h2 id="home-coming-soon" className="font-heading text-[28px] leading-[1.2] font-bold text-teal-900 sm:text-4xl">
                Our new district team will be announced soon
              </h2>
              <p className="max-w-[640px] text-[17px] leading-[1.65] text-slate">
                The District President’s message and the {current.label} team will appear here once the district
                leadership is officially installed.
              </p>
              <div className="mt-1.5 flex flex-wrap gap-3">
                <ButtonLink href={pastTeam} variant="secondary">
                  See past district teams
                </ButtonLink>
                {/* Social URLs not supplied yet (docs/08): no dead "Follow us" link until they are */}
                {socialSet && (
                  <ButtonLink href="#social" variant="outline">
                    Follow us for the announcement
                  </ButtonLink>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <nav aria-label="Quick links" className="px-4 pb-14 sm:px-6 sm:pb-24">
        <ul
          role="list"
          className="mx-auto grid max-w-[calc(var(--container-content)+96px)] grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-6 rounded-panel bg-teal-900 p-6 sm:p-12"
        >
          {home.explore.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col gap-3 rounded-[18px] border border-teal-500 bg-teal-700 p-7 text-white no-underline hover:border-yellow hover:text-white"
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-[12px] bg-yellow font-heading text-lg font-black text-teal-900"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-heading text-2xl font-bold">{item.title}</span>
                <span className="text-[15px] leading-[1.5] text-on-dark-2">{item.text}</span>
                <span className="text-[15px] font-bold text-yellow">{item.cta} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <OurPride entries={pride} allLink />
    </>
  );
}
