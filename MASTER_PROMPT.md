# MASTER PROMPT — Leo District Council 325 K, Nepal · Phase 1 Website + Admin Portal

> Paste everything below the line into your AI coding agent (VS Code Copilot **Agent** mode, Claude Code, Cursor, etc.)
> with this build kit open as the workspace folder. Work one sprint at a time.

---

You are a senior full-stack engineer building **Phase 1 of the official website and admin portal for Leo District Council 325 K, Nepal**
(the youth program of Lions Clubs International District 325 K). The UI/UX is **already designed and approved**; your job is to turn
it into a secure, production-ready Node.js application and deploy it to **shared cPanel hosting (Kailash Cloud, Medium plan)**.

## 0. Read these first (in this workspace)

| File | What it gives you |
|---|---|
| `docs/00_Phase1_Plan_v2.pdf` | Approved scope, content inventory, privacy rules, launch checklist |
| `docs/01_PHASE_PLAN.md` | **The sprint plan you must follow, with Definition of Done per sprint** |
| `docs/02_ARCHITECTURE_AND_STACK.md` | Locked stack, folder structure, key decisions |
| `docs/03_DATA_MODEL.md` + `starter/prisma/schema.prisma` | Database design (start from this schema) |
| `docs/04_ROUTES_AND_SCREENS.md` | Every route ↔ design screen ↔ design source file |
| `docs/05_DESIGN_SYSTEM.md` | Colours, fonts, header sizes, breakpoints, components |
| `docs/06_DEPLOY_KAILASH_CPANEL.md` | Exact deployment steps for cPanel “Setup Node.js App” |
| `docs/07_SECURITY_AND_PRIVACY.md` | Mandatory security controls and privacy rules |
| `docs/08_CONTENT_AND_SEED.md` | Seed data and placeholder rules |
| `design/screens/**.png` | **Pixel reference** for every screen (desktop 1440 px, mobile 390 px) |
| `design/source/**.dc.html` | Design markup with exact inline styles and sample data in each `renderVals()` |
| `assets/brand/*.png` | Official banner artwork, logos and LY 2026–27 badges |

The `.dc.html` files are **design prototypes, not production code**. Use them for layout, spacing, colours, copy and sample data.
Rebuild them properly as React components with Tailwind classes. Ignore `support.js`, `<x-dc>`, `<helmet>`, `<sc-for>`, `<sc-if>`,
`<dc-import>` — those are prototype-tool tags. `<dc-import name="SiteHeader">` means “render the shared SiteHeader component”.

## 1. Locked stack (do not change without asking)

- **Runtime:** Node.js **20 or 22 LTS** (whichever the cPanel Node selector offers; match it locally)
- **Framework:** **Next.js (latest stable, App Router) + TypeScript (strict)**, `output: 'standalone'`
- **Styling:** **Tailwind CSS** with the design tokens in `docs/05_DESIGN_SYSTEM.md`; fonts via `next/font/google` (Lato 400/700/900, Public Sans 400–800) — self-hosted, no external font requests
- **Interactivity:** React Server Components by default; small client components only where needed (mobile menu, Leo Year switcher, club filters, resource search, FAQ accordion, admin forms)
- **Database:** **MySQL / MariaDB** (cPanel) via **Prisma ORM** (`provider = "mysql"`)
- **Validation:** **Zod** on every server action and route handler; React Hook Form on admin forms
- **Auth:** custom, session-based: email + password (**bcryptjs**, pure JS) + **6-digit email code on new devices**; sessions in DB; httpOnly, Secure, SameSite=Lax cookies. No third-party auth service.
- **Roles:** `ADMIN` and `EDITOR`, enforced **on the server** in every admin action (`requireRole()`), never only in the UI
- **Email:** **Nodemailer** over the cPanel SMTP mailbox (e.g. `info@leodistrict325knepal.org`, port 465 SSL)
- **Spam protection:** **Cloudflare Turnstile** on the contact form (server-side token verification)
- **Images:** uploads resized/converted to WebP with **sharp** (if sharp cannot load on the server, fall back to storing originals and set `images.unoptimized = true`; never block the build on it)
- **Uploads storage:** a folder **outside the app directory** (`UPLOAD_DIR`, e.g. `/home/<cpanel-user>/leo325k-uploads`), served through a `/media/[...path]` route handler with long cache headers and strict path validation
- **Testing:** Vitest for utilities/validation; Playwright smoke tests for the public pages and login
- **Tooling:** ESLint + Prettier, `npm` (not pnpm/yarn, to match cPanel)

## 2. What to build (Phase 1 scope)

**Public website** (routes in `docs/04_ROUTES_AND_SCREENS.md`): Home, About, Leadership (Leo Year switcher; shows previous team under
“coming soon” until the new team is published), Clubs (search, region + city filters), Resources (search, categories, only published
files shown), Contact (form with topic, “Contact a Leo club” → club picker, consent tickbox, Turnstile), Privacy notice, custom 404.
All pages share **one full header** (theme banner 216 px + orange 4 px line + 60 px nav bar) and **one footer**. Mobile (≤ 860 px) uses
the mobile header (68 px bar + badges row) and a full-screen menu.

