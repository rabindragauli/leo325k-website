import Image from "next/image";
import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";
import { contactHref } from "@/lib/site";
import type { PersonCard } from "@/server/queries/public";

const avatarSizes = {
  lg: "size-[52px] border-2 text-[17px] sm:size-[88px] sm:border-[3px] sm:text-[26px]", // Our Pride (52 px on mobile)
  md: "size-[72px] border-[3px] text-[22px]", // District officers
  sm: "size-[60px] text-[19px]", // District Lion PVST
};

/** Portrait when uploaded, otherwise initials in a circle (design: Leadership/Main.dc.html). */
export function Avatar({
  name,
  initials,
  photo,
  size,
  tone = "light",
  className,
}: {
  name: string;
  initials: string;
  photo: string | null;
  size: keyof typeof avatarSizes;
  tone?: "light" | "dark";
  className?: string;
}) {
  const classes = cn(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-heading font-bold",
    avatarSizes[size],
    tone === "dark" ? "bg-teal-900 text-yellow" : "border-yellow bg-line text-teal-900",
    className,
  );
  if (photo) {
    return (
      <span className={classes}>
        <Image src={photo} alt={name} width={176} height={176} className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span className={classes} aria-hidden="true">
      {initials}
    </span>
  );
}

/** "Home club: …" value; unknown home club shows the open placeholder. */
export function HomeClub({ name }: { name: string | null }) {
  return name ? <>{name}</> : <Placeholder>[Home club]</Placeholder>;
}

/** Phone/email lines, rendered only when the person made them public (queries already filter). */
function PublicContact({ person }: { person: PersonCard }) {
  if (!person.phone && !person.email) return null;
  return (
    <p className="flex flex-col text-sm">
      {person.phone && (
        <a href={`tel:${person.phone.replace(/[^0-9+]/g, "")}`} className="font-semibold">
          {person.phone}
        </a>
      )}
      {person.email && (
        <a href={`mailto:${person.email}`} className="font-semibold break-all">
          {person.email}
        </a>
      )}
    </p>
  );
}

/** District Leo PVST card. */
export function OfficerCard({ person }: { person: PersonCard }) {
  return (
    <article className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-6">
      <Avatar name={person.name} initials={person.initials} photo={person.photo} size="md" />
      <p className="text-eyebrow font-bold tracking-[0.5px] text-gold-text uppercase">{person.role}</p>
      <h3 className="text-[19px] leading-[1.3] font-bold text-teal-900">{person.name}</h3>
      <p className="text-sm leading-[1.5] text-slate">
        <HomeClub name={person.homeClub} />
      </p>
      <PublicContact person={person} />
      <Link
        href={contactHref}
        className="mt-1 inline-flex min-h-11 items-center self-start rounded-btn border border-on-dark-2 px-3.5 text-sm font-bold text-teal-900 no-underline hover:border-teal-400"
      >
        Send a message
      </Link>
    </article>
  );
}

/** District Lion PVST card. */
export function LionCard({ person }: { person: PersonCard }) {
  return (
    <article className="flex flex-col gap-2.5 rounded-[18px] border border-line p-[22px]">
      <Avatar name={person.name} initials={person.initials} photo={person.photo} size="sm" tone="dark" />
      <p className="text-xs font-bold tracking-[0.5px] text-gold-text uppercase">{person.role}</p>
      <h3 className="text-[17px] leading-[1.3] font-bold text-teal-900">{person.name}</h3>
      <p className="text-sm text-slate">
        <HomeClub name={person.homeClub} />
      </p>
      <PublicContact person={person} />
    </article>
  );
}
