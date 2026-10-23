import { expect, test } from "@playwright/test";

// Nav bar, page content and footer share one centred container (docs/05 "Alignment").
for (const width of [1280, 1440, 1920, 2560]) {
  test(`nav, content and footer share the container at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop layout only");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/about");

    const m = await page.evaluate(() => {
      const textBox = (el: Element) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect();
      };
      const home = document.querySelector("nav[aria-label='Main'] a[href='/']")!;
      const contact = [...document.querySelectorAll("header a[href='/contact']")].find(
        (a) => a.textContent?.includes("Contact us"),
      )!;
      // First band in <main>: its inner container (max-w-content)
      const content = document.querySelector("main > section > div")!.getBoundingClientRect();
      const footer = [...document.querySelectorAll("footer")]
        .find((f) => f.checkVisibility())!
        .firstElementChild!.getBoundingClientRect();
      return {
        homeLeft: textBox(home).left,
        contactRight: contact.getBoundingClientRect().right,
        contentLeft: content.left,
        contentRight: content.right,
        footerLeft: footer.left,
        footerRight: footer.right,
      };
    });

    expect(Math.abs(m.homeLeft - m.contentLeft), JSON.stringify(m)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.footerLeft - m.contentLeft), JSON.stringify(m)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.footerRight - m.contentRight), JSON.stringify(m)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.contactRight - m.contentRight), JSON.stringify(m)).toBeLessThanOrEqual(1);
  });
}
