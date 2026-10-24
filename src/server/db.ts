import "server-only";
import { PrismaClient } from "@prisma/client";

// One shared Prisma client per server process. In development, hot reloads re-evaluate modules,
// so the client is kept on globalThis to avoid opening a new connection pool on every edit.
// On shared hosting, cap the pool in DATABASE_URL (?connection_limit=5, see .env.example).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
