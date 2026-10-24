import type { Metadata } from "next";
import Link from "next/link";
import { ResourceLibrary } from "@/components/public/ResourceLibrary";
import { ButtonLink } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Placeholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { resourcesPage } from "@/data/content";
import { resourceType } from "@/lib/resources";
import { contactHref } from "@/lib/site";
import { getResourceLibrary, type ResourceItem } from "@/server/queries/public";

export const metadata: Metadata = {
  title: "Resources",
  description: "Official forms, templates, logos and guides for Leo clubs in District 325 K.",
};

function EssentialCard({ item }: { item: ResourceItem }) {
  const action = item.kind === "LINK" ? "Visit" : "Download";
  const body = (
    <>
      <span className="self-start rounded-lg bg-yellow px-2.5 py-1 text-xs font-black tracking-[0.5px] text-teal-900">
        {resourceType(item)}
      </span>
      <h3 className="font-heading text-[22px] leading-[1.25] font-bold">{item.title}</h3>
      <p className="text-[15px] leading-[1.55] text-on-dark-2">{item.description}</p>
      {item.href ? (
        <span className="text-[15px] font-bold text-yellow">{action} →</span>
      ) : (
        <Placeholder className="text-sm text-on-dark-muted">[file not yet uploaded]</Placeholder>
      )}
    </>
  );
  const classes = "flex h-full flex-col gap-3 rounded-[20px] bg-teal-900 p-[26px] text-white no-underline";
  return item.href ? (
    <a href={item.href} download className={`${classes} hover:bg-teal-700 hover:text-white`}>
      {body}
    </a>
  ) : (
    <div className={classes}>{body}</div>
  );
}

// design/source/public/Resources.dc.html (desktop) · MResources.dc.html (mobile). Prerendered.
// Only published resources are listed; categories without one are hidden (getResourceLibrary).
export default async function ResourcesPage() {
  const library = await getResourceLibrary();

  return (
    <>
      <ResourceLibrary items={library.items} categories={library.categories}>
        {library.featured.length > 0 && (
          <section aria-labelledby="essentials" className="px-4 pt-12 pb-2 sm:px-6 sm:pt-16 sm:pb-6">
            <div className="mx-auto flex max-w-content flex-col gap-6">
              <SectionHeading id="essentials" eyebrow="Start here" title="Essentials for every club" />
              <ul role="list" className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-5">
                {library.featured.map((item) => (
                  <li key={item.id}>
                    <EssentialCard item={item} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </ResourceLibrary>

      <section aria-label="More help" className="bg-mist px-4 py-12 sm:px-6 sm:py-[72px]">
        <div className="mx-auto flex max-w-content flex-wrap gap-6">
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-3 rounded-[20px] border border-line bg-white p-6 sm:p-8">
            <h2 className="font-heading text-[26px] font-bold text-teal-900">Can’t find a document?</h2>
            <p className="text-base leading-[1.6] text-slate">
              Email the district office and we’ll send it, or add it here if other clubs need it too.
            </p>
            {/* Design links to mailto:[official-district-email]; until the address is set, use the contact form */}
            <ButtonLink href={contactHref} className="self-start">
              Request a document
            </ButtonLink>
          </div>
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-3 rounded-[20px] bg-teal-900 p-6 text-white sm:p-8">
            <h2 className="font-heading text-[26px] font-bold">Using the Leo logo correctly</h2>
            <p className="text-base leading-[1.6] text-on-dark-2">
              Use only the official files from this page. Don’t stretch, recolor or redraw the emblem; keep clear space
              around it.
            </p>
            {resourcesPage.brandGuidelinesUrl && (
              <Link href={resourcesPage.brandGuidelinesUrl} className="self-start text-[15px] font-bold text-white">
                See brand guidelines →
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