**Admin portal** at an **unlisted path** (`/${ADMIN_SLUG}`, from env; direct `/admin` returns 404; `noindex`; excluded from sitemap):
Sign in (+ email code), Dashboard (launch-readiness checklist computed from real data, new messages, quick actions, recent activity),
Messages (inbox, filter, mark replied, archive), Leadership (Leo Year cards, District Leo PVST + District Lion PVST tabs, publish a
year, **Our Pride** as its own section), Add/Edit person (**Step 1 find existing person → Step 2 team → Step 3 position, year, details**;
phone/email public toggles; membership ID admin-only; **no blood group**), Clubs + Edit club (logo, region, city, type, charter year,
sponsor, email, show/hide, Club PVST), Resources (upload, category, featured, publish), Site content (logo/photos, **Leo Year theme**
banner/badges/theme lines, Home text + numbers band, About mission/vision/focus areas, contact details, social links, contact-form
test), Users & roles (invite, role, remove), Activity log. Desktop-first; mobile layouts for Dashboard, Messages, Leadership list and
Edit club.

**Out of scope (Phase 2):** events/activities, club self-login, club registration, member database, Nepali language.

## 3. Rules you must follow

1. **Follow `docs/01_PHASE_PLAN.md` sprint by sprint.** At the end of each sprint: run lint, type-check, tests and build; summarise what
   you did, list files changed, show how to verify, then **STOP and wait for my “continue”**.
2. **Match the designs.** Compare your pages with `design/screens/*.png` at 1440 px and 390 px. Same colours, type scale, spacing,
   radii, copy. Use semantic HTML, one `<h1>` per page, real `<button>`/`<a>`/`<label>`, alt text, 44 px tap targets, visible focus.
3. **Security first** (`docs/07_SECURITY_AND_PRIVACY.md`): server-side authorization on every admin mutation, Zod validation, CSRF-safe
   server actions, rate limiting on login/code/contact, security headers, no secrets in the client bundle or git, `.env` never committed.
4. **Privacy:** never render phone/email publicly unless the person's public toggle is on; membership ID never public; delete contact
   messages older than 12 months (scheduled job).
5. **Placeholders:** where the council has not supplied content, render the bracketed placeholder text from the designs (e.g.
   `[official district email]`) and list every placeholder in `docs/08_CONTENT_AND_SEED.md` → “Open placeholders”. Never invent facts,
   names, emails, numbers or dates.
6. **Shared-hosting limits:** keep memory low (no heavy client libraries, no in-memory caches that grow), build **locally** (never on
   the server), keep `node_modules` lean, use ISR/`revalidatePath` after admin publishes instead of rendering everything per request.
7. **Clean URLs** (`/about`, `/leadership`…). Add 301 redirects for old URLs (`/leo.html` → `/leadership`, `/index.html` → `/`; I will
   send the full old-file list).
8. Write a short `README.md` (local setup, env vars, scripts, deploy) and keep `docs/` updated if decisions change.
9. If something cannot work on cPanel shared hosting, **stop and tell me** with the reason and options (the fallback plan is PHP/Laravel
   on the same hosting).

## Restraint rules (before writing code)
1. Does it need to exist? If not, skip it.
2. Platform/standard library does it? Use it.
3. Already-installed dependency does it? Use it.
4. Prefer the smallest change that works; no speculative helpers or abstractions.
5. Tests: cover behaviour and risks, not every width/permutation.
6. Never trade away validation, security, accessibility or error handling.

## 4. Environment variables (create `.env.example`; real values only in cPanel)

See `starter/.env.example`. Includes `DATABASE_URL`, `APP_URL`, `ADMIN_SLUG`, `SESSION_SECRET`, `SMTP_*`, `MAIL_FROM`,
`CONTACT_INBOX`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `UPLOAD_DIR`, `CRON_SECRET`.

## 5. My local environment (use these facts, don't assume others)

- **Windows 11**, VS Code, **PowerShell** terminal (execution policy RemoteSigned already set). Give Windows/PowerShell commands.
- **Node.js 22 LTS**, **npm 10.9**, **Git 2.56** installed. No WSL, no Docker.
- **Local database:** XAMPP **MariaDB** (MySQL-compatible) on `localhost:3306`, started from the XAMPP Control Panel (MySQL only;
  Apache/phpMyAdmin not used). I will create database `leo325k` and user `leo325k_dev` when you reach Sprint 3; use Prisma Studio to inspect data.
- **Production builds happen on GitHub Actions** (`.github/workflows/build.yml` is already in this workspace) so Prisma and sharp get
  Linux binaries. Keep `prisma generate` + `npm run build` working there. Never rely on Windows-only binaries in the deploy package.
- **Sprint 0 note:** `create-next-app` refuses non-empty folders. Scaffold in a temporary folder (e.g. `..\leo325k-tmp`), then move the
  generated files into this workspace root **without overwriting** `MASTER_PROMPT.md`, `README.md`, `START_HERE.md`, `docs/`, `design/`,
  `assets/`, `starter/`, `.github/`. Rename the generated README to `README.next.md`. Use `starter/.gitignore` as the base `.gitignore`.
- Ask before running any command that deletes files, installs global packages, or touches anything outside this folder.

## 6. Start now

Begin with **Sprint 0** from `docs/01_PHASE_PLAN.md`. First, reply with: (a) your understanding of the scope in 5 bullets,
(b) any question that blocks you, (c) the exact commands you will run. Then build Sprint 0 and stop.
