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
| 5 | Admin portal CRUD | 1.5–2 weeks |
| 6 | Contact form, messages, email | 2–3 evenings |
| 7 | Hardening: security, SEO, performance, tests | 1 week |
| 8 | Deploy to staging on Kailash Cloud | 2–3 evenings |
| 9 | Content load, District President review, go-live | depends on council |

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
- Data-access layer `src/server/queries/*` (server-only); public pages read from DB; ISR with `revalidatePath` tags
- Prisma `binaryTargets` include the server's OpenSSL target (see deploy doc)
- **Done when:** pages render from MySQL locally; seed is repeatable (`npm run db:seed` twice = same result).

## Sprint 4 — Auth, roles, sessions
- Login page at `/${ADMIN_SLUG}/login`; middleware rewrites `/${ADMIN_SLUG}/*` → internal `/admin/*`; direct `/admin` → 404
- Password (bcryptjs, cost 12) → if device not trusted, send 6-digit code (10 min expiry, 5 attempts) → trusted-device cookie 30 days
- DB sessions (random 32-byte token, store SHA-256 hash), 8 h idle / 7 day absolute expiry, logout everywhere
- `requireUser()`, `requireRole('ADMIN')` helpers used by every admin page/action; forgot-password via emailed one-time link
- Rate limits (DB-backed): login 5 / 15 min per email+IP, code 5 tries, password reset 3 / hour
- First admin created by `npm run admin:create` CLI (prompts for email), never by a public page
- **Done when:** Editor cannot reach Users & roles (UI and server both); tests cover role checks.

## Sprint 5 — Admin portal CRUD
- Layout: compact theme bar + sidebar (`design/screens/admin/*`), mobile layouts for Dashboard/Messages/Leadership/Edit club
- Screens in `docs/04_ROUTES_AND_SCREENS.md`: Dashboard, Leadership (+ publish year), Person editor (find-first flow), Our Pride, Clubs + Edit club (+ Club PVST), Resources, Site content (incl. Leo Year theme uploads), Users & roles, Activity log
- Uploads: type + size checks (images ≤ 5 MB, docs ≤ 20 MB, allow-list of MIME/extension), random file names, sharp resize (portraits 800×800, logos 1000 px, hero 1920 px) → WebP
- Every mutation: Zod → `requireRole` → Prisma → `ActivityLog` entry → `revalidatePath`
- Leadership pages are prerendered (`/leadership`, `/leadership/[year]` via `generateStaticParams`): publishing/archiving a Leo Year or editing a team must call `revalidatePath("/leadership")` and `revalidatePath("/leadership/[year]", "page")`, and Home (`/`) for the coming-soon card
- **Done when:** a non-technical Editor can publish the 2026–27 team, add a club with logo, upload a PDF, and see it live within a minute.

## Sprint 6 — Contact form, messages, email
- Server action: Zod + Turnstile verify + consent required + rate limit (5 / hour / IP) → save `Message` → email to `CONTACT_INBOX` (club topic includes club name) → success state
- Admin Messages inbox: filters, mark replied, archive, `mailto:` reply
- Dashboard “Send a test message” button
- Scheduled cleanup endpoint `/api/cron/daily?key=CRON_SECRET`: delete messages > 12 months, expired codes/sessions
- **Done when:** a real email arrives in the district inbox from staging; spam test without Turnstile token is rejected.

## Sprint 7 — Hardening
- Security headers + CSP (allow Turnstile only), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`
- SEO: per-page `metadata`, Open Graph image, `sitemap.ts`, `robots.ts` (disallow admin), canonical URLs, 301s for old `.html` URLs
- Performance: `next/image` sizes, lazy images, font subsetting, no layout shift; check PageSpeed mobile
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
