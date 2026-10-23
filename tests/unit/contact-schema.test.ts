import { describe, expect, it } from "vitest";
import { CLUB_TOPIC, contactSchema } from "@/lib/validation/contact";

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

  it("requires a club for the club topic", () => {
    expect(errors({ ...valid, topic: CLUB_TOPIC })).toHaveProperty("club");
    expect(contactSchema.safeParse({ ...valid, topic: CLUB_TOPIC, club: "baglung-kaligandaki" }).success).toBe(true);
  });

  it("rejects unknown topics and non-numeric phones", () => {
    expect(errors({ ...valid, topic: "Spam" })).toHaveProperty("topic");
    expect(errors({ ...valid, phone: "call me" })).toHaveProperty("phone");
  });
});
