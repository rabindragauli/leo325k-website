import { expect, test } from "@playwright/test";

test.describe("Clubs", () => {
  test("lists the four clubs with placeholders and contact links", async ({ page }) => {
    await page.goto("/clubs");
    const cards = page.getByRole("region", { name: "Clubs" }).getByRole("article");
    await expect(cards).toHaveCount(4);
    await expect(page.getByText("Showing 4 of 4 clubs")).toBeVisible();
    await expect(cards.first().locator("[data-placeholder]")).toHaveText("[Region]");
    await expect(page.getByRole("link", { name: "Contact Leo Club of Pokhara Silver Mountains" })).toHaveAttribute(
      "href",
      "/contact?topic=club&club=pokhara-silver-mountains",
    );
    await expect(page.getByRole("combobox", { name: "Region" })).toHaveValue("all");
  });

  test("keyboard: search, city chips and reset", async ({ page }) => {
    await page.goto("/clubs");
    const search = page.getByRole("searchbox", { name: "Search clubs" });
    await search.focus();
    await page.keyboard.type("rainbow");
    await expect(page.getByText("Showing 1 of 4 clubs")).toBeVisible();

    // Tab to the city chips and choose Pokhara with the keyboard
    const pokhara = page.getByRole("group", { name: "Filter by city" }).getByRole("button", { name: "Pokhara" });
    await pokhara.focus();
    await page.keyboard.press("Enter");
    await expect(pokhara).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("No clubs match your search")).toBeVisible();

    const reset = page.getByRole("button", { name: "Show all clubs" });
    await reset.focus();
    await page.keyboard.press("Space");
    await expect(page.getByText("Showing 4 of 4 clubs")).toBeVisible();
    await expect(search).toBeFocused();
    await expect(search).toHaveValue("");
    await expect(page.getByRole("button", { name: "All cities" })).toHaveAttribute("aria-pressed", "true");
  });

  test("city filter by click", async ({ page }) => {
    await page.goto("/clubs");
    await page.getByRole("button", { name: "Kathmandu" }).click();
    await expect(page.getByText("Showing 2 of 4 clubs")).toBeVisible();
  });
});

test.describe("Clubs without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("every club is listed", async ({ page }) => {
    await page.goto("/clubs");
    await expect(page.getByRole("region", { name: "Clubs" }).getByRole("article")).toHaveCount(4);
  });
});
