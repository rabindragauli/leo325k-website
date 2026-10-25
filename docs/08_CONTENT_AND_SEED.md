# 08 · Content and Seed Data

## Seed from the designs (exact data lives in each file's `renderVals()`)
| Data | Source file |
|---|---|
| Leo Years 2025–26 (published, archived) and 2026–27 (current, **not published**) | `design/source/public/Leadership.dc.html` |
| 2025–26 District Leo PVST (Prativa Shrestha, Ashish Lamichhane, Smarika Thapa, Sugam Khadka) incl. President's message, 8 awards, 9 journey steps | `design/source/public/Leadership.dc.html`, `design/source/admin/Leadership.dc.html` |
| 2025–26 District Lion PVST (5 Lions) | same |
| Our Pride (5 entries) | `design/source/admin/Leadership.dc.html` |
| 4 clubs (Kathmandu Machhapokhari, Kathmandu Rainbow City, Pokhara Silver Mountains, Baglung Kaligandaki) | `design/source/public/Clubs.dc.html` |
| Resource categories + 15 resources (10 files + 2 links ready, 3 “being prepared” kept unpublished) | `design/source/public/Resources.dc.html` (`all` array) |
| About facts, motto pillars, 6 service focus areas, levels, Alpha/Omega text | `design/source/public/About.dc.html` |
| Contact topics, FAQs, desks | `design/source/public/Contact.dc.html` |
| Home hero text | `design/source/public/Main.dc.html` |
| Theme LY 2026–27: lines “LEADING WITH PURPOSE” / “EXECUTION WITH EXCELLENCE”, banner art + 5 badges | `assets/brand/` |

Seed files as **records without uploaded files** (resources start `published=false` until a real file is attached — except the 2 external links).

## Open placeholders (council must supply before launch)
| Placeholder | Where |
|---|---|
| `[official district email]`, president@/secretary@/membership@ addresses | Footer, Contact, Privacy |
| `[District office address]`, Google Maps link, office hours confirmation (“Sunday – Friday, 10:00 AM – 5:00 PM”) | Footer, Contact |
| `[2 working days]` reply time | Contact, Privacy |
| Home numbers: `[##]` clubs, `[###]` members, `[##]` service projects, `[#]` regions | Home |
| The 35 clubs (Excel → CSV, Sprint 5b): Club ID, name, region (I–V), charter date, sponsoring Lions club, meeting day/place, Facebook link, logo | Clubs, club pages |
| Region Coordinators per Leo Year (Region I–V) | Clubs / Leadership |
| Current-year club boards (P, V, S, T, M) with photos and photo consent | Club pages |
| Mission, vision, 1–2 sentences of district history | About |
| Hero photo, About photo, portraits (800 × 800) | Home, About, Leadership |
| Official district logo (PNG + SVG); 2× banner artwork and badges | Header, footer, favicon |
| 2026–27 district team (after installation) | Leadership |
| Social media URLs (Facebook, Instagram, YouTube): pills stay hidden until set (`socialLinks` in `src/lib/site.ts`) | Footer, mobile menu |
| `[date of launch]` | Privacy |
| Cabinet Treasurer's home club (2025–26) | Leadership |
| Verify Our Pride titles (“MDP 325 B”, “DP 325 B”) | Our Pride |
| `[If analytics is added at launch, name it here.]` | Privacy (Security and cookies) |
| Resource file sizes and update dates (`[size] · Updated [date]`), the files themselves, and the URLs of the 2 official links | Resources |
| `[Map: District office location — embedded Google Map]` | Contact |
| Brand guidelines document/URL (“See brand guidelines →” stays hidden until set: `resourcesPage.brandGuidelinesUrl`) | Resources |
| “Request a document” uses the contact form until `[official district email]` is set (design: `mailto:`) | Resources |

## Wording changes that need council approval
| Change | Where | Status |
|---|---|---|
| “What we collect”: *“Officers’ phone numbers and membership IDs are kept for district records and are never shown on the website.”* → *“Officers’ personal phone numbers and email addresses are shown only if the officer chooses to make them public. Membership IDs are kept for district records and are never shown on the website.”* (matches the phone/email public toggles) | Privacy | **Superseded:** rewrite to match the Phase 1 visibility rules (per-field switches, under-18 rule, blood group collected, address admin-only) once the District President confirms the default in writing; then council approval |

## Seed source (`src/data/*` → `prisma/seed.ts`)
Typed records shaped like the Prisma models, loaded by `prisma/seed.ts` (create-only upserts on their ids, so `npm run db:seed`
can run any number of times). Since Sprint 3 the pages read MySQL, not these files. Resources follow the rule above: only the
2 official links are published, so `/resources` shows the “Official Links” category only and the “Essentials” section stays
hidden until featured files are uploaded (`featuredOrder`: Logo Pack, Monthly Club Report, Orientation Guide).

Seeded rows: LeoYear 2 · Person 13 · Position 9 · Award 8 · JourneyStep 9 · PrideEntry 5 · Region 0 · Club 4 ·
ResourceCategory 6 · Resource 15 (2 published). `SiteSetting`, `ThemeSet` and `User` are not seeded (site text stays in
`src/data/content.ts` until Sprint 5a moves it to the DB). No real users are ever seeded: accounts come from
`npm run user:create` (Sprint 4), run by Rabindra; placeholders `user1` and `user2` (both Admin) until real names are chosen.

## Leadership content (Phase 1 decisions, docs/01)
- Sections per Leo Year, in this order: **District Board, District Advisors, District President Advisors** (all `Position`s
  with a group; an Admin can change the order).
- Person fields: **title** (Mr., Leo, Lion, Leo-Lion; kept separate from the name), name, designation, membership no., cell,
  optional landline, email, blood group, home club, optional address, photo, under-18 flag.
- Home club may be an unlisted club (older or other clubs, “listed in directory” off): selectable, never on the Clubs page.
- Devanagari text is allowed in fields (Devanagari font fallback); the site stays in English.

## Visibility rule for person fields (replaces the Sprint 3 consent rule)
- Per-person, per-field public switches for designation, home club, membership no., cell, landline, email and blood group.
- **Default: all hidden except designation and home club**, until the District President confirms in writing. The
  council proposes “public by default”: **pending DP written confirmation**. The default is one config value.
- Under-18 members: contact fields, membership no. and blood group always hidden (no override). Address is admin-only.
- Photos are public only after “photo consent confirmed” is ticked.
- Public queries filter in the query (docs/07). Changing a switch writes an **Activity log** entry. Seeded officers start
  with the defaults above.

## Old URLs → 301 redirects
`/leo.html` → `/leadership` · `/index.html` → `/` · (Rabindra to send the rest of the old `public_html` file list)
