import type { Metadata } from "next";
import { connection } from "next/server";
import { ClubDirectory } from "@/components/public/ClubDirectory";
import { Section } from "@/components/public/Section";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { clubsPage } from "@/data/content";
import { distinct } from "@/lib/filters";
import { contactHref } from "@/lib/site";
import { getClubs, getCurrentLeoYear } from "@/server/queries/public";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Find an approved Leo club in District 325 K by name, region or city, or start a new one.",
};

// Rendered per request from the cached queries (src/server/queries/public.ts) and sent as complete
// HTML (no streamed shell), so it works without JavaScript. `instant = false` allows this blocking
// render and opts the page out of the static-shell check.
export const instant = false;

// design/source/public/Clubs.dc.html (desktop) · MClubs.dc.html (mobile).
export default async function ClubsPage() {
  await connection(); // request time, from the cache: the build never needs the database
  const [clubs, current] = await Promise.all([getClubs(), getCurrentLeoYear()]);
  const regions = distinct(clubs.map((c) => c.region));

  return (
    <>
      <ClubDirectory clubs={clubs} regions={regions} yearLabel={current?.label ?? ""} />

      <Section tone="mist" labelledBy="start-club" innerClassName="flex flex-col gap-10">
        <SectionHeading
          id="start-club"
          eyebrow="No club near you?"
          title="Start a new Leo club"
          lead="The district helps new groups of young people get started, step by step."
        />
        <ol role="list" className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-5">
          {clubsPage.startSteps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-[26px]">
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-full bg-teal-900 font-heading text-lg font-black text-yellow"
              >
                {i + 1}
              </span>
              <h3 className="text-[19px] font-bold text-teal-900">{step.title}</h3>
              <p className="text-[15px] leading-[1.55] text-slate">{step.text}</p>
            </li>
          ))}
        </ol>
        <ButtonLink href={contactHref} size="lg" className="self-start">
          Talk to the district office
        </ButtonLink>
      </Section>
    </>
  );
}
