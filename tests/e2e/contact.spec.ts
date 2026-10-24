import { expect, test } from "@playwright/test";

test.describe("Contact", () => {
  test("design content: topics, office placeholders, desks, FAQ, map", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByLabel("I’m contacting about").locator("option")).toHaveText([
      "General inquiry",
      "Contact a Leo club",
      "Join or start a club",
      "Partnership & sponsorship",
      "Media & press",
      "Website feedback",
      "Other",
    ]);
    await expect(page.getByLabel("Which club? *")).toHaveCount(0);
    const office = page.getByRole("complementary", { name: "District office" });
    await expect(office.getByText("[official district email]")).toBeVisible();
    await expect(office.getByText("[president@official-domain]")).toBeVisible();
    await expect(page.locator("main a[href^='mailto:']")).toHaveCount(0);
    await expect(page.getByRole("img", { name: /\[Map: District office location/ })).toBeVisible();
    await expect(page.getByText("[Cloudflare Turnstile check — connected in Sprint 6]")).toBeVisible();
    await expect(page.getByRole("link", { name: "privacy notice", exact: true })).toHaveAttribute("href", "/privacy");
    await expect(page.locator("details")).toHaveCount(4);
    await expect(page.locator("details").first()).toHaveAttribute("open", "");
  });

  test("prefill from /contact?topic=club&club=<slug>", async ({ page }) => {
    await page.goto("/contact?topic=club&club=pokhara-silver-mountains");
    await expect(page.getByLabel("I’m contacting about")).toHaveValue("Contact a Leo club");
    await expect(page.getByLabel("Which club? *")).toHaveValue("pokhara-silver-mountains");
  });

  test("unknown club slug: no prefill, no error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/contact?topic=club&club=not-a-club");
    await expect(page.getByLabel("Which club? *")).toHaveValue("");
    await expect(page.locator("[id$='-error']")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("valid submit shows thank-you + demo note and sends nothing", async ({ page }) => {
    const posts: string[] = [];
    page.on("request", (req) => {
      if (req.method() !== "GET") posts.push(`${req.method()} ${req.url()}`);
    });
    await page.goto("/contact?topic=club&club=baglung-kaligandaki");
    await page.getByLabel("Full name *").fill("Test Person");
    await page.getByLabel("Email address *").fill("test@example.org");
    await page.getByLabel("Phone (optional)").fill("+977 981-234 5678");
    await page.getByLabel("Message *").fill("Hello");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Send message" }).click();

    const status = page.getByRole("status");
    await expect(status.getByRole("heading", { name: "Thank you, Test Person!" })).toBeFocused();
    await expect(status).toContainText("Contact a Leo club");
    await expect(status.getByText("[Demo — form not connected until Sprint 6]")).toBeVisible();
    await page.waitForTimeout(500);
    expect(posts).toEqual([]);

    await page.getByRole("button", { name: "Send another message" }).click();
    await expect(page.getByLabel("Full name *")).toBeFocused();
    await expect(page.getByLabel("Full name *")).toHaveValue("");
  });

  test("phone and club errors use the shared schema", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Full name *").fill("A");
    await page.getByLabel("Email address *").fill("a@b.org");
    await page.getByLabel("Phone (optional)").fill("12345");
    await page.getByLabel("I’m contacting about").selectOption("Contact a Leo club");
    await page.getByLabel("Message *").fill("Hi");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByLabel("Phone (optional)")).toBeFocused();
    await expect(page.getByText("Please enter a 10-digit mobile number starting with 96, 97 or 98.")).toBeVisible();
    await expect(page.getByText("Please choose a club.")).toBeVisible();
  });
});
