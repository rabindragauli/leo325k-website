# 05 · Design System (LY 2026–27 theme)

## Colours (Tailwind tokens)
| Token | Hex | Use |
|---|---|---|
| `teal-900` (brand) | `#1B3A4B` | Nav bar, dark sections, headings, primary dark button |
| `teal-700` | `#244D63` | Cards on dark sections, banner left |
| `teal-600` | `#2B5266` | Dividers on dark |
| `teal-400` | `#4F7A90` | Borders on dark |
| `purple` | `#762B94` | Banner right, accents |
| `yellow` | `#FCCC0A` | Primary buttons, active nav underline, highlights (dark text on it) |
| `orange` | `#F6961E` | 4 px divider under banner, footer top line |
| `gold-text` | `#8A6100` | Eyebrow labels on white |
| `gold-tint` / `gold-ink` | `#FBEFD3` / `#6B4B00` | Chips, highlights |
| `ink` | `#14213D` | Body text |
| `slate` | `#4A5568` | Secondary text |
| `mist` | `#F4F6FA` | Light section bands |
| `line` | `#E1E6EF` | Card borders |
| `on-dark` | `#C9D3E6` / `#D3DCEC` / `#B9C5DC` | Text on dark |
| status | ok `#1E6B3A`/`#E3F4EA` · warn `#6B4B00`/`#FBEFD3` · error `#8A1F11`/`#FBE4E1` · form error `#A3261A` | |

Banner background: `linear-gradient(90deg, #1A4359 0%, #1A4359 42%, #234569 46%, #2E4A7A 50%, #3D4581 54%, #4B3F86 58%, #5B3889 62%, #6A3290 66%, #712E92 70%, #762B94 74%, #762B94 100%)` plus the SVG swoosh (yellow `#FCCC0A` + blue `#2B6F96` curves) — copy from `design/source/public/SiteHeader.dc.html`.

## Typography
- Headings: **Lato** 700/900 · Body: **Public Sans** 400–700
- Display 56–64 / H2 34–40 / card title 17–24 / body 15–18 (line-height 1.6) / eyebrow 13–14 uppercase, letter-spacing 1px
- Mobile: H1 34–40, H2 26–28

## Header sizes
| Header | Size |
|---|---|
| Desktop banner | 216 px up to 1440 px wide, then scales (see “Header scaling”), max 270 px |
| Orange line | 4 px |
| Nav bar | min 60 px (Contact us yellow button right) |
| Mobile | 68 px bar + 4 px yellow + 3 px blue + 60 px badges row + 3 px orange = 138 px |
| Admin compact bar | ~64 px (all admin screens except login) |
Breakpoints: theme words hide < 1440 px · curtains + mountains hide < 1100 px · Leo emblem hides < 900 px · badges hide / mobile header < 860 px.

### Header scaling (desktop, `SiteHeader`)
- The banner is laid out at the design width, **1440 × 216**. Every size inside it (offsets, swoosh, images, text, gaps) is
  `calc(N * var(--u))`, where `--u: clamp(1px, calc(100cqw / 1440), 1.25px)` is one design pixel and `cqw` is the `<header>` width
  (`@container`). The `clamp()` floor means nothing is ever smaller than its fixed-px size.
