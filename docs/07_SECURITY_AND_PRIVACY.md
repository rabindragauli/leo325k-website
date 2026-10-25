# 07 · Security and Privacy (mandatory)

## Authentication (Sprint 4)
- Sign-in: **username + password**. Usernames trimmed, lowercase, unique, `[a-z0-9._-]{3,32}`.
- Passwords: bcryptjs cost 12; **min 12 characters, max 72 UTF-8 bytes** (bcrypt limit; longer is rejected with a clear
  message, Devanagari letters count 3 bytes each); a new password must differ from the current one. **Blocklist:** a small
  list of common passwords of 12+ characters, and any password containing the username, “leo”, “lions”, “325k” or
  “leodistrict” (case-insensitive). Same rules in the app and in the CLI script.
- Session cookie: `__Host-leo_session` in production (httpOnly, Secure, SameSite=Lax, Path=/, no Domain; plain name in local
  dev), random 32 bytes, only the SHA-256 hash in the DB; **2 h idle, 12 h absolute**; `lastSeen` written at most every
  5 min; new token on every login and on password change; logout deletes the row; deactivating a user or changing a
  password ends their other sessions.
- Login throttle (DB): **per username** failures only add a growing delay (never a hard lock, so nobody can lock out an
  admin); **per IP and per username+IP** 5 failures → 15 min lock; unknown usernames are throttled exactly like real ones.
  IPs and usernames are stored only as HMACs (`AUTH_SECRET`). Client IP comes from one helper that trusts only the
  rightmost `X-Forwarded-For` entry (added by LiteSpeed, see docs/06).
- One generic error for everything (“Username or password is incorrect”), including locked and unknown accounts; a bcrypt
  compare always runs (dummy hash for unknown users).
- ActivityLog records sign-ins, failures, lockouts, logouts and password changes, never passwords, full tokens or the slug.
- Accounts are created only with the server CLI script (`npm run user:create`); no users in the seed.
- **Sprint 6:** password reset by emailed one-time link; decision on the new-device 6-digit email code.
- Other rate limits: contact form 5 / hour per IP (Sprint 6).

## Authorization
- `proxy.ts` is **not** the security boundary (CVE-2025-29927). Every admin page, layout, route handler and server action
  calls `requireUser()` / `requireAdmin()` itself; server actions can be POSTed to any URL with a `Next-Action` header, so
  admin actions live only in server-only admin modules that public pages never import, and the guard is their first line.
- Roles: **only Admins publish**; Editors create and edit drafts only. Users & roles is Admin-only. Enforced on the server
  (never trust hidden fields or the UI). The last active Admin cannot be deactivated or demoted; a warning is shown when
  fewer than 2 active Admins would remain.
- Admin under `/${ADMIN_SLUG}` (server-only env, never `NEXT_PUBLIC_`); `/admin` and the internal admin route → 404; the
  slug never appears in client bundles, public HTML, robots.txt, sitemap, logs, error messages or responses to
  unauthenticated users (except the sign-in page at the slug itself).
- Admin responses: `noindex` (meta + `X-Robots-Tag`), `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, never
  `use cache`. Server Actions origin checks stay at the default. Logout is POST only.

## Input & output
- Zod on every input; length limits on all text; strip control characters.
- React escapes output — never use `dangerouslySetInnerHTML` with user content.
- Uploads: allow-list (jpg, png, webp, svg → **rasterise or reject SVG for user uploads**, pdf, docx, xlsx, zip), size limits, magic-byte check, random names, stored outside the app, served with `Content-Disposition` for documents and `X-Content-Type-Options: nosniff`; path traversal blocked in `/media/[...path]`.

## Headers (next.config `headers()`)
`Strict-Transport-Security: max-age=31536000; includeSubDomains` · `X-Content-Type-Options: nosniff` · `X-Frame-Options: DENY` ·
`Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy: camera=(), microphone=(), geolocation=()` ·
CSP: `default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com https://www.google.com; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
(tighten with nonces later if time allows; `www.google.com` only for the Maps embed).

## Secrets & ops
- `.env` never in git; secrets only in cPanel env vars; separate staging/production secrets.
- `npm audit` before each deploy; keep Next.js/Prisma patched (monthly).
- Logs: no passwords, codes, tokens or full message bodies in logs.
- Backups: JetBackup (plan) + weekly mysqldump + uploads tarball; test a restore before launch.

## Privacy (Phase 1 decisions, Oct 2026)
This replaces the earlier “no blood group / consent before public” rule (`consentAt`).
- **Per-person and per-field “public” switches** for designation, home club, membership no., cell, landline, email and
  blood group.
- **Default until the District President confirms in writing:** all hidden **except designation and home club**. The
  council's proposal is “public by default”: **pending DP written confirmation**. The default is a **single config value**,
  so changing it later is one edit.
- **Under-18 members:** cell, landline, email, membership no. and blood group are **always hidden**, with no override.
- **Address:** admin-only, never public.
- **Filtering in the query:** public queries select a field from the DB only when it is public (and allowed for under-18
  members); private values never reach the cache or the UI.
- **Photos:** resized to WebP with EXIF/GPS stripped; a “photo consent confirmed” checkbox must be ticked before a photo is
  public (needed for under-18 members).
- Public always: title, name, photo (with consent), and the switched-on fields above.
- Contact messages: consent tickbox required; deleted after 12 months (daily cron).
- When an officer leaves: their positions stay as history; contact details follow the switches above.
- Privacy notice page at `/privacy` (text in `design/source/public/PrivacyNotice.dc.html`).
