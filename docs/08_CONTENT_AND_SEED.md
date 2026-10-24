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
| Region names; each club's region, type, charter year, sponsor, email, logo | Clubs |
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
| “What we collect”: *“Officers’ phone numbers and membership IDs are kept for district records and are never shown on the website.”* → *“Officers’ personal phone numbers and email addresses are shown only if the officer chooses to make them public. Membership IDs are kept for district records and are never shown on the website.”* (matches the phone/email public toggles) | Privacy | **Needs council approval** |

## Seed source (`src/data/*` → `prisma/seed.ts`)
Typed records shaped like the Prisma models, loaded by `prisma/seed.ts` (create-only upserts on their ids, so `npm run db:seed`
can run any number of times). Since Sprint 3 the pages read MySQL, not these files. Resources follow the rule above: only the
2 official links are published, so `/resources` shows the “Official Links” category only and the “Essentials” section stays
hidden until featured files are uploaded (`featuredOrder`: Logo Pack, Monthly Club Report, Orientation Guide).

Seeded rows: LeoYear 2 · Person 13 · Position 9 · Award 8 · JourneyStep 9 · PrideEntry 5 · Region 0 · Club 4 ·
ResourceCategory 6 · Resource 15 (2 published). `SiteSetting`, `ThemeSet` and `User` are not seeded (site text stays in
`src/data/content.ts` until the Site content screen in Sprint 5; the first admin comes from `npm run admin:create`).

## Consent rule for officers' phone/email (Sprint 3 / admin)
- Existing officers start **private**: `phonePublic = false`, `emailPublic = false`, `consentAt = null` in the seed.
- Turning a phone or email public toggle **on** requires a **“consent obtained on” date** (`Person.consentAt`). With no date, the
  toggle cannot be turned on (validated on the server, not only in the UI).
- Saving the date/toggle writes an **Activity log** entry with the admin's name, the person and the date.

## Old URLs → 301 redirects
`/leo.html` → `/leadership` · `/index.html` → `/` · (Rabindra to send the rest of the old `public_html` file list)
