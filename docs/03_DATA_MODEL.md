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

## Privacy by design
- `membershipId` is never selected by public queries (use explicit `select`, never return whole `Person` to the client).
- `phone` / `email` only when `phonePublic` / `emailPublic` is true.
- Blood group is **not collected** in Phase 1.

## Launch-readiness checklist (Dashboard) — compute from data
District logo uploaded · official emails set · office address set · social links set · mission & vision set · hero/About photos uploaded ·
clubs complete (region, type, charter, sponsor) · club logos · Club PVST filled · resources with files · current Leo Year published ·
contact form tested (last successful test timestamp in `SiteSetting`).
