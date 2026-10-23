import { expect, test, type Page } from "@playwright/test";

// Desktop banner scaling (docs/05 "Header scaling"): 1440 × 216 reference layout, scales above
// 1440 px up to a 270 px banner; badges never overlap the Leo emblem, the swoosh or the theme words.

const BANNER_LINK = "header a[href='/']";

async function measure(page: Page) {
  return page.evaluate((linkSelector) => {
    const header = document.querySelector("header")!;
    const link = header.querySelector(linkSelector)!.getBoundingClientRect();
    const svg = header.querySelector("svg")!;
    const strokes = [...svg.querySelectorAll<SVGPathElement>("path[stroke]")];
    const badges = [...header.querySelectorAll<HTMLImageElement>("ul[aria-label$='theme badges'] img")];
    const svgBox = svg.getBoundingClientRect();
    const scale = svgBox.height / 216; // viewBox units → CSS px

    // Sample each badge's box outline and ask the SVG whether the point is on a swoosh stroke
    let swooshHits = 0;
    const boxes = badges.map((img) => img.getBoundingClientRect());
    for (const b of boxes) {
      for (let i = 0; i <= 20; i++) {
        for (const [x, y] of [
          [b.left, b.top + (b.height * i) / 20],
          [b.left + (b.width * i) / 20, b.top],
          [b.left + (b.width * i) / 20, b.bottom],
        ]) {
          const pt = new DOMPoint((x - svgBox.left) / scale, (y - svgBox.top) / scale);
          if (strokes.some((p) => p.isPointInStroke(pt))) swooshHits++;
        }
      }
    }

    // Theme words: extent of the text itself (the ribbon box is designed to run under the badges)
    const themeLines = [...header.querySelectorAll("p > span")]
      .filter((el) => el.checkVisibility())
      .map((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return { right: range.getBoundingClientRect().right, lines: range.getClientRects().length };
      });

    const font = (el: Element | null) => (el ? parseFloat(getComputedStyle(el).fontSize) : 0);
    return {
      headerHeight: header.getBoundingClientRect().height,
      bannerHeight: (header.firstElementChild as HTMLElement).getBoundingClientRect().height,
      linkRight: link.right,
      badgesLeft: Math.min(...boxes.map((b) => b.left)),
      badgesRight: Math.max(...boxes.map((b) => b.right)),
      swooshHits,
      themeRight: Math.max(0, ...themeLines.map((l) => l.right)),
      themeWrapped: themeLines.some((l) => l.lines > 1),
      themeShown: themeLines.length > 0,
      titleFont: font(header.querySelector(`${linkSelector} span span`)),
      navFont: font(header.querySelector("nav[aria-label='Main'] a")),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  }, BANNER_LINK);
}

test.describe("desktop banner", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop layout only");
  });

  for (const width of [861, 901, 920, 960, 1000, 1100, 1101, 1280, 1366, 1439, 1440, 1600, 1800, 1920, 2560]) {
    test(`no overlaps and sizes hold at ${width}px`, async ({ page }) => {
      const imageWarnings: string[] = [];
      page.on("console", (msg) => {
        if (msg.text().startsWith("Image with src")) imageWarnings.push(msg.text());
      });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/", { waitUntil: "networkidle" });
      const m = await measure(page);

      expect(imageWarnings, "next/image warnings").toEqual([]);
      expect(m.badgesLeft, "badges clear of the Leo emblem").toBeGreaterThan(m.linkRight);
      expect(m.swooshHits, "badges clear of the swoosh").toBe(0);
      expect(m.themeShown, "theme words from 1440 px").toBe(width >= 1440);
      expect(m.themeWrapped, "theme words on one line each").toBe(false);
      if (m.themeShown) expect(m.themeRight, "theme words clear of the badges").toBeLessThan(m.badgesLeft);
      expect(m.badgesRight).toBeLessThanOrEqual(m.clientWidth);
      expect(m.scrollWidth, "no horizontal scroll").toBeLessThanOrEqual(m.clientWidth);

      // Never smaller than the 1440 px reference; banner capped at 270 px, nav bar fixed
      expect(m.titleFont).toBeGreaterThanOrEqual(25);
      expect(m.navFont).toBeGreaterThanOrEqual(15);
      expect(m.navFont).toBeLessThanOrEqual(18);
      const banner = Math.min(270, Math.max(216, (m.clientWidth * 216) / 1440));
      expect(m.bannerHeight).toBeCloseTo(banner, 0);
      expect(m.headerHeight).toBeCloseTo(banner + 64, 0);
    });
  }
});

test.describe("mobile", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile layout only");
  });

  test("does not download desktop-only banner art", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (req) => requested.push(decodeURIComponent(req.url())));
    await page.goto("/", { waitUntil: "networkidle" });

    for (const file of ["mountains-flag", "curtain-left", "curtain-right"]) {
      expect(requested.filter((u) => u.includes(file)), file).toEqual([]);
    }
    // Only the mobile header's Lions logo size (42 px → w=48/96), not the desktop banner's
    const logos = requested.filter((u) => u.includes("lions-international-logo"));
    expect(logos.every((u) => /&w=(48|96)&/.test(u)), logos.join("\n")).toBe(true);
  });
});
