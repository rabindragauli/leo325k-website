import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { hashToken, newToken } from "../../src/lib/auth/session-rules";
import { throttleKeys } from "../../src/lib/auth/throttle";
import type { E2EUser } from "./global-setup";

// Admin sign-in, sessions and the hidden path (Sprint 4, docs/07). Desktop project only.
// The test server runs with a random throwaway slug and secret (playwright.config.ts), and the users
// come from global-setup.ts. Each test sends its own TEST-NET client IP (X-Forwarded-For), so
// throttle counters never mix between tests.

const SLUG = process.env.E2E_ADMIN_SLUG!;
const SECRET = process.env.E2E_AUTH_SECRET!;
const ADMIN = `/${SLUG}`;
const ERROR = "Username or password is incorrect";
const users: E2EUser[] = JSON.parse(process.env.E2E_USERS ?? "[]");
const user = (key: string) => users.find((u) => u.key === key)!;
const db = new PrismaClient();

test.afterAll(() => db.$disconnect());

let nextIp = 1 + Math.floor(Math.random() * 200);
const testIp = () => `198.51.100.${nextIp++}`;

async function useIp(page: Page, ip = testIp()) {
  await page.context().setExtraHTTPHeaders({ "x-forwarded-for": ip });
  return ip;
}

async function submitSignIn(page: Page, username: string, password: string) {
  await page.goto(ADMIN);
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function signIn(page: Page, u: E2EUser, password = u.password) {
  await submitSignIn(page, u.username, password);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

const sessionCookie = async (page: Page) =>
  (await page.context().cookies()).find((c) => c.name === "leo_session");

/** A fresh browser context that only carries the given session cookie value. */
async function withCookie(browser: Browser, value: string) {
  const context = await browser.newContext();
  await context.addCookies([{ name: "leo_session", value, url: "http://localhost:3000" }]);
  return context.newPage();
}

const signInHeading = (page: Page) => page.getByRole("heading", { name: "Sign in" });
// The forms' own alert regions (Next.js adds an empty role="alert" route announcer as well)
const signInError = (page: Page) => page.locator("#signin-error");
const formErrors = (page: Page) => page.locator("form").getByRole("alert");

test.describe("hidden admin path", () => {
  test("/admin and the internal route are 404 and never reveal the slug", async ({ request }) => {
    const paths = ["/admin", "/admin/login", "/admin-internal", "/admin-internal/password", "/%61dmin-internal"];
    for (const path of paths) {
      const variants: Record<string, string>[] = [{}, { "x-leo-admin-gate": "forged" }, { "x-leo-admin-gate": SLUG }];
      for (const headers of variants) {
        const response = await request.get(path, { headers, maxRedirects: 0 });
        expect(response.status(), path).toBe(404);
        expect(response.headers().location).toBeUndefined();
        expect(await response.text()).not.toContain(SLUG);
      }
    }
  });

  test("public pages and their scripts never contain the slug", async ({ page, request }) => {
    await page.goto("/");
    expect(await page.content()).not.toContain(SLUG);
    const scripts = await page.locator("script[src]").evaluateAll((els) => els.map((el) => (el as HTMLScriptElement).src));
    for (const src of scripts) expect(await (await request.get(src)).text()).not.toContain(SLUG);
  });

  test("admin responses are noindex, no-store and no-referrer", async ({ request }) => {
    const response = await request.get(ADMIN);
    expect(response.status()).toBe(200);
    expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    expect(response.headers()["cache-control"]).toBe("no-store");
    expect(response.headers()["referrer-policy"]).toBe("no-referrer");
    const html = await response.text();
    expect(html).toContain('<meta name="robots" content="noindex, nofollow"/>');
    expect(html).toContain('<meta name="referrer" content="no-referrer"/>');
  });

  test("an admin page without a session goes to the sign-in page", async ({ page }) => {
    await page.goto(`${ADMIN}/password`);
    await expect(page).toHaveURL(ADMIN);
    await expect(signInHeading(page)).toBeVisible();
  });
});

test.describe("sign-in", () => {
  test("wrong password and unknown user get the same generic message", async ({ page }) => {
    await useIp(page);
    await submitSignIn(page, user("admin").username, "not the right password");
    await expect(signInError(page)).toHaveText(ERROR);
    await submitSignIn(page, `nobody_${randomBytes(3).toString("hex")}`, "not the right password");
    await expect(signInError(page)).toHaveText(ERROR);
  });

  test("5 failures lock that IP for 15 minutes with the same message; another IP still works", async ({ page }) => {
    const u = user("lockout");
    const ip = await useIp(page);
    for (let i = 1; i <= 5; i++) {
      if (i === 5) await page.waitForTimeout(1100); // the 4th failure started a 1 s username backoff
      await submitSignIn(page, u.username, `wrong password ${i}`);
      await expect(signInError(page)).toHaveText(ERROR);
    }
    const keys = throttleKeys(u.username, ip, SECRET);
    const lock = await db.loginThrottle.findUnique({ where: { key: keys.userIp! } });
    expect(lock?.lockedUntil?.getTime()).toBeGreaterThan(Date.now() + 14 * 60_000);

    await page.waitForTimeout(2100); // let the username backoff (2 s) pass: only the IP lock remains
    await submitSignIn(page, u.username, u.password);
    await expect(signInError(page)).toHaveText(ERROR);
    await expect(signInHeading(page)).toBeVisible();

    await useIp(page); // a different IP: the username itself is never locked
    await signIn(page, u);
  });

  test("sign in sets an httpOnly SameSite=Lax cookie; sign out ends the session", async ({ page, browser }) => {
    await useIp(page);
    await signIn(page, user("admin"));
    await expect(page.getByText("E2E admin", { exact: true })).toBeVisible(); // name in the bar
    const cookie = await sessionCookie(page);
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/" });

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(signInHeading(page)).toBeVisible();
    expect(await sessionCookie(page)).toBeUndefined();

    const reused = await withCookie(browser, cookie!.value); // the old cookie no longer works
    await reused.goto(ADMIN);
    await expect(signInHeading(reused)).toBeVisible();
  });

  test("logout by GET does nothing", async ({ page }) => {
    await useIp(page);
    await signIn(page, user("admin"));
    expect((await page.goto(`${ADMIN}/logout`))?.status()).toBe(404);
    await page.goto(`${ADMIN}?logout=1`);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("invalid and expired session cookies are rejected", async ({ browser }) => {
    const random = await withCookie(browser, newToken());
    await random.goto(ADMIN);
    await expect(signInHeading(random)).toBeVisible();

    const admin = await db.user.findUniqueOrThrow({ where: { username: user("admin").username } });
    const token = newToken();
    const idle = new Date(Date.now() - 3 * 3600_000);
    await db.session.create({
      data: { tokenHash: hashToken(token), userId: admin.id, lastSeenAt: idle, expiresAt: new Date(Date.now() + 3600_000) },
    });
    const expired = await withCookie(browser, token);
    await expired.goto(ADMIN);
    await expect(signInHeading(expired)).toBeVisible();
    expect(await db.session.count({ where: { tokenHash: hashToken(token) } })).toBe(0);
  });

  test("an Editor can sign in to the dashboard shell", async ({ page }) => {
    await useIp(page);
    await signIn(page, user("editor"));
    await expect(page.getByText("E2E editor", { exact: true })).toBeVisible();
    // No Admin-only actions exist yet; requireAdmin() is covered by tests/unit/auth-guards.test.ts
  });
});

test.describe("server actions", () => {
  test("an admin action POSTed directly without a session is rejected", async ({ page, request }) => {
    const u = user("admin");
    await useIp(page);
    await signIn(page, u);
    await page.goto(`${ADMIN}/password`);
    // The real form's hidden fields, as a browser without JavaScript would submit them
    const hidden: [string, string][] = await page
      .locator("form:has(#pw-current) input[type=hidden]")
      .evaluateAll((els) => els.map((el) => [(el as HTMLInputElement).name, (el as HTMLInputElement).value]));
    // useActionState forms carry the action as JSON in "$ACTION_<n>:0": {"id": "<action id>", ...}
    const reference = hidden.find(([name]) => /^\$ACTION_\d+:0$/.test(name))?.[1];
    const actionId: string | undefined = reference ? JSON.parse(reference).id : undefined;
    expect(actionId).toMatch(/^[0-9a-f]{20,}$/);

    const before = await db.user.findUniqueOrThrow({ where: { username: u.username } });
    const fields = { current: u.password, next: "f00dcafe1234 Zq new", confirm: "f00dcafe1234 Zq new" };
    const multipart = { ...Object.fromEntries(hidden), ...fields };
    const origin = { origin: "http://localhost:3000" };

    // To a public URL: with the Next-Action header, and as a plain form post, with and without a forged gate
    for (const headers of [
      { ...origin, "next-action": actionId! },
      { ...origin, "next-action": actionId!, "x-leo-admin-gate": "forged" },
      origin,
      { ...origin, "x-leo-admin-gate": "forged" },
    ]) {
      const response = await request.post("/", { headers, multipart, maxRedirects: 0 });
      expect(await response.text()).not.toContain(SLUG);
    }
    // To the admin URL itself, without a session: requireUser() sends it to the sign-in page
    const toAdmin = await request.post(`${ADMIN}/password`, { headers: origin, multipart, maxRedirects: 0 });
    expect([303, 307]).toContain(toAdmin.status());
    expect(new URL(toAdmin.headers().location, "http://localhost:3000").pathname).toBe(ADMIN);

    const after = await db.user.findUniqueOrThrow({ where: { username: u.username } });
    expect(after.passwordHash).toBe(before.passwordHash);
  });

  test("change password: rotates this session, ends the others, old cookie stops working", async ({ page, browser }) => {
    const u = user("password");
    await useIp(page);
    await signIn(page, u);
    const oldCookie = (await sessionCookie(page))!.value;

    const other = await (await browser.newContext()).newPage();
    await useIp(other);
    await signIn(other, u);

    await page.goto(`${ADMIN}/password`);
    await page.getByLabel("Current password").fill("not my password");
    await page.getByLabel("New password", { exact: true }).fill("c0ffee123456 Zq new");
    await page.getByLabel("New password again").fill("c0ffee123456 Zq new");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(formErrors(page)).toContainText("Your current password is incorrect.");

    const newPassword = `${randomBytes(8).toString("hex")} Zq new`;
    await page.getByLabel("Current password").fill(u.password);
    await page.getByLabel("New password", { exact: true }).fill(newPassword);
    await page.getByLabel("New password again").fill(newPassword);
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByRole("status")).toHaveText("Password changed. Other devices have been signed out.");

    const newCookie = (await sessionCookie(page))!.value;
    expect(newCookie).not.toBe(oldCookie);
    await page.goto(ADMIN);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await other.reload();
    await expect(signInHeading(other)).toBeVisible();

    const reused = await withCookie(browser, oldCookie);
    await reused.goto(ADMIN);
    await expect(signInHeading(reused)).toBeVisible();

    await useIp(reused);
    await signIn(reused, u, newPassword);
  });
});
