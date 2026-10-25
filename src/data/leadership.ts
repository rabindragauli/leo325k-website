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

// Switches follow the default (null), except phone/email: explicitly hidden (false) as in migration
// 20261025180000_sprint5a, because nobody here consented under the old rule.
function person(id: string, title: string, fullName: string, homeClubId: string | null = null): Person {
  return {
    id,
    title,
    fullName,
    photo: null,
    photoConsent: false,
    under18: false,
    homeClubId,
    membershipId: null,
    phone: null,
    landline: null,
    email: null,
    bloodGroup: null,
    address: null,
    designationPublic: null,
    homeClubPublic: null,
    membershipPublic: null,
    phonePublic: false,
    landlinePublic: null,
    emailPublic: false,
    bloodGroupPublic: null,
  };
}

// One record per human: Prativa Shrestha is both 2025–26 District President and in Our Pride.
export const people: Person[] = [
  person("p-prativa-shrestha", "Leo", "Prativa Shrestha", "club-kathmandu-machhapokhari"),
  person("p-ashish-lamichhane", "Leo", "Ashish Lamichhane", "club-pokhara-silver-mountains"),
  person("p-smarika-thapa", "Leo", "Smarika Thapa", "club-kathmandu-rainbow-city"),
  person("p-sugam-khadka", "Leo", "Sugam Khadka", "club-baglung-kaligandaki"),
  person("p-durga-prasad-humagain", "MJF Lion", "Durga Prasad Humagain", "club-unlisted-lc-pokhara-peace-chautari"),
  person("p-ramesh-adhikari", "PMJF Lion", "Ramesh Adhikari", "club-unlisted-lc-kathmandu-manamaiju"),
  person("p-bishnu-hari-phuyal", "PMJF Lion", "Bishnu Hari Phuyal", "club-unlisted-lc-kathmandu-metro-city"),
  person("p-triza-dhakal", "PMJF Lion", "Triza Dhakal", "club-unlisted-lc-kathmandu-dirghajeevi"),
  person("p-ram-kumar-lamichhane", "Lion", "Ram Kumar Lamichhane"), // home club: open placeholder
  person("p-shekhar-karki", "Lion", "Shekhar Karki"),
  person("p-rajendra-baral", "Leo-Lion", "Rajendra Baral"),
  person("p-binayak-poudel", "Leo-Lion", "Binayak Poudel"),
  person("p-deepti-neupane", "Leo", "Deepti Neupane"),
];

const presidentMessage2025 =
  "Welcome to Leo District Council 325 K Nepal. This year our focus is practical service, stronger district coordination, youth leadership development, and better public visibility of club impact. I invite every club and every Leo to serve with discipline, creativity, and compassion.";

// Ids keep the Sprint 3 form ("district_leo" / "district_lion") so `db:seed` stays create-only on
// databases seeded before the groups were renamed.
const legacyIdGroup = { DISTRICT_BOARD: "district_leo", DISTRICT_ADVISORS: "district_lion" } as const;

function position(
  personId: string,
  group: keyof typeof legacyIdGroup,
  role: string,
  sortOrder: number,
  message: string | null = null,
): Position {
  return {
    id: `pos-2025-26-${legacyIdGroup[group]}-${sortOrder}`,
    personId,
    leoYearId: "ly-2025-26",
    group,
    role,
    clubId: null,
    message,
    sortOrder,
    status: "PUBLISHED",
  };
}

export const positions: Position[] = [
  position("p-prativa-shrestha", "DISTRICT_BOARD", "District President", 0, presidentMessage2025),
  position("p-ashish-lamichhane", "DISTRICT_BOARD", "Vice District President", 1),
  position("p-smarika-thapa", "DISTRICT_BOARD", "District Secretary", 2),
  position("p-sugam-khadka", "DISTRICT_BOARD", "District Treasurer", 3),
  position("p-durga-prasad-humagain", "DISTRICT_ADVISORS", "District Governor", 0),
  position("p-ramesh-adhikari", "DISTRICT_ADVISORS", "First Vice District Governor", 1),
  position("p-bishnu-hari-phuyal", "DISTRICT_ADVISORS", "Second Vice District Governor", 2),
  position("p-triza-dhakal", "DISTRICT_ADVISORS", "Cabinet Secretary", 3),
  position("p-ram-kumar-lamichhane", "DISTRICT_ADVISORS", "Cabinet Treasurer", 4),
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
