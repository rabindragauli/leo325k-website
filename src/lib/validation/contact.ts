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

export const CLUB_TOPIC = "Contact a Leo club" satisfies (typeof contactTopics)[number];

// Messages match the design's inline errors. Shared by the form (Sprint 2) and the server action (Sprint 6).
export const contactSchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name.").max(100),
    email: z.string().trim().pipe(z.email("Please enter a valid email address.")),
    phone: z
      .string()
      .trim()
      .max(20)
      .regex(/^[0-9+\-\s()]*$/, "Use digits only, e.g. 98XXXXXXXX.")
      .optional()
      .or(z.literal("")),
    topic: z.enum(contactTopics),
    club: z.string().trim().optional(),
    message: z.string().trim().min(1, "Please write a short message.").max(5000),
    consent: z.literal(true, "Please tick the box so we can reply to you."),
  })
  .refine((v) => v.topic !== CLUB_TOPIC || !!v.club, {
    path: ["club"],
    message: "Please choose a club.",
  });

export type ContactInput = z.input<typeof contactSchema>;
