"use server";
import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getClientIp } from "@/lib/auth/client-ip";
import {
  checkNewPassword,
  hashPassword,
  normalizeUsername,
  verifyPassword,
} from "@/lib/auth/password.mjs";
import { assertAdminGate, requireUser } from "@/server/auth/guards";
import {
  LOGIN_ERROR,
  attemptLogin,
  isLoginBlocked,
  log,
  recordPasswordCheckFailure,
} from "@/server/auth/login";
import { createSession, deleteCurrentSession, endUserSessions } from "@/server/auth/session";
import { db } from "@/server/db";

// Admin server actions. Only admin files import this module. Each action runs its guard on the
// first line, because an action can be POSTed directly to any URL (docs/07).

export type SignInState = { error: string; username: string } | null;
export type PasswordState = { errors: string[] } | { ok: true } | null;

// Length caps only: the real rules run in attemptLogin / checkNewPassword.
const text = (max: number) => z.string().max(max);
const signInSchema = z.object({ username: text(100), password: text(1000) });
const passwordSchema = z.object({ current: text(1000), next: text(1000), confirm: text(1000) });

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const { base, secret } = await assertAdminGate();
  const parsed = signInSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  const username = parsed.success ? normalizeUsername(parsed.data.username) : "";
  if (!parsed.success || !username || !parsed.data.password) {
    return { error: LOGIN_ERROR, username };
  }

  const ip = getClientIp(await headers());
  const result = await attemptLogin(username, parsed.data.password, ip, secret);
  if (!result.ok) return { error: result.error, username };
  redirect(base);
}

export async function signOut() {
  const { base, user } = await requireUser();
  await deleteCurrentSession();
  await log("auth.logout", user.id, "Signed out");
  redirect(base);
}

export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const { user, secret } = await requireUser();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { errors: ["Fill in all three fields."] };
  const { current, next, confirm } = parsed.data;

  const ip = getClientIp(await headers());
  if (await isLoginBlocked(user.username, ip, secret)) {
    return { errors: ["Too many wrong attempts. Wait 15 minutes and try again."] };
  }
  const row = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!row || !(await verifyPassword(current, row.passwordHash))) {
    await recordPasswordCheckFailure(user.username, ip, secret);
    return { errors: ["Your current password is incorrect."] };
  }
  if (next !== confirm) return { errors: ["The two new passwords do not match."] };
  const problems = await checkNewPassword(next, { username: user.username, currentHash: row.passwordHash });
  if (problems.length) return { errors: problems };

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  // End every session (other devices too) and sign this browser in again with a new token.
  await endUserSessions(user.id);
  await createSession(user.id);
  await log("auth.password_change", user.id, "Password changed; all other sessions ended");
  return { ok: true };
}
