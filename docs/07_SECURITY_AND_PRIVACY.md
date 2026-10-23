# 07 · Security and Privacy (mandatory)

## Authentication
- Passwords: bcryptjs cost 12, min 12 characters, block the 1,000 most common passwords.
- New device → 6-digit code by email (hash stored, 10 min expiry, 5 attempts, then new code required).
- Session cookie: `__Host-leo_sess`, httpOnly, Secure, SameSite=Lax, Path=/, random 32 bytes, only SHA-256 hash in DB; 8 h idle, 7 days absolute; rotate on login; logout deletes the row.
- Rate limits: login 5 / 15 min per email+IP; code verify 5 per code; password reset 3 / hour; contact form 5 / hour per IP.
- Generic error messages (“Email or password is incorrect”) — no user enumeration.
- First admin only via server CLI script; invites via one-time emailed link (24 h).

## Authorization
- `requireUser()` on every admin page; `requireRole('ADMIN')` for Users & roles; check again inside every server action (never trust hidden fields or the UI).
- Admin under `/${ADMIN_SLUG}`; `/admin` direct → 404; `X-Robots-Tag: noindex` on admin; not in sitemap; disallowed in robots.txt.

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

## Privacy (Plan v2 rules)
- Public: name, title, photo, home club (with the person's consent, `consentAt`).
- Phone/email public only if the person's toggle is on. Membership ID: admin only. **Blood group: not collected.**
- Contact messages: consent tickbox required; deleted after 12 months (daily cron).
- When an officer leaves: remove phone/email/membership ID; keep name, title, photo, home club in the archive.
- Privacy notice page at `/privacy` (text in `design/source/public/PrivacyNotice.dc.html`).
