import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PrideCard } from "@/server/queries/public";
import { Avatar } from "./People";
import { Section } from "./Section";

/**
 * "Our District, Our Pride": past district leaders, not tied to a Leo Year
 * (Main.dc.html, MLeadership.dc.html). Shown on Home and, after the year content, on Leadership.
 */
export function OurPride({ entries, allLink }: { entries: PrideCard[]; allLink?: boolean }) {
  if (entries.length === 0) return null;
  return (
    <Section tone="mist" labelledBy="our-pride" innerClassName="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading id="our-pride" eyebrow="Our Pride" title="Our District, Our Pride" />
        {allLink && (
          <Link href="/leadership" className="min-h-11 content-center text-base font-bold">
            All past leaders →
          </Link>
        )}
      </div>
      <ul role="list" className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3 sm:gap-5">
        {entries.map((entry) => (
          <li
            key={entry.id}
            // Mobile: compact row (MLeadership.dc.html); from 640 px: centred card (Main.dc.html)
            className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-3.5 sm:flex-col sm:gap-2.5 sm:rounded-[18px] sm:p-6 sm:text-center"
          >
            <Avatar name={entry.name} initials={entry.initials} photo={entry.photo} size="lg" />
            <span className="flex flex-col items-start gap-1 sm:items-center sm:gap-2.5">
              <span className="text-[15px] font-bold text-teal-900 sm:text-base">{entry.name}</span>
              <span className="text-eyebrow font-bold text-gold-ink sm:rounded-full sm:bg-gold-tint sm:px-2.5 sm:py-1">
                {entry.honorTitle}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
