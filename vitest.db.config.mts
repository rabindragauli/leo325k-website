import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// `npm run test:db`: query tests against the local seeded database (never run in CI).
// "server-only" resolves to its own empty module here, as it does for React Server Components.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    include: ["tests/db/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
  },
});
