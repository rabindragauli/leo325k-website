import { describe, expect, it } from "vitest";
import {
  PUBLIC_BY_DEFAULT,
  VISIBILITY_FIELDS,
  isFieldPublic,
  type VisibilitySubject,
} from "@/lib/visibility";

// Person visibility (docs/07). Batch 5 extends these; the public loaders rely on isFieldPublic.
const unset: VisibilitySubject = {
  under18: false,
  designationPublic: null,
  homeClubPublic: null,
  membershipPublic: null,
  phonePublic: null,
  landlinePublic: null,
  emailPublic: null,
  bloodGroupPublic: null,
};
const allOn: VisibilitySubject = {
  under18: false,
  designationPublic: true,
  homeClubPublic: true,
  membershipPublic: true,
  phonePublic: true,
  landlinePublic: true,
  emailPublic: true,
  bloodGroupPublic: true,
};
const publicFields = (person: VisibilitySubject) =>
  VISIBILITY_FIELDS.filter((f) => isFieldPublic(person, f));

describe("isFieldPublic", () => {
  it("defaults to designation and home club only (pending DP written confirmation)", () => {
    expect(PUBLIC_BY_DEFAULT).toEqual({
      designation: true,
      homeClub: true,
      membershipNo: false,
      cell: false,
      landline: false,
      email: false,
      bloodGroup: false,
    });
    expect(publicFields(unset)).toEqual(["designation", "homeClub"]);
  });

  it("lets a per-person switch override the default both ways", () => {
    expect(publicFields(allOn)).toEqual([...VISIBILITY_FIELDS]);
    expect(publicFields({ ...unset, homeClubPublic: false, emailPublic: true })).toEqual([
      "designation",
      "email",
    ]);
  });

  it("always hides contact fields, membership no. and blood group for under-18 members", () => {
    expect(publicFields({ ...allOn, under18: true })).toEqual(["designation", "homeClub"]);
  });
});
