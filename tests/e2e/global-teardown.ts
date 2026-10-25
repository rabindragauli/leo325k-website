import { PrismaClient } from "@prisma/client";
import type { E2EUser } from "./global-setup";

// Deletes what the e2e run created: the throwaway users (their sessions cascade), their activity
// rows, the "unknown username" rows, and the run's throttle rows. Only the test server (with its own
// random AUTH_SECRET) writes during the run, so rows touched since the start belong to it.
export default async function globalTeardown() {
  const users: E2EUser[] = JSON.parse(process.env.E2E_USERS ?? "[]");
  const startedAt = new Date(process.env.E2E_STARTED_AT ?? Date.now());
  const db = new PrismaClient();
  try {
    const ids = (
      await db.user.findMany({ where: { username: { in: users.map((u) => u.username) } }, select: { id: true } })
    ).map((u) => u.id);
    await db.activityLog.deleteMany({
      where: {
        createdAt: { gte: startedAt },
        action: { startsWith: "auth." },
        OR: [{ userId: { in: ids } }, { userId: null }],
      },
    });
    await db.loginThrottle.deleteMany({ where: { updatedAt: { gte: startedAt } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  } finally {
    await db.$disconnect();
  }
}
