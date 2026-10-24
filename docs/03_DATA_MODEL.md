# 03 · Data Model

Start from `starter/prisma/schema.prisma`. Key ideas:

| Concept | Model | Rule |
|---|---|---|
| A Leo or Lion | `Person` | **One record per human, forever.** Never duplicate when they change role or year. |
| What they did in a year | `Position` (person × Leo Year × group × role [× club]) | A new Leo Year = new positions, old ones stay as archive. |
| Leo Year | `LeoYear` | Only one `isCurrent`. Public site shows the current year when `published`; otherwise shows “coming soon” + the latest published year below. |
| Our Pride | `PrideEntry` | Not tied to a Leo Year. |
| District President extras | `Position.message`, `Award`, `JourneyStep` | Shown on the Leadership page. |
| Clubs | `Club` + `Region` | `visible=false` hides from the public directory. Club PVST = `Position` with `group=CLUB` + `clubId`. |
| Resources | `Resource` + `ResourceCategory` | Public site shows **only `published=true`**; category hidden if it has none. **Sprint 3: add `featuredOrder Int?`** — order of the “Essentials for every club” cards (`featured=true`, ascending; design order: Logo Pack, Monthly Club Report Template, New Leo Orientation Guide). Essentials reuse the resource's own `description` (no separate blurb). |
| Editable site text | `SiteSetting` (JSON per key) | Validate each key's JSON with a Zod schema. |
| Yearly theme | `ThemeSet` per `LeoYear` | Header reads the current year's theme. |
| Contact | `Message` | Requires `consentAt`; auto-delete after 12 months. |
| Security | `User`, `Session`, `TrustedDevice`, `LoginCode`, `RateLimit`, `ActivityLog` | Store only **hashes** of tokens/codes; IPs stored as salted hashes. |

## Sprint 3 changes to the starter schema
- `datasource` has `shadowDatabaseUrl = env("SHADOW_DATABASE_URL")` (local `prisma migrate dev` only).
- **MariaDB 10.4 (XAMPP) compatible, no Json columns:** `SiteSetting.value` is `LongText`, `ThemeSet.banner`/`badges` are
  `Text`, each holding JSON text validated with Zod.
- `Resource.featuredOrder Int?` added (Essentials order); `LeoYear.startsOn`/`endsOn` are `@db.Date`.
- `Person.consentAt` is the “consent obtained on” date: phone/email are public only with the toggle on **and** a date.
- Known gap: `Position @@unique([leoYearId, group, role, clubId])` allows duplicate district roles because `clubId` is NULL
  (MySQL allows repeated NULLs); Sprint 5 validates it in the person editor.
- Seed rows keep their `src/data` ids (e.g. `p-prativa-shrestha`) as primary keys; new rows get cuids.

## Privacy by design
- `membershipId` is never selected by public queries (use explicit `select`, never return whole `Person` to the client).
- `phone` / `email` only when `phonePublic` / `emailPublic` is true **and** `consentAt` is set (cleared inside the loader,
  so private values never reach the cache). Covered by `npm run test:db` against the real database.
- Blood group is **not collected** in Phase 1.

## Launch-readiness checklist (Dashboard) — compute from data
District logo uploaded · official emails set · office address set · social links set · mission & vision set · hero/About photos uploaded ·
clubs complete (region, type, charter, sponsor) · club logos · Club PVST filled · resources with files · current Leo Year published ·
contact form tested (last successful test timestamp in `SiteSetting`).
