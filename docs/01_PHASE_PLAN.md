# 01 · Phase 1 Build Plan (Node.js / Next.js)

Owner: Rabindra Gauli · Hosting: Kailash Cloud Medium (cPanel, LiteSpeed, CloudLinux, MySQL, Node.js selector, SSH)
Rule: each sprint ends with lint + type-check + tests + `next build` passing, a summary, and a **stop for review**.

Estimates assume part-time work (evenings + Saturdays) with an AI agent doing most of the typing.

| Sprint | Goal | Approx. time |
|---|---|---|
| 0 | Project setup | 1–2 evenings |
| 1 | Design system + shared layout | 3–4 evenings |
| 2 | Public pages with seed data | 1 week |
| 3 | Database + seed + live data | 3–4 evenings |
| 4 | Auth, roles, sessions | 3–4 evenings |
| 5a | Admin: district board + advisors, site settings in the DB | 1 week |
| 5b | Admin: regions, clubs, club pages + boards, photos, CSV import | 1 week |
| 6 | Contact form, messages, email, password reset | 2–3 evenings |
| 7 | Hardening: security, SEO, performance, tests | 1 week |
| 8 | Deploy to staging on Kailash Cloud | 2–3 evenings |
| 9 | Content load, District President review, go-live | depends on council |

## Phase 1 decisions (Oct 2026)
These replace `MASTER_PROMPT.md` §2 and the older notes in these docs wherever they differ.
- **Scope is final.** Events/news are **out** (Phase 2, together with club login and online submissions).
- **Regions** are stored as numbers 1–5 and displayed in Roman numerals (Region I–V). Each region has a **Region Coordinator
  per Leo Year**, which is a `Position` (not a field on Region).
- **Clubs:** 35 clubs come from an Excel import in Sprint 5b (converted to CSV first; only public columns are committed).
  Each club has a public **Club ID** and **charter date**, and its own page with the **current-year board only**
  (P, V, S, T, M = President, Vice President, Secretary, Treasurer, Membership Chairperson) with photos, plus plain-text club
  info written by an admin (about, meeting day/place, Facebook link, sponsoring Lions club, logo). Board history stays in
  the DB and is not shown.
- **Home club** may be a club that is not in the public directory (older or other clubs): Club gets a **"listed in
  directory"** flag; unlisted clubs can be chosen as home clubs but never appear on the Clubs page.
- **Leadership page** sections per Leo Year, in this order: **District Board, District Advisors, District President
  Advisors**. All are `Position`s with a group; the order is configurable by an Admin.
- **Person fields:** title (Mr., Leo, Lion, Leo-Lion; separate from the name), name, designation, membership no., cell,
  optional landline, email, blood group, home club, optional address, photo, under-18 flag.
- **Person visibility** (details in docs/07): per-person and per-field "public" switches for designation, home club,
  membership no., cell, landline, email and blood group. Until the District President confirms in writing, all default to
  **hidden except designation and home club**. The council's proposal is "public by default": **pending DP written
  confirmation**; changing the default later is a single config value. Under-18 members: contact fields, membership no. and
  blood group always hidden, no override. Address is admin-only. Public queries read a field only when it is public
  (filtered in the query, not the UI). This replaces the earlier "no blood group / consent before public" rule.
- **Photos:** resized to WebP, EXIF/GPS stripped; a **"photo consent confirmed"** checkbox must be ticked before a photo is
  public (needed for under-18 members).
- **Nepali:** Devanagari text is allowed in fields, with a Devanagari font fallback (system fonts first; any webfont is a
  subset with `font-display: swap`). The site stays in English.
- **Publishing:** only Admins publish; Editors create and edit drafts only (enforced on the server, not just hidden in the UI).
- **Admin sign-in:** username + password (no email code in Sprint 4). The new-device email code is decided in Sprint 6, once
  SMTP works; password reset by email is Sprint 6.
- **Sprint 5 split:** 5a (district board + advisors, site settings moved from `src/data/content.ts` to the DB, font
  fallback) and 5b (regions, clubs, club pages, club boards, photos, CSV import).

---

## Sprint 0 — Project setup
- `npx create-next-app@latest leo325k --ts --tailwind --eslint --app --src-dir --import-alias "@/*"` (or equivalent inside this folder; keep `docs/`, `design/`, `assets/` at the repo root)
- `next.config.ts`: `output: 'standalone'`, `poweredByHeader: false`, images config, security headers stub, redirects stub
- Install: `prisma @prisma/client zod react-hook-form @hookform/resolvers bcryptjs nodemailer sharp`, dev: `vitest @playwright/test prettier`
- Copy `starter/prisma/schema.prisma`, `starter/.env.example`, `starter/app.js` into place
- Copy `assets/brand/*` → `public/brand/`
- Git: `.gitignore` covers `.env*` (except `.env.example`), `node_modules`, `.next`, uploads
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `db:migrate`, `db:seed`, `package:deploy`
- **Done when:** app runs locally on Node 20/22, `npm run build` creates `.next/standalone`, README has setup steps.

