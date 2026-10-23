// Resource library (design/source/public/Resources.dc.html, `all` array).
// Sprint 2: the 12 "ready" items are published so the page matches the design; no file or URL is
// attached yet, so their buttons render as disabled placeholders. The 3 "being prepared" items stay
// unpublished. Sprint 3 seed follows docs/08 instead (files unpublished until a file is uploaded).
import type { Resource, ResourceCategory } from "./types";

export const resourceCategories: ResourceCategory[] = [
  "Forms",
  "Club Administration",
  "District Documents",
  "Brand & Logos",
  "Training & Guides",
  "Official Links",
].map((name, sort) => ({ id: `cat-${sort}`, name, sort }));

const categoryId = (name: string) => resourceCategories.find((c) => c.name === name)!.id;

type Row = [
  category: string,
  type: "PDF" | "DOCX" | "ZIP" | "LINK",
  title: string,
  description: string,
  options?: { soon?: boolean; featured?: boolean },
];

const rows: Row[] = [
  ["Forms", "DOCX", "Leo Club Charter Application", "Application to charter a new Leo club, signed by the sponsoring Lions club."],
  ["Forms", "DOCX", "New Member Registration Form", "Details for adding new Leos to your club roster."],
  ["Forms", "DOCX", "Club Officers Report Form", "Report your newly elected club officers for the Leo Year."],
  ["Club Administration", "DOCX", "Monthly Club Report Template", "Standard monthly report format for club secretaries.", { featured: true }],
  ["Club Administration", "PDF", "Club Secretary & Treasurer Handbook", "Record keeping, minutes, dues and simple accounts for club officers."],
  ["Club Administration", "DOCX", "Meeting Minutes Template", "Ready-to-use format for recording club meetings."],
  ["District Documents", "PDF", "District Constitution & By-laws", "Official rules governing Leo District Council 325 K.", { soon: true }],
  ["District Documents", "PDF", "District Policy & Code of Conduct", "Expected conduct for Leos, officers and district programs.", { soon: true }],
  ["Brand & Logos", "ZIP", "Official Leo Logo Pack", "Emblem files in PNG and SVG, in color, white and black versions.", { featured: true }],
  ["Brand & Logos", "DOCX", "District Letterhead Template", "Official letterhead for district and club correspondence."],
  ["Brand & Logos", "DOCX", "Certificate of Appreciation Template", "Editable certificate for recognizing members and partners."],
  ["Training & Guides", "PDF", "New Leo Orientation Guide", "What every new member should know about the Leo program.", { featured: true }],
  ["Training & Guides", "PDF", "Club President’s Leadership Guide", "Planning the year, running meetings and leading your team.", { soon: true }],
  ["Official Links", "LINK", "Leo Club Program — Lions Clubs International", "Global Leo resources, awards and program information."],
  ["Official Links", "LINK", "Leo Multiple District 325, Nepal", "Our multiple district’s official page."],
];

export const resources: Resource[] = rows.map(([category, type, title, description, options = {}], sort) => ({
  id: `res-${sort}`,
  title,
  description,
  categoryId: categoryId(category),
  kind: type === "LINK" ? "LINK" : "FILE",
  filePath: null,
  fileType: type === "LINK" ? null : type,
  fileSize: null,
  url: null,
  featured: options.featured ?? false,
  published: !options.soon,
  sort,
}));
