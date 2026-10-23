# 08 · Content and Seed Data

## Seed from the designs (exact data lives in each file's `renderVals()`)
| Data | Source file |
|---|---|
| Leo Years 2025–26 (published, archived) and 2026–27 (current, **not published**) | `design/source/public/Leadership.dc.html` |
| 2025–26 District Leo PVST (Prativa Shrestha, Ashish Lamichhane, Smarika Thapa, Sugam Khadka) incl. President's message, 8 awards, 9 journey steps | `design/source/public/Leadership.dc.html`, `design/source/admin/Leadership.dc.html` |
| 2025–26 District Lion PVST (5 Lions) | same |
| Our Pride (5 entries) | `design/source/admin/Leadership.dc.html` |
| 4 clubs (Kathmandu Machhapokhari, Kathmandu Rainbow City, Pokhara Silver Mountains, Baglung Kaligandaki) | `design/source/public/Clubs.dc.html` |
| Resource categories + 15 resources (10 files + 2 links ready, 3 “being prepared” kept unpublished) | `design/source/public/Resources.dc.html` (`all` array) |
| About facts, motto pillars, 6 service focus areas, levels, Alpha/Omega text | `design/source/public/About.dc.html` |
| Contact topics, FAQs, desks | `design/source/public/Contact.dc.html` |
| Home hero text | `design/source/public/Main.dc.html` |
| Theme LY 2026–27: lines “LEADING WITH PURPOSE” / “EXECUTION WITH EXCELLENCE”, banner art + 5 badges | `assets/brand/` |

Seed files as **records without uploaded files** (resources start `published=false` until a real file is attached — except the 2 external links).

## Open placeholders (council must supply before launch)
| Placeholder | Where |
|---|---|
| `[official district email]`, president@/secretary@/membership@ addresses | Footer, Contact, Privacy |
| `[District office address]`, Google Maps link, office hours confirmation (“Sunday – Friday, 10:00 AM – 5:00 PM”) | Footer, Contact |
| `[2 working days]` reply time | Contact, Privacy |
| Home numbers: `[##]` clubs, `[###]` members, `[##]` service projects, `[#]` regions | Home |
| Region names; each club's region, type, charter year, sponsor, email, logo | Clubs |
| Mission, vision, 1–2 sentences of district history | About |
| Hero photo, About photo, portraits (800 × 800) | Home, About, Leadership |
| Official district logo (PNG + SVG); 2× banner artwork and badges | Header, footer, favicon |
| 2026–27 district team (after installation) | Leadership |
| Social media URLs (Facebook, Instagram, YouTube): pills stay hidden until set (`socialLinks` in `src/lib/site.ts`) | Footer, mobile menu |
| `[date of launch]` | Privacy |
| Cabinet Treasurer's home club (2025–26) | Leadership |
| Verify Our Pride titles (“MDP 325 B”, “DP 325 B”) | Our Pride |

## Old URLs → 301 redirects
`/leo.html` → `/leadership` · `/index.html` → `/` · (Rabindra to send the rest of the old `public_html` file list)
