import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../src/lib/auth/password.mjs";

// Creates throwaway admin portal users for the e2e tests: random usernames and passwords, held in
// memory only (passed to the workers through process.env, never written to disk). Prisma reads
// DATABASE_URL from .env itself. global-teardown.ts deletes everything again.
export type E2EUser = { key: string; username: string; password: string; role: "ADMIN" | "EDITOR" };

export default async function globalSetup() {
  process.env.E2E_STARTED_AT = new Date().toISOString();
  const db = new PrismaClient();
  try {
    const users: E2EUser[] = [];
    for (const [key, role] of [
      ["admin", "ADMIN"],
      ["editor", "EDITOR"],
      ["lockout", "ADMIN"],
      ["password", "ADMIN"],
    ] as const) {
      const user: E2EUser = {
        key,
        role,
        username: `e2e_${key}_${randomBytes(4).toString("hex")}`,
        password: `${randomBytes(18).toString("base64url")} Zq`,
      };
      await db.user.create({
        data: {
          username: user.username,
          displayName: `E2E ${key}`,
          role,
          passwordHash: await hashPassword(user.password),
        },
      });
      users.push(user);
    }
    process.env.E2E_USERS = JSON.stringify(users);
  } finally {
    await db.$disconnect();
  }
}
