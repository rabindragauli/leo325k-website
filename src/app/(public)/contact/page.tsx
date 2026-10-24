import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/public/ContactForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Placeholder, PlaceholderText } from "@/components/ui/Placeholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contactPage } from "@/data/content";
import { contactDetails, socialLinks } from "@/lib/site";
import { getClubs } from "@/server/queries/public";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Leo District Council 325 K: joining or starting a club, partnerships, media and general questions.",
};

const MAIL = "M3 7l9 6 9-6 M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z";
const CLOCK = "M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z";
const PIN = "M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z";

const cardShadow = "shadow-[0_16px_40px_rgba(11,31,68,0.10)]";

function OfficeIcon({ path }: { path: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-btn bg-gold-tint text-gold-ink">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={path} />
      </svg>
    </span>
  );
}

// design/source/public/Contact.dc.html (desktop) · MContact.dc.html (mobile). Prerendered; the form
// applies ?topic=&club= in the browser.
export default async function ContactPage() {
  const clubs = (await getClubs()).map(({ slug, name }) => ({ slug, name }));
  const office = [
    { label: "Email", value: contactDetails.email, icon: MAIL },
    { label: "Office hours", value: contactDetails.hours, icon: CLOCK },
    { label: "Address", value: contactDetails.address, icon: PIN },
  ];
  const social = socialLinks.filter((link) => link.url);

  return (
    <>
      <section className="bg-teal-900 px-4 pt-10 pb-24 text-white sm:px-6 sm:pt-14 sm:pb-[120px]">
        <div className="mx-auto flex max-w-content flex-col gap-3">
          <Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: "Contact us" }]} />
          <h1 className="font-heading text-[2.25rem] leading-[1.05] font-black sm:text-display">Get in touch</h1>
          <p className="max-w-[640px] text-lg leading-[1.6] text-on-dark-2">{contactPage.lead}</p>
        </div>
      </section>

      <div className="px-4 pb-12 sm:px-6 sm:pb-[88px]">
        <div className="mx-auto -mt-[72px] flex max-w-content flex-wrap items-start gap-7">
          <div className={`min-w-0 flex-[999_1_600px] rounded-[22px] border border-line bg-white p-5 sm:p-9 ${cardShadow}`}>
            <ContactForm clubs={clubs} replyTime={contactPage.replyTime} />
          </div>

          <aside aria-label="District office" className="flex min-w-0 flex-[1_1_340px] flex-col gap-5">
            <div className={`flex flex-col gap-5 rounded-[22px] border border-line bg-white p-7 ${cardShadow}`}>
              <h2 className="font-heading text-[22px] font-bold text-teal-900">District office</h2>
              <ul role="list" className="flex flex-col gap-5">
                {office.map((item) => (
                  <li key={item.label} className="flex items-start gap-3.5">
                    <OfficeIcon path={item.icon} />
                    <p className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-eyebrow font-bold tracking-[0.5px] text-slate uppercase">{item.label}</span>
                      <span className="text-base font-semibold [overflow-wrap:anywhere]">
                        <PlaceholderText text={item.value} />
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4 rounded-[22px] bg-teal-900 p-7 text-white">
              <h2 className="font-heading text-[22px] font-bold">Reach the right person</h2>
              <ul role="list" className="flex flex-col gap-4">
                {contactPage.desks.map((desk) => (
                  <li key={desk.title} className="flex flex-col gap-1 border-b border-teal-600 pb-3.5">
                    <span className="text-base font-bold">{desk.title}</span>
                    <span className="text-sm text-on-dark-2">{desk.text}</span>
                    {/* mailto: only once the council supplies the real address (docs/08) */}
                    <Placeholder className="text-sm font-bold text-yellow [overflow-wrap:anywhere]">{desk.email}</Placeholder>
                  </li>
                ))}
              </ul>
              {social.length > 0 && (
                <p className="text-sm text-on-dark-2">
                  Follow us:{" "}
                  {social.map((link, i) => (
                    <span key={link.label}>
                      {i > 0 && " · "}
                      <a href={link.url!} className="font-bold text-white" target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <div className="px-4 pb-12 sm:px-6 sm:pb-[88px]">
        <div
          data-placeholder=""
          role="img"
          aria-label="[Map: District office location — embedded Google Map]"
          className="mx-auto flex h-[220px] max-w-content flex-col items-center justify-center gap-2.5 rounded-[22px] bg-line p-4 text-center text-[15px] font-semibold text-slate sm:h-[320px]"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          [Map: District office location — embedded Google Map]
        </div>
      </div>

      <section aria-labelledby="faq" className="bg-mist px-4 py-12 sm:px-6 sm:py-[88px]">
        <div className="mx-auto flex max-w-[900px] flex-col gap-7">
          <SectionHeading id="faq" align="center" eyebrow="Before you write" title="Frequently asked questions" />
          <div className="flex flex-col gap-3">
            {contactPage.faqs.map((faq, i) => (
              // Native disclosure: Enter/Space toggle, no JS. First one open, as in the design.
              <details
                key={faq.question}
                open={i === 0}
                className="group overflow-hidden rounded-2xl border border-line bg-white"
              >
                <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 px-[22px] py-[18px] text-[17px] font-bold text-teal-900 [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <span aria-hidden="true" className="shrink-0 text-[22px] leading-none text-gold-text">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <p className="px-[22px] pb-5 text-[15px] leading-[1.65] text-slate">
                  {faq.answer}{" "}
                  {faq.link && (
                    <Link href={faq.link.href} className="font-bold">
                      {faq.link.label}
                    </Link>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
