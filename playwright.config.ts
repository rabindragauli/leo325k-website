import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

// Smoke tests (Sprint 7). Install the browser once with: npx playwright install chromium
//
// The test server gets a random admin slug and auth secret (environment variables win over .env),
// so the real ADMIN_SLUG never appears in test output, traces or error messages, and test throttle
// rows can never match real ones. Set here once; test workers inherit them.
process.env.E2E_ADMIN_SLUG ??= `e2e-${randomBytes(6).toString("hex")}`;
process.env.E2E_AUTH_SECRET ??= randomBytes(32).toString("base64url");

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
      testIgnore: /admin-auth\.spec\.ts/, // auth behaviour does not depend on the viewport
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    // Always a fresh server with the test slug/secret: stop any other `npm run dev` first.
    reuseExistingServer: false,
    env: { ADMIN_SLUG: process.env.E2E_ADMIN_SLUG, AUTH_SECRET: process.env.E2E_AUTH_SECRET },
  },
});
