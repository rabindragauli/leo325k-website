// Resource library (design/source/public/Resources.dc.html, `all` array).
// Seed rule (docs/08): files stay unpublished until a real file is uploaded; only the 2 official
// links are published (their URLs are an open placeholder, so the buttons render disabled).
// "Essentials" order (featuredOrder) follows the design: Logo Pack, Monthly Report, Orientation Guide.
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
  options?: { featuredOrder?: number },
];

const rows: Row[] = [
  ["Forms", "DOCX", "Leo Club Charter Application", "Application to charter a new Leo club, signed by the sponsoring Lions club."],
  ["Forms", "DOCX", "New Member Registration Form", "Details for adding new Leos to your club roster."],
  ["Forms", "DOCX", "Club Officers Report Form", "Report your newly elected club officers for the Leo Year."],
  ["Club Administration", "DOCX", "Monthly Club Report Template", "Standard monthly report format for club secretaries.", { featuredOrder: 2 }],
  ["Club Administration", "PDF", "Club Secretary & Treasurer Handbook", "Record keeping, minutes, dues and simple accounts for club officers."],
  ["Club Administration", "DOCX", "Meeting Minutes Template", "Ready-to-use format for recording club meetings."],
  ["District Documents", "PDF", "District Constitution & By-laws", "Official rules governing Leo District Council 325 K."],
  ["District Documents", "PDF", "District Policy & Code of Conduct", "Expected conduct for Leos, officers and district programs."],
  ["Brand & Logos", "ZIP", "Official Leo Logo Pack", "Emblem files in PNG and SVG, in color, white and black versions.", { featuredOrder: 1 }],
  ["Brand & Logos", "DOCX", "District Letterhead Template", "Official letterhead for district and club correspondence."],
  ["Brand & Logos", "DOCX", "Certificate of Appreciation Template", "Editable certificate for recognizing members and partners."],
  ["Training & Guides", "PDF", "New Leo Orientation Guide", "What every new member should know about the Leo program.", { featuredOrder: 3 }],
  ["Training & Guides", "PDF", "Club President’s Leadership Guide", "Planning the year, running meetings and leading your team."],
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
  featured: options.featuredOrder !== undefined,
  featuredOrder: options.featuredOrder ?? null,
  published: type === "LINK",
  sort,
}));
