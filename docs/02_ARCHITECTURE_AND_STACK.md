# 02 · Architecture and Stack

## Decision summary
| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 20/22 LTS via cPanel “Setup Node.js App” (Passenger) | Included in the Kailash Cloud Medium plan |
| Framework | Next.js (App Router, TypeScript strict), `output: 'standalone'` | One app for public site + admin; server rendering for SEO; standalone build keeps server footprint small |
| Styling | Tailwind CSS + design tokens | Matches the approved designs; yearly theme change = token/asset swap |
| DB | MySQL/MariaDB (cPanel) + Prisma | Unlimited MySQL databases on the plan; typed queries; migrations |
| Auth | Custom DB sessions + bcryptjs + email OTP for new devices | No external services; matches the designed sign-in |
| Email | Nodemailer → cPanel SMTP | Unlimited mailboxes on the plan; SPF/DKIM via cPanel Email Deliverability |
| Spam | Cloudflare Turnstile | Free, privacy-friendly |
| Images | sharp → WebP | Small pages on slow mobile connections |
| Files | `UPLOAD_DIR` outside the app, served via `/media/*` | Survives redeploys; no execution of uploaded files |
| Fallback | PHP Laravel + MySQL on the same hosting | If Node on shared hosting proves unstable |

## Folder structure (target)
```
leo325k/
├─ docs/ design/ assets/            # this kit (keep)
├─ prisma/  schema.prisma  migrations/  seed.ts
├─ public/  brand/  og-image.png  favicon.ico
├─ src/
│  ├─ app/
│  │  ├─ (public)/ page.tsx about/ leadership/ clubs/ resources/ contact/ privacy/ layout.tsx
│  │  ├─ admin/  (internal path, reached only via /${ADMIN_SLUG} rewrite)
│  │  │  ├─ login/ verify/ reset/  dashboard/ messages/ leadership/ people/ clubs/ resources/ content/ users/ activity/ layout.tsx
│  │  ├─ media/[...path]/route.ts      # serves uploads
│  │  ├─ api/cron/daily/route.ts       # cleanup job (secret key)
│  │  ├─ sitemap.ts robots.ts not-found.tsx layout.tsx
│  ├─ components/ (site/, admin/, ui/)
│  ├─ server/ (db.ts, auth/, queries/, actions/, mail.ts, uploads.ts, turnstile.ts, rate-limit.ts, activity.ts)
│  ├─ lib/ (validation schemas, formatters, constants)
│  └─ middleware.ts                    # admin slug rewrite, /admin 404, security headers fallback
├─ tests/ (unit/, e2e/)
├─ app.js                              # cPanel startup file → requires .next/standalone/server.js
└─ .env.example
```

## Rendering
- Public pages: Server Components, cached; admin actions call `revalidatePath('/leadership')` etc. after changes.
- Admin: dynamic, `noStore()`, `robots: noindex`.
- Client components only for interactive widgets.

## Request flow (admin mutation)
Browser form → Server Action → Zod parse → `requireRole()` → Prisma transaction → `ActivityLog` → `revalidatePath()` → redirect with toast.

## Why not X
- **Vercel/Supabase:** extra accounts and costs; hosting is already paid.
- **Express + EJS:** lighter, but more hand-built (routing, forms, image handling); Next.js gives SEO + components with similar effort.
- **WordPress:** would not match the custom admin design.
