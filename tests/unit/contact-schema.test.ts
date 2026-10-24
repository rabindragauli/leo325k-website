import { describe, expect, it } from "vitest";
import { CLUB_TOPIC, PHONE_MESSAGE, contactSchema, normalizeNepalMobile } from "@/lib/validation/contact";

const valid = {
  name: "Test Person",
  email: "test@example.org",
  phone: "",
  topic: "General inquiry",
  message: "Hello",
  consent: true,
};

const errors = (input: unknown) => {
  const result = contactSchema.safeParse(input);
  return result.success ? {} : Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]));
};

describe("contactSchema", () => {
  it("accepts a complete message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("uses the design's error messages", () => {
    expect(errors({ ...valid, name: " ", email: "nope", message: "", consent: false })).toEqual({
      name: "Please enter your name.",
      email: "Please enter a valid email address.",
      message: "Please write a short message.",
      consent: "Please tick the box so we can reply to you.",
    });
  });

  it("reports the missing club together with the other errors", () => {
    expect(Object.keys(errors({ topic: CLUB_TOPIC, name: "", email: "", message: "", consent: false })).sort()).toEqual(
      ["club", "consent", "email", "message", "name"],
    );
  });

  it("requires a club for the club topic", () => {
    expect(errors({ ...valid, topic: CLUB_TOPIC })).toHaveProperty("club");
    expect(contactSchema.safeParse({ ...valid, topic: CLUB_TOPIC, club: "baglung-kaligandaki" }).success).toBe(true);
  });

  it("rejects unknown topics", () => {
    expect(errors({ ...valid, topic: "Spam" })).toHaveProperty("topic");
  });
});

describe("phone (optional Nepal mobile)", () => {
  const phone = (value: string | undefined) => contactSchema.safeParse({ ...valid, phone: value });

  it("is optional", () => {
    expect(phone(undefined).success).toBe(true);
    expect(phone("").success).toBe(true);
    expect(phone("   ").success).toBe(true);
  });

  it("accepts 96/97/98 numbers and saves them normalised", () => {
    for (const [input, saved] of [
      ["9812345678", "9812345678"],
      ["981-234-5678", "9812345678"],
      ["981 234 5678", "9812345678"],
      ["+977 981-234 5678", "9812345678"],
      ["+9779812345678", "9812345678"],
      ["9779712345678", "9712345678"],
      ["9612345678", "9612345678"],
    ]) {
      const result = phone(input);
      expect(result.success, input).toBe(true);
      expect(result.data?.phone, input).toBe(saved);
    }
  });

  it("rejects anything else with the phone message", () => {
    for (const input of ["call me", "981234567", "98123456789", "9512345678", "0812345678", "+977 01-4123456", "(981) 234 5678", "+1 981 234 5678"]) {
      expect(errors({ ...valid, phone: input }).phone, input).toBe(PHONE_MESSAGE);
    }
  });
});

describe("normalizeNepalMobile", () => {
  it("strips spaces, hyphens and a +977/977 prefix only before 10 digits", () => {
    expect(normalizeNepalMobile(" +977 98-1234-5678 ")).toBe("9812345678");
    expect(normalizeNepalMobile("9771234567")).toBe("9771234567");
  });
});
