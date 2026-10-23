import { expect, test } from "@playwright/test";

test("home page: numbers band placeholders, coming soon, explore, Our Pride", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  const numbers = page.getByRole("region", { name: "District in numbers" });
  await expect(numbers.locator("[data-placeholder]")).toHaveText(["[##]", "[###]", "[##]", "[#]"]);

  await expect(page.getByRole("heading", { name: "Our new district team will be announced soon" })).toBeVisible();
  await expect(page.getByRole("link", { name: "See past district teams" })).toHaveAttribute(
    "href",
    "/leadership/2025-26",
  );
  // Social URLs not supplied: no dead "Follow us" link
  await expect(page.getByRole("link", { name: "Follow us for the announcement" })).toHaveCount(0);

  await expect(page.getByRole("navigation", { name: "Quick links" }).getByRole("link")).toHaveCount(3);
  await expect(page.getByRole("region", { name: "Our District, Our Pride" }).getByRole("listitem")).toHaveCount(5);
});
