// Assembles .next/standalone so it can serve static files on its own (same steps as .github/workflows/build.yml).
// The ZIP uploaded to cPanel must come from GitHub Actions: a Windows build bundles Windows Prisma/sharp binaries.
import { cpSync, existsSync } from "node:fs";

const standalone = ".next/standalone";

if (!existsSync(`${standalone}/server.js`)) {
  console.error("No .next/standalone/server.js. Run `npm run build` first.");
  process.exit(1);
}

cpSync(".next/static", `${standalone}/.next/static`, { recursive: true });
cpSync("public", `${standalone}/public`, { recursive: true });
console.log(`Assembled ${standalone}. Test it with: node ${standalone}/server.js`);

if (process.platform !== "linux") {
  console.warn(
    "Warning: built on " +
      process.platform +
      ". Do not upload this to cPanel; use the GitHub Actions artifact (docs/06).",
  );
}
