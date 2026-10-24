"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";
import { privacyHref } from "@/lib/site";
import { CLUB_TOPIC, contactSchema, contactTopics, topicKeys } from "@/lib/validation/contact";

type ClubOption = { slug: string; name: string };
type Topic = (typeof contactTopics)[number];
type Values = { name: string; email: string; phone: string; topic: Topic; club: string; message: string; consent: boolean };
type Field = keyof Values;

// DOM order: on submit, focus moves to the first of these that has an error
const FIELD_ORDER: Field[] = ["name", "email", "phone", "topic", "club", "message", "consent"];

const inputClasses =
  "w-full rounded-btn border bg-white px-3.5 text-base text-ink aria-[invalid=true]:border-form-error";

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function initialValues(clubs: ClubOption[], topicKey: string | null, clubSlug: string | null): Values {
  const topic = (topicKey && topicKeys[topicKey]) || "General inquiry";
  // Unknown slug: no prefill, no error
  const club = topic === CLUB_TOPIC && clubs.some((c) => c.slug === clubSlug) ? (clubSlug as string) : "";
  return { name: "", email: "", phone: "", topic, club, message: "", consent: false };
}

/**
 * Contact form UI (design/source/public/Contact.dc.html). Validates with the shared Zod schema.
 * Sprint 2 demo: nothing is sent (no action, no fetch); Sprint 6 connects the server action +
 * Turnstile and removes the demo note (docs/01).
 *
 * The page is prerendered; ?topic=&club= (e.g. "Contact this club") is applied once after mount.
 * One form instance throughout, so nothing the visitor has typed is ever replaced.
 */