- **861–1440 px:** `--u` = 1px, so this is exactly the Sprint 1 fixed-px banner (216 px), except the badge fix below.
- **1440–1800 px:** the banner scales as one unit, keeping the 1440 : 216 aspect ratio.
- **≥ 1800 px:** capped at 270 px tall; the content area (`max-width: 1440 × --u` = 1800 px, curtains at its edges) stays centred and
  `bg-banner-outer` (#244D63 left / #762B94 right, the content area's edge colours) fills the rest, so there is no visible seam.
- **Theme words** show from 1440 px: they were designed for the 1440 layout and collide with the badges in anything narrower.
  - **Follow-up:** Theme words are hidden 1301–1439px, including 1366px laptops. Revisit with a smaller theme-word size when the 2x artwork arrives.
- **Nav bar:** always 60 px (fixed 24 px line height); link text 15 px up to 1440, `clamp(15px, 100cqw × 15 / 1440, 18px)` above
  (18 px from 1728).
- **Alignment:** nav bar content, page content and footer content share one centred container (`max-w-content` 1240 px inside
  24 px gutters) at every desktop width; the “Home” text starts on its left edge and “Contact us” ends on its right edge
  (`tests/e2e/alignment.spec.ts`). Only the banner art is wider.
- **Badges below 1101 px** (no curtains): 16 px from the right, height `clamp(48px, (100cqw − 632px) / 4.72, 74px)` so they stay
  right of the swoosh (x ≈ 590) and the Leo emblem. `tests/e2e/header.spec.ts` checks emblem, swoosh and theme-word overlaps,
  wrapping, text sizes and heights from 861 to 2560 px.
- Totals (banner + 4 + 60): 280 px up to 1440 · 304 px at 1600 · 334 px at 1800 and wider.
- Images: srcset sized for the 1.25 scale (`atBannerHeight`), shown size set in CSS with the other side `auto`. The mountains
  (largest banner image, LCP on light pages) use a media-gated `<picture>` with `loading="eager"` so screens < 1101 px never download
  them; no `preload` in the header (a preload `<link>` downloads at every width).
- **Sharpness:** the supplied curtains (176 px) and badges (160 px) are 1× artwork. At the cap (270 px banner, 93 px badges) they are
  upscaled, and soft on 2× screens. The 2× originals (banner art 2880 × 432, badges ≥ 200 px) are still needed from the council.

## Shape & spacing
Radius: buttons 10–12 px · cards 16–20 px · feature panels 24 px · chips/avatars full. Content width 1240 px. Section padding 80–104 px desktop, 32–56 px mobile. Tap targets ≥ 44 px. Focus ring: 3 px `#FCCC0A`.

## Tailwind tokens (`src/app/globals.css`, Tailwind v4 `@theme`)
The default Tailwind palette is cleared (`--color-*: initial`); only these colours exist (`inherit`, `transparent`, `current` still work).
- Colours: `teal-900/800/700/600/500/400` (800 = `#1A4359` banner left, 500 = `#3F6A80` pill borders), `purple`, `yellow`, `orange`, `blue` (`#2B6F96` swoosh), `blue-bright` (`#156FAC` mobile line), `gold-text`, `gold-tint`, `gold-ink`, `gold-band` (`#C28B19`), `ink`, `slate`, `mist`, `line`, `on-dark`, `on-dark-2`, `on-dark-3`, `on-dark-muted` (`#9FB0D0`), `nav` (`#CFE0E8` inactive nav), `ok`/`ok-tint`, `warn`/`warn-tint`, `error`/`error-tint`, `form-error`
- Fonts: `font-heading` (Lato 400/700/900), `font-sans` (Public Sans, default), both via `next/font/google` (self-hosted)
- Breakpoints (min-width): `desk` 861 px (desktop header/footer; `max-desk:` = mobile ≤ 860), `leo` 901 px, `art` 1101 px, `theme` 1440 px. Tailwind's `sm`/`md`/`lg`/`xl` remain for page layouts.
- Radius: `rounded-btn` 10 px, `rounded-card` 18 px, `rounded-panel` 24 px · Width: `max-w-content` 1240 px, `max-w-banner` 1440 px
- Text: `text-display` 56, `text-h2` 38, `text-card-title` 20, `text-eyebrow` 13
- Gradients: `bg-banner`, `bg-banner-outer`, `bg-bar-mobile`, `bg-badges-band`, `bg-theme-ribbon`
- Focus: global `:focus-visible` = 2 px teal-900 inner ring + 3 px yellow outline

Dev-only gallery of the UI components: `/style-guide` (404 in production).

## Brand assets (`assets/brand/` → `public/brand/`)
lions-international-logo, leo-emblem (shown with `filter: brightness(1.9)` on dark), mountains-flag, curtain-left/right, badge-1…5.
The supplied badges are 160 px tall and curtains 176 px — **ask the council for 2× originals** (banner artwork 2880 × 432) before launch.
