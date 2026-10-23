import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Placeholder } from "@/components/ui/Placeholder";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Dev-only gallery to compare components with design/screens/public/13_StyleGuide.png.
export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const swatches = [
  ["Theme Teal", "bg-teal-900", "#1B3A4B · nav bar, headings, dark bands"],
  ["Banner Teal", "bg-teal-700", "#244D63 · cards on dark bands"],
  ["Theme Purple", "bg-purple", "#762B94 · banner, accents"],
  ["Theme Yellow", "bg-yellow", "#FCCC0A · primary buttons, active page"],
  ["Theme Orange", "bg-orange", "#F6961E · divider lines"],
  ["Ink", "bg-ink", "#14213D · body text"],
  ["Slate", "bg-slate", "#4A5568 · secondary text"],
] as const;

// Sample URLs: real social links are an open placeholder (docs/08)
const sampleSocial = [
  { label: "Facebook", url: "https://example.org/facebook" },
  { label: "Instagram", url: "https://example.org/instagram" },
  { label: "YouTube", url: "https://example.org/youtube" },
];

const subheading = "font-heading text-xl font-bold text-ink";

export default function StyleGuidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-16 px-4 py-14 sm:px-6">
      <SectionHeading as="h1" eyebrow="Website UI v2 · LY 2026–27 theme" title="Style guide" />

      <section className="flex flex-col gap-5">
        <h2 className={subheading}>Colors</h2>
        <ul role="list" className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
          {swatches.map(([name, bg, note]) => (
            <li key={name} className="flex flex-col gap-2">
              <span className={`h-24 rounded-card border border-line ${bg}`} />
              <span className="font-bold text-ink">{name}</span>
              <span className="text-sm text-slate">{note}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <h2 className={subheading}>Typography</h2>
          <p className="font-heading text-display font-black text-teal-900">Display 56</p>
          <p className="font-heading text-h2 font-bold text-teal-900">Heading 38</p>
          <p className="text-card-title font-bold text-teal-900">Card title 20 · Public Sans Bold</p>
          <p className="text-slate">
            Body 16 / 1.6 — Public Sans Regular. Used for descriptions, messages and reports.
          </p>
          <p className="text-eyebrow font-bold tracking-[1px] text-gold-text uppercase">
            Eyebrow 13 · uppercase
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className={subheading}>Buttons &amp; chips</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <ButtonLink href="/style-guide" variant="text">
              Text link
            </ButtonLink>
          </div>
          <div className="flex flex-wrap gap-3">
            <Chip>District</Chip>
            <Chip tone="gold">Service</Chip>
            <Chip>Region</Chip>
            <Chip tone="gold">Training</Chip>
          </div>
          <Button size="lg" className="self-start">
            Large button
          </Button>

          <h2 className={subheading}>Cards</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <p className="text-eyebrow font-bold text-gold-text uppercase">Role</p>
              <p className="text-card-title font-bold text-teal-900">Person card</p>
              <p className="text-sm text-slate">Home club only — no phone numbers</p>
            </Card>
            <Card>
              <p className="text-sm font-bold text-gold-text">District · Service</p>
              <p className="text-card-title font-bold text-teal-900">Event card</p>
              <p className="text-sm text-slate">Date badge + chips</p>
            </Card>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-5">
        <h2 className={subheading}>Breadcrumb, placeholder, empty state</h2>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Style guide" }]} />
        <p>
          Email: <Placeholder>[official district email]</Placeholder>
        </p>
        <EmptyState
          title="No resources match your search"
          action={<Button variant="outline">Clear filters</Button>}
        >
          Try a different word or choose another category.
        </EmptyState>
      </section>

      <section className="flex flex-col gap-5 rounded-panel bg-teal-900 p-8">
        <SectionHeading
          tone="dark"
          eyebrow="Dark band"
          title="Social links (sample URLs)"
          lead="Pills render only when a URL is set; the live footer hides them until the council supplies the links."
        />
        <SocialLinks links={sampleSocial} pillClassName="border-teal-500 text-sm" />
      </section>
    </div>
  );
}
