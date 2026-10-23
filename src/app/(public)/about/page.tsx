import type { Metadata } from "next";
import { PageHero } from "@/components/public/PageHero";
import { Section } from "@/components/public/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PlaceholderMedia, PlaceholderText } from "@/components/ui/Placeholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { about } from "@/data/content";
import { cn } from "@/lib/cn";
import { contactHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who we are: the Leo program in District 325 K, our motto, mission, service focus and how the district is organized.",
};

// Level cards: district → regions → clubs → Lion sponsors, darkest first (About.dc.html `levels`)
const levelStyles = [
  { card: "bg-teal-900 text-white", accent: "text-yellow" },
  { card: "bg-teal-700 text-white", accent: "text-yellow" },
  { card: "bg-gold-tint text-ink", accent: "text-gold-ink" },
  { card: "bg-mist text-ink", accent: "text-gold-text" },
];

// design/source/public/About.dc.html (desktop) · MAbout.dc.html (mobile)
export default function AboutPage() {
  return (
    <>
      <PageHero
        crumb="About"
        title="Youth leading service across Nepal"
        lead={about.heroLead}
        aside={
          <PlaceholderMedia tone="dark" className="h-[220px] sm:h-[320px]">
            [Photo: Leos from several clubs together]
          </PlaceholderMedia>
        }
      />

      <Section labelledBy="about-who" innerClassName="flex flex-wrap items-start gap-10 lg:gap-14">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-[18px]">
          <SectionHeading id="about-who" eyebrow="Who we are" title="The Leo program in District 325 K" />
          {about.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-[17px] leading-[1.7] text-slate">
              <PlaceholderText text={paragraph} />
            </p>
          ))}
        </div>
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-[18px] rounded-[20px] bg-mist p-7">
          <h3 className="text-[17px] font-bold text-teal-900">District at a glance</h3>
          <dl className="flex flex-col gap-[14px]">
            {about.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex justify-between gap-4 border-b border-line pb-[14px] text-[15px]"
              >
                <dt className="text-slate">{fact.label}</dt>
                <dd className="text-right font-bold text-teal-900">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section tone="dark" labelledBy="about-motto" innerClassName="flex flex-col gap-10">
        <SectionHeading
          id="about-motto"
          tone="dark"
          eyebrow="Our motto"
          title="Leadership. Experience. Opportunity."
        />
        <ul role="list" className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
          {about.pillars.map((pillar) => (
            <li
              key={pillar.letter}
              className="flex flex-col gap-3 rounded-[20px] border border-teal-500 bg-teal-700 p-7"
            >
              <span aria-hidden="true" className="font-heading text-[56px] leading-none font-black text-yellow">
                {pillar.letter}
              </span>
              <h3 className="font-heading text-2xl font-bold">{pillar.title}</h3>
              <p className="text-[15px] leading-[1.6] text-on-dark-2">{pillar.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="about-mission" innerClassName="flex flex-col gap-10">
        <SectionHeading id="about-mission" eyebrow="Mission & vision" title="What guides us" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6">
          {[
            { label: "Mission", text: about.mission },
            { label: "Vision", text: about.vision },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-3 rounded-[20px] border border-line p-8">
              <h3 className="text-eyebrow font-bold tracking-[1px] text-gold-text uppercase">{item.label}</h3>
              <p className="font-heading text-[22px] leading-[1.4] text-teal-900 sm:text-2xl">
                <PlaceholderText text={item.text} />
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="mist" labelledBy="about-focus" innerClassName="flex flex-col gap-10">
        <SectionHeading id="about-focus" eyebrow="Where we serve" title="Our service focus" />
        <ul role="list" className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
          {about.focusAreas.map((area, i) => (
            <li
              key={area.title}
              className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-6"
            >
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-[12px] bg-gold-tint font-heading text-[17px] font-black text-gold-ink"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[19px] font-bold text-teal-900">{area.title}</h3>
              <p className="text-[15px] leading-[1.55] text-slate">{area.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="about-levels" innerClassName="flex flex-col gap-10">
        <SectionHeading id="about-levels" eyebrow="How we are organized" title="From district to club" />
        <ol role="list" className="flex flex-wrap items-stretch gap-4">
          {about.levels.map((level, i) => (
            <li
              key={level.title}
              className={cn(
                "flex min-w-0 flex-[1_1_220px] flex-col gap-2 rounded-[18px] p-6",
                levelStyles[i % levelStyles.length].card,
              )}
            >
              <span
                className={cn(
                  "text-eyebrow font-bold tracking-[1px] uppercase",
                  levelStyles[i % levelStyles.length].accent,
                )}
              >
                Level {i + 1}
              </span>
              <h3 className="font-heading text-[22px] font-bold">{level.title}</h3>
              <p className="text-[15px] leading-[1.55]">{level.text}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-6">
          {about.clubTypes.map((type) => (
            <div
              key={type.title}
              className="flex flex-[1_1_320px] flex-col gap-2 rounded-[18px] border border-line p-6"
            >
              <h3 className="text-[19px] font-bold text-teal-900">{type.title}</h3>
              <p className="text-[15px] leading-[1.55] text-slate">{type.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <section aria-labelledby="about-cta" className="px-4 pb-12 sm:px-6 sm:pb-[88px]">
        <div className="mx-auto flex max-w-[calc(var(--container-content)+96px)] flex-wrap items-center justify-between gap-6 rounded-panel bg-yellow p-7 sm:p-12">
          <div className="flex max-w-[640px] flex-col gap-2">
            <h2 id="about-cta" className="font-heading text-[28px] leading-[1.15] font-black text-teal-900 sm:text-[34px]">
              Ready to become a Leo?
            </h2>
            <p className="text-[17px] leading-[1.6] text-ink">
              Find a club near you, or talk to us about starting a new one in your community.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/clubs" variant="secondary" size="lg">
              Find a club
            </ButtonLink>
            <ButtonLink href={contactHref} variant="outline-strong" size="lg">
              Contact the district
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
