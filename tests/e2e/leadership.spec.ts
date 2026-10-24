import { expect, test } from "@playwright/test";

// Leadership year logic (docs/03): current 2026–27 unpublished → coming soon + 2025–26 team below.
test.describe("Leadership", () => {
  test("default view: coming soon, then the 2025–26 team, then Our Pride", async ({ page }) => {
    await page.goto("/leadership");
    const switcher = page.getByRole("navigation", { name: "Leo Year" });
    await expect(switcher.getByRole("link", { name: "2026–27 (current)" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: "The 2026–27 district team is coming soon" })).toBeVisible();
    await expect(page.getByText("You are viewing an archived Leo Year")).toHaveCount(0);

    await expect(page.getByRole("heading", { level: 2, name: "Leo Prativa Shrestha" })).toBeVisible();
    await expect(page.getByText("District President · 2025–26")).toBeVisible();
    await expect(page.getByText("Welcome to Leo District Council 325 K Nepal.")).toBeVisible();

    const awards = page.getByRole("heading", { name: "Awards & recognition" }).locator("xpath=..").getByRole("listitem");
    await expect(awards).toHaveCount(8);
    const journey = page.getByRole("heading", { name: "Leo journey" }).locator("xpath=..").getByRole("listitem");
    await expect(journey).toHaveCount(9);

    const officers = page.getByRole("region", { name: "District officers" }).getByRole("article");
    await expect(officers).toHaveCount(4);
    const lions = page.getByRole("region", { name: "District Lion PVST" }).getByRole("article");
    await expect(lions).toHaveCount(5);
    await expect(lions.last()).toContainText("[Home club]");

    // Our Pride comes after the year content, with all 5 entries
    const order = await page.evaluate(() => {
      const ids = [...document.querySelectorAll("main section[aria-labelledby]")].map((s) => s.getAttribute("aria-labelledby"));
      return ids;
    });
    expect(order.at(-1)).toBe("our-pride");
    expect(order.indexOf("lions")).toBeLessThan(order.indexOf("our-pride"));
    await expect(page.getByRole("region", { name: "Our District, Our Pride" }).getByRole("listitem")).toHaveCount(5);
  });

  test("archived year shows a way back to the current team", async ({ page }) => {
    await page.goto("/leadership/2025-26");
    await expect(page.getByRole("link", { name: "2025–26", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText("You are viewing an archived Leo Year (2025–26).")).toBeVisible();
    await expect(page.getByRole("heading", { name: /coming soon/ })).toHaveCount(0);
    await page.getByRole("link", { name: "Back to the current team" }).click();
    await expect(page).toHaveURL(/\/leadership$/);
    await expect(page.getByRole("heading", { name: /coming soon/ })).toBeVisible();
  });

  test("current year path redirects to /leadership", async ({ page, request }) => {
    const response = await request.get("/leadership/2026-27", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toMatch(/\/leadership$/);
    await page.goto("/leadership/2026-27");
    await expect(page).toHaveURL(/\/leadership$/);
  });

  test("unknown year path is a 404", async ({ page }) => {
    for (const path of ["/leadership/1999-00", "/leadership/%3Cscript%3E", "/leadership/2025-26/extra"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });

  test("no private contact details are shown", async ({ page }) => {
    await page.goto("/leadership/2025-26");
    await expect(page.locator("main a[href^='tel:'], main a[href^='mailto:']")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/blood group|membership id/i);
  });
});

test.describe("Leadership without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("year switcher works as plain links", async ({ page }) => {
    await page.goto("/leadership");
    await expect(page.getByRole("heading", { name: /coming soon/ })).toBeVisible();
    await page.getByRole("navigation", { name: "Leo Year" }).getByRole("link", { name: "2025–26", exact: true }).click();
    await expect(page).toHaveURL(/\/leadership\/2025-26$/);
    await expect(page.getByText("You are viewing an archived Leo Year (2025–26).")).toBeVisible();
  });
});
