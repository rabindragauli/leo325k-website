import { expect, test } from "@playwright/test";

// Smoke test per public page, both projects (desktop 1440, mobile 390): renders, one <h1>,
// no console errors or uncaught exceptions.
const pages = [
  { path: "/", status: 200, h1: /^Leadership\.\s*Experience\.\s*Opportunity\.$/ },
  { path: "/leadership", status: 200, h1: "District leadership", title: /^Leadership ·/ },
  { path: "/leadership/2025-26", status: 200, h1: "District leadership", title: /^Leadership 2025–26 ·/ },
  { path: "/leadership/1999-00", status: 404, h1: "This page has moved or no longer exists" },
  { path: "/leadership/2026-27", status: 404, h1: "This page has moved or no longer exists" },
  { path: "/about", status: 200, h1: "Youth leading service across Nepal", title: /^About ·/ },
  { path: "/privacy", status: 200, h1: "Privacy notice", title: /^Privacy notice ·/ },
  {
    path: "/this-page-does-not-exist",
    status: 404,
    h1: "This page has moved or no longer exists",
    title: /^Page not found ·/,
  },
];

// TEMPORARY (Sprint 2 batches): production builds prefetch the nav links, and these pages do not
// exist yet, so their prefetch 404s. Remove each route as its batch lands; empty after Batch 4.
const NOT_BUILT_YET = ["/clubs", "/resources", "/contact"];
const isPrefetchOfUnbuiltPage = (url: URL) =>
  url.searchParams.has("_rsc") && NOT_BUILT_YET.includes(url.pathname);

for (const { path, status, h1, title } of pages) {
  test(`${path} renders`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      // The browser logs the document's own (expected) 404 response; anything else is a problem
      const url = new URL(msg.location().url || "http://x/");
      const ownStatus = status === 404 && url.pathname + url.search === path && /status of 404/.test(msg.text());
      if (ownStatus || isPrefetchOfUnbuiltPage(url)) return;
      problems.push(`console: ${msg.text()} (${msg.location().url})`);
    });
    page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));

    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(status);

    const headings = page.getByRole("heading", { level: 1 });
    await expect(headings).toHaveCount(1);
    await expect(headings).toHaveText(h1);
    if (title) await expect(page).toHaveTitle(title);

    // Shared shell is present (the 404 brings it itself)
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    expect(problems).toEqual([]);
  });
}

test("404 links back into the site", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  // White h1 sits on the gradient hero: guard against the gradient going missing
  const hero = page.locator("section").filter({ has: page.getByRole("heading", { level: 1 }) });
  await expect(hero).toHaveCSS("background-image", /linear-gradient/);
  const popular = page.getByRole("navigation", { name: "Popular pages" });
  await expect(popular.getByRole("link")).toHaveCount(4);
  await popular.getByRole("link", { name: /About/ }).click();
  await expect(page).toHaveURL(/\/about$/);
});

test("privacy notice reflects the phone/email toggle wording", async ({ page }) => {
  await page.goto("/privacy");
  await expect(
    page.getByText(
      "Officers’ personal phone numbers and email addresses are shown only if the officer chooses to make them public.",
      { exact: false },
    ),
  ).toBeVisible();
});
