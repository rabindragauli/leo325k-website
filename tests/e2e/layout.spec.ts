import { expect, test } from "@playwright/test";

// Shared public shell: header/footer per breakpoint, skip link, keyboard mobile menu.

test.describe("desktop (1440)", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop layout only");
  });

  test("full header, nav state and footer", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").filter({ has: page.getByRole("navigation", { name: "Main" }) });
    await expect(header).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("link", { name: "Contact us" }).first()).toBeVisible();
    await expect(page.getByRole("list", { name: "LY 2026–27 theme badges" })).toHaveCount(1);

    const footer = page.getByRole("contentinfo");
    await expect(footer).toHaveCount(1);
    await expect(footer.getByText("[official district email]")).toBeVisible();
    // Social URLs not supplied yet: no pills, no dead links
    await expect(footer.getByRole("link", { name: "Facebook" })).toHaveCount(0);
  });

  test("skip link is first in tab order and moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });
});

test.describe("mobile (390)", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile layout only");
  });

  test("mobile header replaces the banner", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    // Desktop nav is display:none, so it is not exposed
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
  });

  test("menu opens and closes from the keyboard", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Open menu" });
    await menuButton.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeFocused();
    await expect(dialog.getByRole("link", { name: /Home/ })).toHaveAttribute("aria-current", "page");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuButton).toBeFocused();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("menu link navigates and closes the menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: /About/ }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  });
});
