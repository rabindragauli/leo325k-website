// Leo Years, people, positions, President extras and Our Pride
// (design/source/public/Leadership.dc.html, design/source/admin/Leadership.dc.html, Main.dc.html).
// Contact details and photos are not supplied: null (phone/email also stay private by default).
import type { Award, JourneyStep, LeoYear, Person, Position, PrideEntry } from "./types";

export const leoYears: LeoYear[] = [
  {
    id: "ly-2025-26",
    label: "2025–26",
    startsOn: "2025-07-01",
    endsOn: "2026-06-30",
    isCurrent: false,
    published: true,
    publishedAt: null,
  },
  {
    id: "ly-2026-27",
    label: "2026–27",
    startsOn: "2026-07-01",
    endsOn: "2027-06-30",
    isCurrent: true,
    published: false, // team announced after installation → public page shows "coming soon"
    publishedAt: null,
  },
];

function person(
  id: string,
  prefix: string,
  fullName: string,
  home: { clubId?: string; lionsClub?: string } = {},
): Person {
  return {
    id,
    prefix,
    fullName,
    photo: null,
    homeClubId: home.clubId ?? null,
    homeLionsClub: home.lionsClub ?? null,
    membershipId: null,
    phone: null,
    phonePublic: false,
    email: null,
    emailPublic: false,
    consentAt: null,
  };
}

// One record per human: Prativa Shrestha is both 2025–26 District President and in Our Pride.
export const people: Person[] = [
  person("p-prativa-shrestha", "Leo", "Prativa Shrestha", { clubId: "club-kathmandu-machhapokhari" }),
  person("p-ashish-lamichhane", "Leo", "Ashish Lamichhane", { clubId: "club-pokhara-silver-mountains" }),
  person("p-smarika-thapa", "Leo", "Smarika Thapa", { clubId: "club-kathmandu-rainbow-city" }),
  person("p-sugam-khadka", "Leo", "Sugam Khadka", { clubId: "club-baglung-kaligandaki" }),
  person("p-durga-prasad-humagain", "MJF Lion", "Durga Prasad Humagain", {
    lionsClub: "LC Pokhara Peace Chautari",
  }),
  person("p-ramesh-adhikari", "PMJF Lion", "Ramesh Adhikari", { lionsClub: "LC Kathmandu Manamaiju" }),
  person("p-bishnu-hari-phuyal", "PMJF Lion", "Bishnu Hari Phuyal", {
    lionsClub: "LC Kathmandu Metro City",
  }),
  person("p-triza-dhakal", "PMJF Lion", "Triza Dhakal", { lionsClub: "LC Kathmandu Dirghajeevi" }),
  person("p-ram-kumar-lamichhane", "Lion", "Ram Kumar Lamichhane"), // home club: open placeholder
  person("p-shekhar-karki", "Lion", "Shekhar Karki"),
  person("p-rajendra-baral", "Leo-Lion", "Rajendra Baral"),
  person("p-binayak-poudel", "Leo-Lion", "Binayak Poudel"),
  person("p-deepti-neupane", "Leo", "Deepti Neupane"),
];

const presidentMessage2025 =
  "Welcome to Leo District Council 325 K Nepal. This year our focus is practical service, stronger district coordination, youth leadership development, and better public visibility of club impact. I invite every club and every Leo to serve with discipline, creativity, and compassion.";

function position(
  personId: string,
  group: Position["group"],
  role: string,
  sortOrder: number,
  message: string | null = null,
): Position {
  return {
    id: `pos-2025-26-${group.toLowerCase()}-${sortOrder}`,
    personId,
    leoYearId: "ly-2025-26",
    group,
    role,
    clubId: null,
    message,
    sortOrder,
  };
}

export const positions: Position[] = [
  position("p-prativa-shrestha", "DISTRICT_LEO", "District President", 0, presidentMessage2025),
  position("p-ashish-lamichhane", "DISTRICT_LEO", "Vice District President", 1),
  position("p-smarika-thapa", "DISTRICT_LEO", "District Secretary", 2),
  position("p-sugam-khadka", "DISTRICT_LEO", "District Treasurer", 3),
  position("p-durga-prasad-humagain", "DISTRICT_LION", "District Governor", 0),
  position("p-ramesh-adhikari", "DISTRICT_LION", "First Vice District Governor", 1),
  position("p-bishnu-hari-phuyal", "DISTRICT_LION", "Second Vice District Governor", 2),
  position("p-triza-dhakal", "DISTRICT_LION", "Cabinet Secretary", 3),
  position("p-ram-kumar-lamichhane", "DISTRICT_LION", "Cabinet Treasurer", 4),
];

export const awards: Award[] = [
  ["District Governor Service Medal", "2024/25"],
  ["District Secretary Special Appreciation Award", "2023/24"],
  ["International Presidents' Certificate of Appreciation", "2022/23"],
  ["District Board Member of the Year", "2022/23"],
  ["District Board Member of the Month (August)", "2021/22"],
  ["Outstanding Club President of the Month (October)", "2020/21"],
  ["Leo of the Month (August), from RC", "2020/21"],
  ["Outstanding Club Vice President of the Month (September)", "2019/20"],
].map(([title, year], sort) => ({
  id: `award-prativa-${sort}`,
  personId: "p-prativa-shrestha",
  title,
  year,
  sort,
}));

export const journeySteps: JourneyStep[] = [
  ["2017/18", "Club General Member", "Leo Club of Kathmandu Machhapokhari"],
  ["2018/19", "Club Secretary", "Leo Club of Kathmandu Machhapokhari"],
  ["2019/20", "Club Vice President", "Leo Club of Kathmandu Machhapokhari"],
  ["2020/21", "Club President", "Leo Club of Kathmandu Machhapokhari"],
  ["2021/22", "Region Coordinator", "Leo District Council 325 B1, Nepal"],
  ["2022/23", "District Public Relation Officer", "Leo District Council 325 K, Nepal"],
  ["2023/24", "District Secretary", "Leo Multiple District 325 Nepal"],
  [
    "2024/25",
    "District Vice President · Multiple Tail Twister",
    "Leo District Council 325 K · Leo MD 325, Nepal",
  ],
  ["2025/26", "District President", "Leo District Council 325 K, Nepal"],
].map(([year, role, organisation], sort) => ({
  id: `journey-prativa-${sort}`,
  personId: "p-prativa-shrestha",
  year,
  role,
  organisation,
  sort,
}));

// Not tied to a Leo Year. Titles "MDP 325 B" / "DP 325 B" to be verified (docs/08).
export const prideEntries: PrideEntry[] = [
  ["p-shekhar-karki", "MDP 2010–11"],
  ["p-rajendra-baral", "MDP 325 B 2017–18"],
  ["p-binayak-poudel", "DP 325 B 2019–20"],
  ["p-deepti-neupane", "DP 325 K 2022–23"],
  ["p-prativa-shrestha", "DP 325 K 2025–26"],
].map(([personId, honorTitle], sort) => ({
  id: `pride-${sort}`,
  personId,
  honorTitle,
  note: null,
  sort,
}));
