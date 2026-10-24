import { expect, test } from "@playwright/test";

// Keyboard-only checks for every interactive part of the public site (Sprint 2 DoD).
// Also covered elsewhere: skip link + mobile menu open/Esc/focus return (layout.spec), club
// search/city chips/reset (clubs.spec), resource search/categories/reset (resources.spec).

test("Leadership year switcher: Enter on links", async ({ page }) => {
  await page.goto("/leadership");
  const switcher = page.getByRole("navigation", { name: "Leo Year" });
  await switcher.getByRole("link", { name: "2025–26", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/leadership\/2025-26$/);
  const current = switcher.getByRole("link", { name: "2026–27 (current)" });
  await current.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/leadership$/);
  await expect(current).toHaveAttribute("aria-current", "page");
});

test("Clubs: search, then Tab through region select and city chips", async ({ page }) => {
  await page.goto("/clubs");
  const search = page.getByRole("searchbox", { name: "Search clubs" });
  await search.focus();
  await page.keyboard.type("kathmandu");
  await expect(page.getByText("Showing 2 of 4 clubs")).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("combobox", { name: "Region" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "All cities" })).toBeFocused();
  await page.keyboard.press("Tab"); // Baglung
  await page.keyboard.press("Tab"); // Kathmandu
  const kathmandu = page.getByRole("button", { name: "Kathmandu" });
  await expect(kathmandu).toBeFocused();
  await page.keyboard.press("Space");
  await expect(kathmandu).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Showing 2 of 4 clubs")).toBeVisible();
});

test("Resources: category with Space", async ({ page }) => {
  await page.goto("/resources");
  const forms = page.getByRole("group", { name: "Categories" }).getByRole("button", { name: /^Forms/ });
  await forms.focus();
  await page.keyboard.press("Space");
  await expect(forms).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("3 resources · Forms")).toBeVisible();
});

test("FAQ: Enter and Space toggle the native disclosure", async ({ page }) => {
  await page.goto("/contact");
  const second = page.locator("details").nth(1);
  await second.locator("summary").focus();
  await expect(second).not.toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(second).toHaveAttribute("open", "");
  await expect(second.getByRole("link", { name: "How to start a club →" })).toBeVisible();
  await page.keyboard.press("Space");
  await expect(second).not.toHaveAttribute("open", "");
});

test("Contact: topic → club picker, focus to the first error", async ({ page }) => {
  await page.goto("/contact");
  const topic = page.getByLabel("I’m contacting about");
  await topic.focus();
  // Arrow keys on a focused <select> change the value without opening it
  await page.keyboard.press("ArrowDown"); // General inquiry → Contact a Leo club
  await expect(topic).toHaveValue("Contact a Leo club");
  const club = page.getByLabel("Which club? *");
  await page.keyboard.press("Tab");
  await expect(club).toBeFocused();

  // Enter in a text field submits; everything required is empty → focus goes to Full name
  await page.getByLabel("Full name *").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Full name *")).toBeFocused();
  await expect(page.getByLabel("Full name *")).toHaveAttribute("aria-invalid", "true");
  for (const message of [
    "Please enter your name.",
    "Please enter a valid email address.",
    "Please choose a club.",
    "Please write a short message.",
    "Please tick the box so we can reply to you.",
  ]) {
    await expect(page.getByText(message)).toBeVisible();
  }

  // Fix name and email: the next invalid field (club) receives focus
  await page.keyboard.type("Test Person");
  await page.getByLabel("Email address *").fill("test@example.org");
  await page.getByRole("button", { name: "Send message" }).focus();
  await page.keyboard.press("Enter");
  await expect(club).toBeFocused();
});

test("Contact: prefill from URL, then keyboard moves between topic and club", async ({ page }) => {
  await page.goto("/contact?topic=club&club=kathmandu-rainbow-city");
  const club = page.getByLabel("Which club? *");
  await expect(club).toHaveValue("kathmandu-rainbow-city");
  await club.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByLabel("I’m contacting about")).toBeFocused();
});
