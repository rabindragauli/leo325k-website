# 04 · Routes ↔ Screens ↔ Design files

Screens: `design/screens/public/*.png`, `design/screens/admin/*.png` (rendered at 1.5×). Markup + sample data: `design/source/**`.

## Public website
| Route | Desktop design | Mobile design | Notes |
|---|---|---|---|
| `/` | `01_Main` · `Main.dc.html` | `07_Mobile` · `Mobile.dc.html` | Hero, numbers band (`[##]` placeholders until council supplies), coming-soon team card, 3 explore cards, Our Pride |
| `/about` | `02_About` · `About.dc.html` | `20_MAbout` · `MAbout.dc.html` | Mission/vision from Site content |
| `/leadership` | `03_Leadership` | `09_MLeadership` | Current Leo Year: unpublished → coming-soon block + latest published team below; Our Pride after the year content. Prerendered |
| `/leadership/2025-26` | `03_Leadership` | `09_MLeadership` | Archived (published, not current) years, prerendered via `generateStaticParams`; current-year slug → 307 redirect to `/leadership`; unknown slug → 404 (both in `src/proxy.ts`). Year switcher = plain links. **Sprint 5:** after an admin publishes/archives a year or edits a team, `revalidatePath("/leadership")` and `revalidatePath("/leadership/[year]", "page")` |
| `/clubs` | `04_Clubs` | `10_MClubs` | Search, region select, city chips; card → “Contact this club” = `/contact?topic=club&club=<slug>` (pre-fills form) |
| `/resources` | `05_Resources` | `11_MResources` | Featured “Essentials” = `featured=true`; only published |
| `/contact` | `06_Contact` | `12_MContact` | Topics: General inquiry, Contact a Leo club (→ club picker), Join or start a club, Partnership & sponsorship, Media & press, Website feedback, Other |
| `/privacy` | `18_PrivacyNotice` | (responsive) | Linked from footer and consent tickbox |
| 404 | `19_NotFound` | (responsive) | `app/not-found.tsx` |
| Header/footer | `14_SiteHeader`, `15_SiteFooter` | `16_SiteHeaderMobile`, `17_SiteFooterMobile`, `08_MobileMenu` | One shared component each; active nav item underlined yellow |

## Admin portal (served at `/${ADMIN_SLUG}/…`)
| Route | Design | Who |
|---|---|---|
| `/` without a session: sign-in (Sprint 4) | `01_Login` (username instead of email; no “Forgot password?”, “Keep me signed in” or code note until Sprint 6) | public |
| `/` (dashboard; Sprint 4: empty shell with the slim bar) | `02_Main`, mobile `04_MobileDashboard` | Admin, Editor |
| `/password` (“Change my password”, Sprint 4) | (simple form) | Admin, Editor |
| `/reset` (Sprint 6) | `01_Login` | public |
| `/messages` | `03_Messages` | Admin, Editor |
| `/leadership` | `07_Leadership` | Admin, Editor |
| `/people/new`, `/people/[id]` | `08_PersonEditor` | Admin, Editor |
| `/clubs`, `/clubs/[id]` | `09_Clubs`, `10_ClubEditor` | Admin, Editor |
| `/resources` | `11_Resources` | Admin, Editor |
| `/content` | `12_Content` | Admin, Editor |
| `/users` | `13_Users` | **Admin only** |
| `/activity` | (simple table) | Admin, Editor |
| Shared | `05_Sidebar`, `06_AdminBanner` (compact bar on all screens except login) | |

How it is served (Sprint 4): `src/proxy.ts` rewrites `/<ADMIN_SLUG>/…` to the internal route `src/app/admin-internal/…`
and sets a gate header (HMAC of `AUTH_SECRET`) on that rewrite only. `/admin` and `/admin-internal` requested directly → 404.
Every admin page and server action checks the gate and the session itself (`src/server/auth/guards.ts`): no gate → 404,
no session → redirect to `/<ADMIN_SLUG>` (sign-in), Editor on an Admin-only screen → 404.
