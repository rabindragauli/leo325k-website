import { expect, test } from "@playwright/test";

test.describe("Resources", () => {
  test("only published resources, essentials, no dead links", async ({ page }) => {
    await page.goto("/resources");
    const results = page.getByRole("region", { name: "All resources" });
    await expect(results.getByRole("article")).toHaveCount(12);
    await expect(page.getByText("12 resources · All categories")).toBeVisible();
    // "Being prepared" items and their empty category stay hidden
    await expect(page.getByText("District Constitution & By-laws")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /District Documents/ })).toHaveCount(0);

    await expect(page.getByRole("region", { name: "Essentials for every club" }).getByRole("listitem")).toHaveCount(3);
    // No file/URL attached yet: disabled buttons, not links
    await expect(results.getByRole("button", { name: "Download" }).first()).toBeDisabled();
    await expect(page.locator("main a[download], main a[href^='mailto:']")).toHaveCount(0);
  });

  test("keyboard: search, category and reset", async ({ page }) => {
    await page.goto("/resources");
    const search = page.getByRole("searchbox", { name: "Search resources" });
    await search.focus();
    await page.keyboard.type("template");
    await expect(page.getByText("4 resources · All categories")).toBeVisible();

    const brand = page.getByRole("group", { name: "Categories" }).getByRole("button", { name: /Brand & Logos/ });
    await brand.focus();
    await page.keyboard.press("Enter");
    await expect(brand).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("2 resources · Brand & Logos")).toBeVisible();

    await search.fill("zzz");
    const reset = page.getByRole("button", { name: "Show all resources" });
    await reset.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("12 resources · All categories")).toBeVisible();
    await expect(search).toBeFocused();
  });
});
