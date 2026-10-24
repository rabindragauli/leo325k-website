# 06 · Deploy to Kailash Cloud (cPanel · Medium plan · Node.js)

> Rule: **build on Linux, never on the server.** Shared hosting has tight RAM/CPU limits; `next build` there can fail or get the account throttled.
> Build with **GitHub Actions** (ubuntu-latest) — already set up in `.github/workflows/build.yml`. This gives the correct Linux binaries for Prisma and sharp.

## A. One-time server setup (cPanel)
1. **Back up the old site**: File Manager → `public_html` → Compress → download the zip. Keep it (rollback).
2. **Check versions** (cPanel → Terminal):
   ```bash
   openssl version          # 1.1.x → Prisma target rhel-openssl-1.1.x ; 3.x → rhel-openssl-3.0.x
   node -v || true          # system node may not exist; the Node selector provides it
   ```
3. **Database**: MySQL® Database Wizard → DB `leo325k`, user `leo325k_app` (strong password, ALL PRIVILEGES on that DB only). Repeat for staging: `leo325k_stg`. Leave Remote MySQL empty.
4. **Mailbox**: Email Accounts → `info@leodistrict325knepal.org`. Then **Email Deliverability** → make SPF and DKIM “Valid”.
5. **SSL**: SSL/TLS Status → run AutoSSL for the domain and `staging.` subdomain.
6. **Subdomain**: Domains → create `staging.leodistrict325knepal.org`.
7. **Uploads folders** (Terminal): `mkdir -p ~/leo325k-uploads ~/leo325k-uploads-staging ~/backups`
8. **Node app** (Setup Node.js App → Create Application):
   | Field | Staging | Production |
   |---|---|---|
   | Node.js version | 22.x (or 20.x) — same as local | same |
   | Application mode | Production | Production |
   | Application root | `leo325k-staging` | `leo325k-app` |
   | Application URL | `staging.leodistrict325knepal.org` | `leodistrict325knepal.org` |
   | Application startup file | `app.js` | `app.js` |
   | Environment variables | all keys from `.env.example` (staging DB, staging UPLOAD_DIR) | production values |
   Note the “Enter to the virtual environment” command cPanel shows, e.g.
   `source /home/<user>/nodevenv/leo325k-app/22/bin/activate && cd /home/<user>/leo325k-app`
9. **Run one Node process per app.** Public content is cached in the app's memory, and stored `/leadership/<year>` pages are
   kept by that process; `revalidateTag` after an admin publish (Sprint 5) only clears the process that handled it. Confirm
   with Kailash support that Passenger runs the app as a single process. (With more than one, other processes catch up
   within 15 minutes, the cache safety net.)
10. **Database URL**: add `?connection_limit=5` to `DATABASE_URL` (see `.env.example`) so Prisma stays within shared-hosting limits.

## B. Build the deploy package — GitHub Actions (recommended, no WSL needed)
1. Push the code to the private GitHub repo.
2. GitHub → **Actions** → **Build deploy package** → **Run workflow** (or push to the `release` branch).
3. When it finishes (green ✓), open the run → **Artifacts** → download **leo325k-deploy** → unzip once to get `leo325k-deploy.zip`.
The workflow (`.github/workflows/build.yml`) runs `npm ci`, `prisma generate`, lint, type-check, tests, `next build`, copies `.next/static` and `public`
into the standalone folder, checks the Prisma **rhel** engine is present, and zips everything with `app.js`, `package.json` and `prisma/`.

Manual alternative (Linux/WSL only):
```bash
npm ci && npx prisma generate && npm run build
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
mkdir -p deploy && cp -r .next app.js package.json prisma deploy/ && (cd deploy && zip -qr ../leo325k-deploy.zip .)
```
If the Prisma engine is missing from the bundle, add `outputFileTracingIncludes: { '/*': ['./node_modules/.prisma/client/**/*'] }` to `next.config.ts`.

## C. Deploy / update
1. Stop nothing — upload `leo325k-deploy.zip` to the app root via File Manager (or `scp`), then in Terminal:
   ```bash
   source /home/<user>/nodevenv/leo325k-staging/22/bin/activate && cd ~/leo325k-staging
   unzip -oq leo325k-deploy.zip && rm leo325k-deploy.zip
   ```
2. **Database migrations** (Prisma CLI lives in a tools folder so it never bloats the app):
   ```bash
   mkdir -p ~/leo325k-tools && cd ~/leo325k-tools && npm init -y >/dev/null && npm install prisma@<same version as app>
   cd ~/leo325k-staging && DATABASE_URL="<staging url>" ~/leo325k-tools/node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma
   ```
   First time only: run the seed (`node prisma/seed.js` compiled, or `npm run db:seed` locally against a DB dump you then import via phpMyAdmin).
3. **Create the first admin**: `node scripts/create-admin.js` (prompts for email; sends invite code).
4. **Restart**: Setup Node.js App → Restart (or `mkdir -p tmp && touch tmp/restart.txt`).
   Every deploy (and restart) clears the content cache and the stored ISR pages; the first visits afterwards read the
   database again and refill them. No action needed.
5. **Check**: open the site, `~/leo325k-staging/stderr.log` for errors, cPanel → Resource Usage for CPU/RAM faults.

## D. Scheduled jobs (cPanel → Cron Jobs)
| When | Command |
|---|---|
| Daily 02:15 | `curl -fsS "https://leodistrict325knepal.org/api/cron/daily?key=<CRON_SECRET>" >/dev/null` |
| Weekly Sun 02:30 | `mysqldump --single-transaction -u<user> -p'<pass>' <db> \| gzip > ~/backups/leo325k-$(date +\%F).sql.gz && find ~/backups -name 'leo325k-*.sql.gz' -mtime +56 -delete` |
| Weekly Sun 03:00 | `tar -czf ~/backups/uploads-$(date +\%F).tgz -C ~ leo325k-uploads && find ~/backups -name 'uploads-*.tgz' -mtime +56 -delete` |
(Plus the plan's automatic JetBackup twice a day.) Check the server timezone; Nepal is UTC+5:45.

## E. Go-live (after District President sign-off)
1. Production app created as in A.8 (domain root) — cPanel writes the Passenger `.htaccess` in `public_html`; the old site files must be moved out of `public_html` first (you already have the zip).
2. Deploy as in C with production env vars.
3. Add 301s (already in `next.config.ts`): `/leo.html` → `/leadership`, `/index.html` → `/`, others from the old file list.
4. Smoke test: all pages, login, publish, upload, contact email, 404, `https://` redirect.
5. Google Search Console → verify domain → submit `/sitemap.xml`.

## F. If Node.js struggles on shared hosting
Signs: frequent 503/“Incomplete response”, Resource Usage shows memory faults, app restarts. Try: lower image sizes, check for leaks, ask Kailash support about LVE limits.
If still unstable → fallback: **Laravel (PHP) + MySQL on the same plan** — the database design, designs and content all carry over.
