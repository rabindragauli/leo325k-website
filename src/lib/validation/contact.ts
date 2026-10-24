import { z } from "zod";

// Topics from docs/04 / design/source/public/Contact.dc.html (order as shown in the form).
export const contactTopics = [
  "General inquiry",
  "Contact a Leo club",
  "Join or start a club",
  "Partnership & sponsorship",
  "Media & press",
  "Website feedback",
  "Other",
] as const;

// Nepal mobile numbers: 10 digits starting 96, 97 or 98
const NEPAL_MOBILE = /^9[678]\d{8}$/;
export const PHONE_MESSAGE = "Please enter a 10-digit mobile number starting with 96, 97 or 98.";

/** Strips spaces, hyphens and a leading +977 / 977 country code: "+977 981-234 5678" → "9812345678". */
export function normalizeNepalMobile(input: string): string {
  const compact = input.replace(/[\s-]/g, "");
  // Country code only when a full 10-digit number follows (keeps a number that itself starts 977)
  return compact.replace(/^\+?977(?=\d{10}$)/, "");
}

export const CLUB_TOPIC = "Contact a Leo club" satisfies (typeof contactTopics)[number];

/** Short ?topic= keys for links into the form, e.g. /contact?topic=club&club=<slug> (Clubs page). */
export const topicKeys: Record<string, (typeof contactTopics)[number]> = {
  general: "General inquiry",
  club: CLUB_TOPIC,
  join: "Join or start a club",
  partnership: "Partnership & sponsorship",
  media: "Media & press",
  feedback: "Website feedback",
  other: "Other",
};

// Messages match the design's inline errors. Shared by the form (Sprint 2) and the server action (Sprint 6).
export const contactSchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name.").max(100),
    email: z.string().trim().pipe(z.email("Please enter a valid email address.")),
    // Optional. Saved normalised: "+977 98-1234 5678" → "9812345678"
    phone: z
      .string()
      .max(30)
      .optional()
      .transform((v) => normalizeNepalMobile(v ?? ""))
      .refine((v) => v === "" || NEPAL_MOBILE.test(v), PHONE_MESSAGE),
    topic: z.enum(contactTopics),
    club: z.string().trim().optional(),
    message: z.string().trim().min(1, "Please write a short message.").max(5000),
    consent: z.literal(true, "Please tick the box so we can reply to you."),
  })
  .refine((v) => v.topic !== CLUB_TOPIC || !!v.club?.trim(), {
    path: ["club"],
    message: "Please choose a club.",
    // Zod 4 skips object refinements while other fields have issues; run it anyway so every
    // error shows on the first submit (the check only reads topic and club)
    when: (payload) => {
      const v = payload.value as { topic?: unknown; club?: unknown };
      return typeof v === "object" && v !== null;
    },
  });

export type ContactInput = z.input<typeof contactSchema>;
