import type { Metadata } from "next";
import { PageHero } from "@/components/public/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Placeholder, PlaceholderText } from "@/components/ui/Placeholder";
import { privacy } from "@/data/content";
import { contactDetails, contactHref, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: `How ${site.name} uses the personal details shared through this website.`,
};

// design/source/public/PrivacyNotice.dc.html · screens/public/18_PrivacyNotice.png
export default function PrivacyPage() {
  return (
    <>
      <PageHero
        width="narrow"
        crumb="Privacy notice"
        title="Privacy notice"
        lead={
          <>
            How {site.name} uses the personal details shared through this website. Last updated:{" "}
            <Placeholder>{privacy.lastUpdated}</Placeholder>.
          </>
        }
      />

      <div className="px-4 pt-10 pb-12 sm:px-6 sm:pt-16 sm:pb-[88px]">
        <div className="mx-auto flex max-w-[860px] flex-col gap-9">
          <section aria-labelledby="privacy-short" className="flex flex-col gap-2.5">
            <h2 id="privacy-short" className="font-heading text-[26px] font-black text-teal-900">
              In short
            </h2>
            <ul role="list" className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
              {privacy.short.map((item) => (
                <li key={item.title} className="flex flex-col gap-1.5 rounded-2xl bg-mist p-[18px]">
                  <span className="text-base font-bold text-teal-900">{item.title}</span>
                  <span className="text-sm leading-[1.55] text-slate">{item.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {privacy.parts.map((part, i) => (
            <section
              key={part.title}
              aria-labelledby={`privacy-${i}`}
              className="flex flex-col gap-2 border-t border-line pt-6"
            >
              <h2 id={`privacy-${i}`} className="font-heading text-[22px] font-black text-teal-900">
                {part.title}
              </h2>
              <p className="text-base leading-[1.7]">
                <PlaceholderText text={part.text} />
              </p>
            </section>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] bg-teal-900 p-6 text-white">
            <div className="flex max-w-[560px] flex-col gap-1">
              <p className="font-heading text-xl font-black">Questions or a request about your data?</p>
              <p className="text-[15px] leading-[1.6] text-on-dark-2">
                Write to <Placeholder>{contactDetails.email}</Placeholder>. We reply within{" "}
                <Placeholder>{privacy.replyTime}</Placeholder>.
              </p>
            </div>
            <ButtonLink href={contactHref}>Contact us</ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
