# Leo District Council 325 K — Phase 1 Build Kit

Everything an AI coding agent (or a developer) needs to build and deploy the approved Phase 1 website + admin portal
on **Kailash Cloud Medium (cPanel, Node.js, MySQL)**.

## Contents
| Path | What |
|---|---|
| `MASTER_PROMPT.md` | **Paste this into the AI agent** (VS Code Copilot Agent / Claude Code) |
| `docs/00_Phase1_Plan_v2.pdf` | Approved plan |
| `docs/01_PHASE_PLAN.md` | Sprints 0–9 with Definition of Done |
| `docs/02…08` | Architecture, data model, routes, design system, deployment, security, content |
| `START_HERE.md` | Your checklist + kick-off message |
| `starter/` | `prisma/schema.prisma`, `.env.example`, `.gitignore`, `app.js` (cPanel startup file) |
| `.github/workflows/build.yml` | Builds the cPanel deploy ZIP on GitHub's Linux servers |
| `design/screens/` | PNG of every approved screen (public 20, admin 13) |
| `design/source/` | Design markup + sample data (`.dc.html`, reference only) |
| `assets/brand/` | Logos, banner artwork, LY 2026–27 badges |

## How to start
Open **`START_HERE.md`**: checklist + the exact kick-off message for Claude Code / Copilot Agent.

Setup used: Windows 11 · VS Code · Node.js 22 · Git · XAMPP MariaDB (local dev DB) · GitHub Actions (Linux build for cPanel) · Kailash Cloud Medium (cPanel, Node.js, MySQL).

## Local development

**Stack:** Next.js 16 (App Router, TypeScript strict, `output: 'standalone'`) · Tailwind CSS 4 · Prisma 6 + MariaDB/MySQL ·
Zod · React Hook Form · bcryptjs · Nodemailer · sharp · Vitest · Playwright. Package manager: **npm**.

### Prerequisites
Node.js 22 LTS (see `.node-version`), npm 10, Git. From Sprint 3: XAMPP MariaDB on `localhost:3306` (see `START_HERE.md`).

### Setup
```powershell
npm install                       # also generates the Prisma client
Copy-Item .env.example .env       # then edit .env (never commit it)
```
In your local `.env`, **delete the `NODE_ENV` line** (Next.js sets it), and set `APP_URL=http://localhost:3000`,
`DATABASE_URL` and `SHADOW_DATABASE_URL` (see below).

### Local database (XAMPP MariaDB)
1. XAMPP Control Panel → start **MySQL** (port 3306).
2. Create the databases and the user once, in `C:\xampp\mysql\bin\mysql.exe -u root -p` (choose your own password):
   ```sql
   CREATE DATABASE leo325k CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE leo325k_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'leo325k_dev'@'localhost' IDENTIFIED BY '<your-local-password>';
   GRANT ALL PRIVILEGES ON leo325k.* TO 'leo325k_dev'@'localhost';
   GRANT ALL PRIVILEGES ON leo325k_shadow.* TO 'leo325k_dev'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. In `.env`:
   `DATABASE_URL="mysql://leo325k_dev:<your-local-password>@127.0.0.1:3306/leo325k"` and
   `SHADOW_DATABASE_URL="mysql://leo325k_dev:<your-local-password>@127.0.0.1:3306/leo325k_shadow"`.
4. Create the tables and load the seed, then start the app:
   ```powershell
   npx prisma migrate status         # checks the connection (prints no password)
   npm run db:migrate                # applies prisma/migrations
   npm run db:seed                   # loads src/data (safe to run again)
   npm run dev                       # http://localhost:3000
   ```
Inspect the data with `npx prisma studio`. Public pages read the database at request time (cached), so `npm run build`
works without it; `npm run dev`, `npm start` and the e2e tests need MySQL running.

### Environment variables
All keys are in `.env.example`: `APP_URL`, `DATABASE_URL`, `ADMIN_SLUG`, `SESSION_SECRET`, `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM`,
`CONTACT_INBOX`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `UPLOAD_DIR`, `CRON_SECRET`. Optional: `IMAGES_UNOPTIMIZED=true` if
sharp cannot load on the server. Real values live only in `.env` (local) and cPanel → Setup Node.js App (server).

### Scripts
| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build → `.next/standalone` |
| `npm start` | Serve the production build locally |
| `npm run lint` / `typecheck` / `format` | ESLint · `tsc --noEmit` · Prettier |
| `npm test` | Vitest unit tests (`tests/unit`, no database; this is what CI runs) |
| `npm run test:db` | Query privacy/visibility tests against the local seeded DB (`tests/db`, rolled back; local only) |
| `npm run test:e2e` | Playwright smoke tests against the seeded DB (`tests/e2e`; first run `npx playwright install chromium`) |
| `npm run db:migrate` / `db:seed` | Prisma migrate dev · seed (`prisma/seed.ts`, create-only, repeatable) |
| `npm run db:reset` | Drop, re-migrate and re-seed the **local** DB; refuses unless `DATABASE_URL` is localhost/127.0.0.1 |
| `npm run package:deploy` | Copy static files + `public` into `.next/standalone` for a local test of `server.js` |

### Deploy
Never upload a Windows build. Push to GitHub → Actions → **Build deploy package** → download `leo325k-deploy.zip` →
follow `docs/06_DEPLOY_KAILASH_CPANEL.md`. `app.js` is the cPanel startup file.

## Guardrails
- Review every sprint before saying “continue”. Run the site locally and compare with `design/screens`.
- Never paste real passwords/keys into the chat; put them in `.env` (local) and cPanel env vars (server).
- Deploy to **staging** first (`docs/06`), production only after the District President signs off.
