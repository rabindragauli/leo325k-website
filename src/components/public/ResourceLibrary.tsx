"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";
import { ALL, countByCategory, filterResources } from "@/lib/filters";
import { resourceType } from "@/lib/resources";
import type { ResourceItem } from "@/server/queries/public";

const DOWNLOAD = "M12 3v12m0 0l-5-5m5 5l5-5M4 21h16";
const EXTERNAL = "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6";

// File-type badge colours (Resources.dc.html `types`)
const badgeTones: Record<string, string> = {
  PDF: "bg-error-tint text-error",
  DOCX: "bg-doc-tint text-doc",
  ZIP: "bg-gold-tint text-gold-ink",
  LINK: "bg-line text-teal-900",
};

function Icon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/**
 * Download/Visit button. No file or URL attached yet (Sprint 2): a disabled button plus the open
 * placeholder, so there are no dead links.
 */
export function ResourceAction({ item }: { item: ResourceItem }) {
  const link = item.kind === "LINK";
  const label = link ? "Visit" : "Download";
  if (!item.href) {
    return (
      <span className="flex flex-col items-start gap-1 sm:items-end">
        <button
          type="button"
          disabled
          className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-btn border border-line bg-mist px-4 text-sm font-bold text-slate"
        >
          <Icon path={link ? EXTERNAL : DOWNLOAD} />
          {label}
        </button>
        <Placeholder className="text-xs text-slate">{link ? "[URL]" : "[file not yet uploaded]"}</Placeholder>
      </span>
    );
  }
  return (
    <a
      href={item.href}
      {...(link ? { target: "_blank", rel: "noopener noreferrer" } : { download: "" })}
      className="inline-flex min-h-11 items-center gap-2 rounded-btn border border-on-dark-2 px-4 text-sm font-bold text-teal-900 no-underline hover:border-teal-400"
    >
      <Icon path={link ? EXTERNAL : DOWNLOAD} />
      <span className="sr-only sm:not-sr-only">{label}</span>
      <span className="sr-only">
        {" "}
        {item.title}
        {link && " (opens in a new tab)"}
      </span>
    </a>
  );
}

function ResourceRow({ item }: { item: ResourceItem }) {
  const type = resourceType(item);
  return (
    <article className="flex flex-wrap items-center gap-4 rounded-2xl border border-line px-5 py-[18px]">
      <span
        aria-hidden="true"
        className={cn(
          "flex size-[52px] shrink-0 items-center justify-center rounded-[12px] text-xs font-black tracking-[0.5px]",
          badgeTones[type] ?? badgeTones.LINK,
        )}
      >
        {type}
      </span>
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
        <h3 className="text-[17px] font-bold text-teal-900">{item.title}</h3>
        <p className="text-sm leading-[1.5] text-slate">{item.description}</p>
        <p className="text-eyebrow text-slate">
          {item.category} · {item.kind === "LINK" ? "External website" : `${type} file`}
        </p>
      </div>
      <ResourceAction item={item} />
    </article>
  );
}

/**
 * Resource library: search in the dark intro, Essentials (server-rendered `children`) in between,
 * categories + results below (design/source/public/Resources.dc.html, MResources.dc.html).
 * Only published resources reach this component; without JavaScript all of them are listed.
 */
export function ResourceLibrary({
  items,
  categories,
  children,
}: {
  items: ResourceItem[];
  categories: string[];
  children?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const shown = filterResources(items, { query, category });
  const counts = countByCategory(items, categories, query);

  function reset() {
    setQuery("");
    setCategory(ALL);
    searchRef.current?.focus();
  }

  return (
    <>
      <section className="bg-teal-900 px-4 pt-10 pb-12 text-white sm:px-6 sm:pt-14 sm:pb-16">
        <div className="mx-auto flex max-w-content flex-col gap-6">
          <div className="flex max-w-[700px] flex-col gap-3">
            <Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />
            <h1 className="font-heading text-[2.25rem] leading-[1.05] font-black sm:text-display">Resources for Leos</h1>
            <p className="text-lg leading-[1.6] text-on-dark-2">
              Official forms, templates, logos and guides for running your club — all in one place, free to download.
            </p>
          </div>
          <div>
            <label htmlFor={`${id}-search`} className="sr-only">
              Search resources
            </label>
            <input
              ref={searchRef}
              id={`${id}-search`}
              type="search"
              placeholder="Search forms, templates, guides…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-controls={`${id}-results`}
              className="h-[54px] w-full max-w-[640px] rounded-[12px] border border-teal-500 bg-white px-[18px] text-base text-ink placeholder:text-slate"
            />
          </div>
        </div>
      </section>

      {children}

      <section aria-labelledby={`${id}-all`} className="px-4 pt-8 pb-12 sm:px-6 sm:pt-12 sm:pb-[88px]">
        <h2 id={`${id}-all`} className="sr-only">
          All resources
        </h2>
        <div className="mx-auto flex max-w-content flex-wrap items-start gap-6 md:gap-10">
          <div className="flex min-w-0 flex-[1_1_100%] flex-col gap-1.5 md:flex-[1_1_240px]">
            <p id={`${id}-cats`} className="hidden pb-2 pl-1 text-eyebrow font-bold tracking-[1px] text-gold-text uppercase md:block">
              Categories
            </p>
            <div
              role="group"
              aria-labelledby={`${id}-cats`}
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-1.5 md:overflow-visible md:px-0"
            >
              {[ALL, ...categories].map((c) => {
                const pressed = c === category;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-full px-3.5 text-left text-sm font-bold md:min-h-[46px] md:rounded-[12px] md:text-[15px]",
                      pressed ? "bg-teal-900 text-white" : "bg-mist text-ink hover:bg-line",
                    )}
                  >
                    <span>{c === ALL ? "All resources" : c}</span>
                    <span className="hidden text-eyebrow opacity-80 md:inline">
                      {counts[c]}
                      <span className="sr-only"> resources</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div id={`${id}-results`} className="flex min-w-0 flex-[999_1_640px] flex-col gap-3.5">
            <p aria-live="polite" className="text-[15px] font-semibold text-slate">
              {shown.length} {shown.length === 1 ? "resource" : "resources"} ·{" "}
              {category === ALL ? "All categories" : category}
            </p>
            {shown.length > 0 ? (
              <ul role="list" className="flex flex-col gap-3.5">
                {shown.map((item) => (
                  <li key={item.id}>
                    <ResourceRow item={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Nothing matches your search"
                action={
                  <Button variant="secondary" onClick={reset}>
                    Show all resources
                  </Button>
                }
              >
                Try different words, or ask the district office for the document.
              </EmptyState>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
