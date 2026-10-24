// `npm run db:reset`: drop and recreate the LOCAL database, re-apply migrations and run the seed.
// Refuses to run unless DATABASE_URL points to localhost / 127.0.0.1. Never prints the URL.
import { spawnSync } from "node:child_process";

try {
  process.loadEnvFile(".env"); // values already set in the environment win
} catch {
  // no .env file: rely on the environment
}

let host = "";
try {
  host = new URL(process.env.DATABASE_URL ?? "").hostname;
} catch {
  // not a valid URL: refused below
}

if (host !== "localhost" && host !== "127.0.0.1") {
  console.error("db:reset refused: DATABASE_URL must point to localhost or 127.0.0.1.");
  process.exit(1);
}

const result = spawnSync("npx prisma migrate reset --force", { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