## Sprint 1 — Design system + shared layout
- Tailwind theme tokens from `docs/05_DESIGN_SYSTEM.md`; fonts via `next/font`
- Components: `SiteHeader` (full banner + nav, active page), `SiteHeaderMobile`, `MobileMenu`, `SiteFooter`, `SiteFooterMobile`, `Button`, `Chip`, `Card`, `SectionHeading`, `Breadcrumb`, `Placeholder` (bracketed text style), `EmptyState`
- Root layout with skip-link, metadata defaults, Open Graph defaults, favicon (Leo emblem)
- **Done when:** header/footer match `design/screens/public/14–17*.png` at 1440 and 390 px; keyboard navigation works.

## Sprint 2 — Public pages (static seed data in TypeScript)
- Pages: `/`, `/about`, `/leadership`, `/clubs`, `/resources`, `/contact`, `/privacy`, `not-found`
- Interactive bits: Leo Year switcher, club search + region/city filter, resource search + categories, FAQ accordion, contact form UI (no sending yet)
- **Done when:** every page matches its screenshot; Lighthouse accessibility ≥ 95 locally.

## Sprint 3 — Database + seed + live data
- Prisma schema (`docs/03_DATA_MODEL.md`), first migration, `prisma/seed.ts` with data from `docs/08_CONTENT_AND_SEED.md`
- Data-access layer `src/server/queries/*` (server-only); public pages read from DB; cached by tag (`use cache` + `cacheTag`, refreshed with `revalidateTag`)
- Prisma `binaryTargets` include the server's OpenSSL target (see deploy doc)
- **Done when:** pages render from MySQL locally; seed is repeatable (`npm run db:seed` twice = same result).
- **Decisions (done):**
  - Prisma 6.19.3 (pinned). MariaDB 10.4 compatible: no Json columns (JSON stored as text, validated with Zod). Seed is
    create-only upserts on the stable `src/data` ids; `npm run db:reset` (localhost only) reloads it.
  - Queries: `loaders.ts` (Prisma, explicit `select`, uncached, takes the client) → `public.ts` (`'use cache'` +
    `cacheLife("publicContent")` + `cacheTag`) → `views.ts` (pure view builders). Never `membershipId`; phone/email only when
    the public toggle is on **and** `consentAt` is set.
  - Rendering: `npm run build` needs **no database**. Home, Leadership, Clubs, Resources and Contact call `connection()` and
    render per request from the in-memory cache as complete HTML (`instant = false`, works without JavaScript).
    `/leadership/[year]` lists only a placeholder param, renders each year on first visit and stores it (ISR,
    `ensureStatic = "navigation"`), so 404 and the 307 for the current year are real statuses. The proxy only rejects
    malformed/implausible years (2015 … current year + 2) without touching the database.
  - Tags: `leadership` (Leo Years, positions, people, President extras, Our Pride), `clubs` (also refreshes
    `leadership`, which shows home club names), `resources`. Safety net: content revalidates every 15 minutes.

## Sprint 4 — Auth, roles, sessions
- Accounts: `User` (username, display name, role Admin|Editor, password hash, active, optional email). Usernames are trimmed,
  lowercase, unique, `[a-z0-9._-]{3,32}`. No users in the seed: `npm run user:create` (interactive, hidden password typed
  twice, bcryptjs cost 12, prints no secrets; refuses `NODE_ENV=production` without `--allow-production`)
- Passwords: min 12 characters, max 72 UTF-8 bytes (bcrypt limit), small targeted blocklist (docs/07), new ≠ current
- Sessions without an auth library: random 32-byte token in an httpOnly cookie (`__Host-leo_session` in production), only its
  SHA-256 hash in `Session`; 2 h idle / 12 h absolute, `lastSeen` written at most every 5 min, new token on every login,
  logout deletes the row, deactivating a user ends their sessions
- Login protection (DB-backed): one generic error; bcrypt compare always runs; per-username backoff only (never a hard
  lock); per IP and per username+IP 5 failures → 15 min lock; unknown usernames throttled the same; client IP from one
  helper (rightmost `X-Forwarded-For`); successes, failures, lockouts and logouts in `ActivityLog`
- Hidden admin path: `proxy.ts` rewrites `/${ADMIN_SLUG}/…` to an internal route; direct `/admin` and the internal route → 404;
  the slug never appears in client bundles, robots, sitemap, logs or responses to unauthenticated users (except the
  sign-in page at the slug itself)
- Defence in depth: `proxy.ts` is not the security boundary; every admin page, layout, route handler and server action calls
  `requireUser()` / `requireAdmin()` itself (server actions can be POSTed to any URL)
- Screens: sign-in (full banner) at `/${ADMIN_SLUG}`, empty dashboard shell (slim bar, name, sign out, change my password).
  No email code or password reset yet (Sprint 6)
- **Done when:** the e2e and unit tests in the Sprint 4 plan pass, and `npm run build` still works without a database.

