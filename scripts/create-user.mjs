// `npm run user:create`: create an admin portal account interactively (docs/07).
// Asks for username, display name, role and password (hidden, typed twice). Prints no secrets.
// Refuses NODE_ENV=production unless --allow-production is passed (needed once on cPanel).
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";
import {
  USERNAME_RE,
  checkNewPassword,
  hashPassword,
  normalizeUsername,
} from "../src/lib/auth/password.mjs";

try {
  process.loadEnvFile(".env"); // values already set in the environment win
} catch {
  // no .env file: rely on the environment
}

if (process.env.NODE_ENV === "production" && !process.argv.includes("--allow-production")) {
  console.error("Refused: NODE_ENV is production. Run with --allow-production if this is intended.");
  process.exit(1);
}
if (!process.stdin.isTTY) {
  console.error("Run this in an interactive terminal (the password prompt needs one).");
  process.exit(1);
}

const prisma = new PrismaClient();

/** Visible question. Readline is opened per question so it never listens during askHidden. */
async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await rl.question(question);
  } finally {
    rl.close();
  }
}

/** Reads one line without echoing it. */
function askHidden(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    let value = "";
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          // Ctrl+C
          stdin.setRawMode(false);
          process.stdout.write("\n");
          process.exit(130);
        }
        if (char === "\u007f" || char === "\b") value = [...value].slice(0, -1).join("");
        else if (char >= " ") value += char;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  let username;
  for (;;) {
    username = normalizeUsername(await ask("Username (3–32: a-z 0-9 . _ -): "));
    if (!USERNAME_RE.test(username)) {
      console.log("Use 3–32 characters: lowercase letters, digits, dot, underscore or hyphen.");
      continue;
    }
    if (await prisma.user.findUnique({ where: { username }, select: { id: true } })) {
      console.error("That username already exists. Nothing was changed.");
      process.exit(1);
    }
    break;
  }

  const displayName =
    (await ask(`Display name [${username}]: `)).trim().slice(0, 100) || username;

  let role;
  for (;;) {
    const answer = (await ask("Role (admin/editor): ")).trim().toLowerCase();
    if (answer === "admin" || answer === "editor") {
      role = answer.toUpperCase();
      break;
    }
  }

  let password;
  for (;;) {
    password = await askHidden("Password (min 12 characters): ");
    const problems = await checkNewPassword(password, { username });
    if (problems.length) {
      for (const problem of problems) console.log(`- ${problem}`);
      continue;
    }
    if ((await askHidden("Type it again: ")) !== password) {
      console.log("The two passwords differ. Try again.");
      continue;
    }
    break;
  }

  await prisma.user.create({
    data: { username, displayName, role, passwordHash: await hashPassword(password) },
  });
  console.log(`Created ${role === "ADMIN" ? "Admin" : "Editor"} user ${username}.`);
}

try {
  await main();
} catch (error) {
  // Prisma errors can include connection details, so print only the error code/name
  console.error(`Failed: ${error?.code ?? error?.name ?? "unknown error"}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