export function ContactForm({ clubs, replyTime }: { clubs: ClubOption[]; replyTime: string }) {
  const id = useId();
  const [values, setValues] = useState<Values>(() => initialValues(clubs, null, null));
  const prefilled = useRef(false);

  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    const params = new URLSearchParams(window.location.search);
    const topicKey = params.get("topic");
    if (!topicKey || !topicKeys[topicKey]) return;
    const prefill = initialValues(clubs, topicKey, params.get("club"));
    // Only fields the visitor has not touched yet
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL after hydration
    setValues((v) =>
      v.topic === "General inquiry" && !v.club ? { ...v, topic: prefill.topic, club: prefill.club } : v,
    );
  }, [clubs]);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState<Values | null>(null);
  const fieldRefs = useRef<Partial<Record<Field, HTMLElement | null>>>({});
  const thanksRef = useRef<HTMLHeadingElement>(null);
  const isClub = values.topic === CLUB_TOPIC;

  const fid = (field: Field) => `${id}-${field}`;
  const describedBy = (field: Field, extra?: string) =>
    [errors[field] && `${fid(field)}-error`, extra].filter(Boolean).join(" ") || undefined;

  function update<K extends Field>(field: K, value: Values[K]) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = contactSchema.safeParse({ ...values, club: isClub ? values.club : undefined });
    if (!result.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as Field;
        next[field] ??= issue.message;
      }
      setErrors(next);
      const first = FIELD_ORDER.find((f) => next[f]);
      if (first) fieldRefs.current[first]?.focus();
      return;
    }
    // Sprint 6: call the server action here (Zod + Turnstile + rate limit + email).
    setErrors({});
    setSent(values);
    requestAnimationFrame(() => thanksRef.current?.focus());
  }

  function again() {
    setSent(null);
    setValues(initialValues(clubs, null, null));
    requestAnimationFrame(() => fieldRefs.current.name?.focus());
  }

  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`${fid(field)}-error`} className="text-eyebrow font-semibold text-form-error">
        {errors[field]}
      </p>
    ) : null;

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-3.5 py-6">
        <span className="flex size-[60px] items-center justify-center rounded-full bg-ok-tint text-ok">
          <CheckIcon />
        </span>
        <h2 ref={thanksRef} tabIndex={-1} className="font-heading text-[30px] font-bold text-teal-900 focus:outline-none">
          Thank you, {sent.name.trim()}!
        </h2>
        <p className="max-w-[520px] text-base leading-[1.6] text-slate">
          Your message about “{sent.topic}” has been sent. We’ll reply to {sent.email.trim()} within{" "}
          <Placeholder>{replyTime}</Placeholder>.
        </p>
        <p data-demo-note className="rounded-btn bg-warn-tint px-3 py-2 text-sm font-bold text-warn">
          <Placeholder>[Demo — form not connected until Sprint 6]</Placeholder>
        </p>
        <button
          type="button"
          onClick={again}
          className="min-h-[46px] rounded-btn border border-on-dark-2 bg-white px-5 text-[15px] font-bold text-teal-900"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby={`${id}-title`} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h2 id={`${id}-title`} className="font-heading text-[28px] font-bold text-teal-900">
          Send us a message
        </h2>
        <p className="text-[15px] text-slate">
          Fields marked * are required. We aim to reply within <Placeholder>{replyTime}</Placeholder>.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-[18px]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={fid("name")} className="text-sm font-bold">
            Full name *
          </label>
          <input
            ref={(el) => {
              fieldRefs.current.name = el;
            }}
            id={fid("name")}
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={cn(inputClasses, "h-[50px] border-on-dark-2")}
          />
          {errorText("name")}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fid("email")} className="text-sm font-bold">
            Email address *
          </label>
          <input
            ref={(el) => {
              fieldRefs.current.email = el;
            }}
            id={fid("email")}
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            className={cn(inputClasses, "h-[50px] border-on-dark-2")}
          />
          {errorText("email")}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fid("phone")} className="text-sm font-bold">
            Phone <span className="font-medium text-slate">(optional)</span>
          </label>
          <input
            ref={(el) => {
              fieldRefs.current.phone = el;
            }}
            id={fid("phone")}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="98XXXXXXXX"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
            className={cn(inputClasses, "h-[50px] border-on-dark-2 placeholder:text-slate")}
          />
          {errorText("phone")}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fid("topic")} className="text-sm font-bold">
            I’m contacting about
          </label>
          <select
            ref={(el) => {
              fieldRefs.current.topic = el;
            }}
            id={fid("topic")}
            value={values.topic}
            onChange={(e) => update("topic", e.target.value as Topic)}
            aria-invalid={!!errors.topic}
            aria-describedby={describedBy("topic")}
            className={cn(inputClasses, "h-[50px] border-on-dark-2")}
          >
            {contactTopics.map((topic) => (
              <option key={topic}>{topic}</option>
            ))}
          </select>
          {errorText("topic")}
        </div>

        {isClub && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={fid("club")} className="text-sm font-bold">
              Which club? *
            </label>
            <select
              ref={(el) => {
                fieldRefs.current.club = el;
              }}
              id={fid("club")}
              required
              value={values.club}
              onChange={(e) => update("club", e.target.value)}
              aria-invalid={!!errors.club}
              aria-describedby={describedBy("club", `${fid("club")}-hint`)}
              className={cn(inputClasses, "h-[50px] border-on-dark-2")}
            >
              <option value="">Choose a club…</option>
              {clubs.map((club) => (
                <option key={club.slug} value={club.slug}>
                  {club.name}
                </option>
              ))}
            </select>
            <p id={`${fid("club")}-hint`} className="text-xs text-slate">
              The district office forwards your message to the club.
            </p>
            {errorText("club")}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={fid("message")} className="text-sm font-bold">
          Message *
        </label>
        <textarea
          ref={(el) => {
            fieldRefs.current.message = el;
          }}
          id={fid("message")}
          rows={6}
          required
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
          className={cn(inputClasses, "resize-y border-on-dark-2 py-3 leading-[1.5]")}
        />
        {errorText("message")}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex min-h-11 items-start gap-2.5 text-sm leading-[1.5]">
          <input
            ref={(el) => {
              fieldRefs.current.consent = el;
            }}
            id={fid("consent")}
            type="checkbox"
            required
            checked={values.consent}
            onChange={(e) => update("consent", e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={describedBy("consent")}
            className="mt-px size-5 shrink-0 accent-teal-900"
          />
          <label htmlFor={fid("consent")}>
            I agree that the district may use my details to reply to this message, as described in the{" "}
            <Link href={privacyHref} className="font-bold">
              privacy notice
            </Link>
            . *
          </label>
        </div>
        {errorText("consent")}
      </div>

      {/* Sprint 6: the Cloudflare Turnstile widget renders here */}
      <div
        data-placeholder=""
        className="flex min-h-[65px] max-w-[300px] items-center justify-center rounded-btn border border-dashed border-on-dark-2 bg-mist px-4 text-center text-eyebrow font-semibold text-slate"
      >
        [Cloudflare Turnstile check — connected in Sprint 6]
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="inline-flex max-w-[440px] items-center gap-2 text-eyebrow leading-[1.5] text-slate">
          <ShieldIcon />
          Protected against spam by Cloudflare Turnstile. Your details are never shared.
        </p>
        <button
          type="submit"
          className="inline-flex min-h-[52px] items-center gap-2.5 rounded-[12px] bg-teal-900 px-[26px] text-base font-bold text-white hover:bg-teal-700"
        >
          <SendIcon />
          Send message
        </button>
      </div>
    </form>
  );
}
