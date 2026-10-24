import { expect, test } from "@playwright/test";

test.describe("Resources", () => {
  test("only published resources (the 2 official links), no essentials, no dead links", async ({ page }) => {
    await page.goto("/resources");
    const results = page.getByRole("region", { name: "All resources" });
    await expect(results.getByRole("article")).toHaveCount(2);
    await expect(page.getByText("2 resources · All categories")).toBeVisible();
    // Files stay unpublished until uploaded (docs/08), and so do their categories
    await expect(page.getByText("District Constitution & By-laws")).toHaveCount(0);
    await expect(page.getByText("Official Leo Logo Pack")).toHaveCount(0);
    const cats = page.getByRole("group", { name: "Categories" });
    await expect(cats.getByRole("button", { name: /Official Links/ })).toBeVisible();
    await expect(cats.getByRole("button", { name: /Forms|Brand & Logos|District Documents/ })).toHaveCount(0);

    // No essentials published: the whole section, heading included, is hidden
    await expect(page.getByRole("region", { name: "Essentials for every club" })).toHaveCount(0);
    await expect(page.getByText("Essentials for every club")).toHaveCount(0);
    // No URL attached yet: disabled buttons, not links
    await expect(results.getByRole("button", { name: "Visit" }).first()).toBeDisabled();
    await expect(page.locator("main a[download], main a[href^='mailto:']")).toHaveCount(0);
  });

  test("keyboard: search, category and reset", async ({ page }) => {
    await page.goto("/resources");
    const search = page.getByRole("searchbox", { name: "Search resources" });
    await search.focus();
    await page.keyboard.type("nepal");
    await expect(page.getByText("1 resource · All categories")).toBeVisible();

    const links = page.getByRole("group", { name: "Categories" }).getByRole("button", { name: /Official Links/ });
    await links.focus();
    await page.keyboard.press("Enter");
    await expect(links).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("1 resource · Official Links")).toBeVisible();

    await search.fill("zzz");
    const reset = page.getByRole("button", { name: "Show all resources" });
    await reset.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("2 resources · All categories")).toBeVisible();
    await expect(search).toBeFocused();
  });
});