## Sprint 5a — Admin: district leadership + site settings
- District Board, District Advisors, District President Advisors per Leo Year (Positions with a group, Admin-set order),
  Person editor with the new fields and visibility switches (Phase 1 decisions above), publish a year (Admin only)
- Site settings moved from `src/data/content.ts` to `SiteSetting` (Zod per key); Devanagari font fallback

## Sprint 5b — Admin: regions, clubs, photos, import
- Regions I–V with a Region Coordinator per Leo Year; clubs with Club ID, charter date, "listed in directory" flag, admin
  club info; a public page per club with the current-year P/V/S/T/M board
- Photos: WebP, EXIF/GPS stripped, "photo consent confirmed" before public
- CSV import of the 35 clubs (from the council's Excel file; only public columns committed)

## Sprint 5 — shared rules (5a and 5b)
- Layout: compact theme bar + sidebar (`design/screens/admin/*`), mobile layouts for Dashboard/Messages/Leadership/Edit club
- Screens in `docs/04_ROUTES_AND_SCREENS.md`: Dashboard, Leadership (+ publish year), Person editor (find-first flow), Our Pride, Clubs + Edit club (+ Club PVST), Resources, Site content (incl. Leo Year theme uploads), Users & roles, Activity log
- Uploads: type + size checks (images ≤ 5 MB, docs ≤ 20 MB, allow-list of MIME/extension), random file names, sharp resize (portraits 800×800, logos 1000 px, hero 1920 px) → WebP
- Every mutation: Zod → `requireRole` → Prisma → `ActivityLog` entry → `revalidateTag` (see the `TODO Sprint 5` in `src/server/queries/public.ts`)
- Public content is cached by tag (Sprint 3): leadership/people/Our Pride edits and publishing/archiving a Leo Year → `revalidateTag("leadership")` (also refreshes Home's coming-soon card and the stored `/leadership/<year>` pages); clubs/regions → `revalidateTag("clubs")`; resources → `revalidateTag("resources")`
- **Visibility rules, enforced on the server** (docs/07, Phase 1 decisions above): per-field public switches with the
  configured defaults, under-18 override, address admin-only, filtering inside the public queries; changes write an
  Activity log entry. This replaces the Sprint 3 `consentAt` rule
- **Publishing:** Editors save drafts only; every publish action calls `requireAdmin()`
- Position uniqueness: `@@unique([leoYearId, group, role, clubId])` does not stop a duplicate district role (`clubId` is NULL), so the person editor must check it
- After publishing a new Leo Year, its URL must stop returning a cached 404 (check that `revalidateTag('leadership')` clears it)
- **Done when:** a non-technical Editor can publish the 2026–27 team, add a club with logo, upload a PDF, and see it live within a minute.

## Sprint 6 — Contact form, messages, email, password reset
- Password reset by emailed one-time link (hash stored, short expiry, rate-limited); decide on the new-device email code
  (`TrustedDevice` / `LoginCode` tables are kept until then)
- Server action: Zod + Turnstile verify + consent required + rate limit (5 / hour / IP) → save `Message` → email to `CONTACT_INBOX` (club topic includes club name) → success state
- Admin Messages inbox: filters, mark replied, archive, `mailto:` reply
- Dashboard “Send a test message” button
- **TODO (from Sprint 2):** remove the “[Demo — form not connected until Sprint 6]” note and its `data-demo-note` from `src/components/public/ContactForm.tsx` once the server action is connected (and the e2e check that no POST is made)
- Scheduled cleanup endpoint `/api/cron/daily?key=CRON_SECRET`: delete messages > 12 months, expired codes/sessions
- **Done when:** a real email arrives in the district inbox from staging; spam test without Turnstile token is rejected.

## Sprint 7 — Hardening
- Security headers + CSP (allow Turnstile only), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`
- SEO: per-page `metadata`, Open Graph image, `sitemap.ts`, `robots.ts` (disallow admin), canonical URLs, 301s for old `.html` URLs
- Performance: `next/image` sizes, lazy images, font subsetting, no layout shift; check PageSpeed mobile
- Home/About mobile perf 85–87 on a busy machine; re-measure on an idle machine, then fonts + shared JS chunk.
- CI: update GitHub Actions off Node 20 (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`) and pin `runs-on` to `ubuntu-24.04`.
- Accessibility pass; Playwright smoke tests (all public pages 200, login flow, contact validation)
- `npm audit` clean of high/critical
- **Done when:** every item in the Plan v2 pre-launch checklist that is code-related is ticked.

## Sprint 8 — Deploy to staging (Kailash Cloud)
- Follow `docs/06_DEPLOY_KAILASH_CPANEL.md` on `staging.leodistrict325knepal.org` with a separate database
- **Done when:** staging works end to end (login, publish, upload, contact email), memory stays within the plan limits.

## Sprint 9 — Content, review, go-live
- Load real council content; District President walkthrough on staging; written sign-off
- Back up old `public_html`; switch the main domain; smoke test; submit sitemap to Google Search Console
- Hand over: “How to update” guide for the District Secretary, credentials in the council password manager, renewal date 19 Oct 2027
