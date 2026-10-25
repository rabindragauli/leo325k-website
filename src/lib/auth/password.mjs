// Username and password rules, shared by the app and scripts/create-user.mjs (plain JS so the
// script runs with bare `node`, also on cPanel). Rules: docs/07_SECURITY_AND_PRIVACY.md.
import bcrypt from "bcryptjs";

export const BCRYPT_COST = 12;
export const PASSWORD_MIN_CHARS = 12;
export const PASSWORD_MAX_BYTES = 72; // bcrypt ignores everything after 72 bytes

export const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

/** @param {string} raw */
export function normalizeUsername(raw) {
  return raw.trim().toLowerCase();
}

// Common passwords of 12+ characters (the shorter classics are already refused by the length rule).
const COMMON = new Set([
  "123456789012",
  "1234567890123",
  "12345678901234",
  "123456789123",
  "111111111111",
  "000000000000",
  "121212121212",
  "123123123123",
  "987654321098",
  "qwertyuiopas",
  "qwertyuiop12",
  "qwertyuiop123",
  "qwerty123456",
  "1qaz2wsx3edc",
  "1q2w3e4r5t6y",
  "q1w2e3r4t5y6",
  "zaq12wsxcde3",
  "asdfghjkl123",
  "zxcvbnm12345",
  "password1234",
  "password12345",
  "password123456",
  "password@123",
  "password@1234",
  "password!123",
  "passwordpassword",
  "p@ssw0rd1234",
  "p@ssword1234",
  "passw0rd1234",
  "mypassword123",
  "iloveyou1234",
  "iloveyou12345",
  "letmein12345",
  "welcome12345",
  "welcome@1234",
  "administrator",
  "administrator1",
  "admin1234567",
  "admin@123456",
  "adminadmin123",
  "changeme1234",
  "changeme12345",
  "superman1234",
  "football1234",
  "baseball1234",
  "basketball12",
  "sunshine1234",
  "princess1234",
  "dragon123456",
  "monkey123456",
  "starwars1234",
  "trustno11234",
  "abcdefghijkl",
  "abcd12345678",
  "abc123456789",
  "aaaaaaaaaaaa",
  "computer1234",
  "internet1234",
  "whatever1234",
  "qwertyqwerty",
  "secret123456",
  "default12345",
  "nepal1234567",
  "nepal@123456",
  "kathmandu123",
  "kathmandu1234",
  "kathmandu@123",
  "pokhara12345",
  "everest12345",
  "mounteverest",
]);

const DISTRICT_WORDS = ["leo", "lions", "325k", "leodistrict"];

/**
 * Checks a new password. Returns a list of human-readable problems (empty = OK).
 * `currentHash` (when changing a password) makes "same as the current password" a problem too.
 * @param {string} password
 * @param {{ username: string, currentHash?: string }} context
 * @returns {Promise<string[]>}
 */
export async function checkNewPassword(password, { username, currentHash }) {
  const problems = [];
  if ([...password].length < PASSWORD_MIN_CHARS) {
    problems.push(`Use at least ${PASSWORD_MIN_CHARS} characters.`);
  }
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    problems.push(
      `Too long: at most ${PASSWORD_MAX_BYTES} bytes (most letters use 1 byte, Nepali letters use 3 bytes each).`,
    );
    return problems; // bcrypt cannot use the rest, so the checks below would be misleading
  }
  const lower = password.toLowerCase();
  const name = normalizeUsername(username);
  if (COMMON.has(lower)) problems.push("This password is too common.");
  if (name && lower.includes(name)) problems.push("Do not include your username.");
  if (DISTRICT_WORDS.some((word) => lower.includes(word))) {
    problems.push("Do not include “leo”, “lions”, “325k” or “leodistrict”.");
  }
  if (currentHash && problems.length === 0 && (await bcrypt.compare(password, currentHash))) {
    problems.push("Choose a password different from your current one.");
  }
  return problems;
}

/** @param {string} password */
export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_COST);
}

/** @type {Promise<string> | undefined} */
let dummy;
// Hash of a random value, computed once: unknown users still cost one bcrypt compare (same timing).
function dummyHash() {
  dummy ??= bcrypt.hash(crypto.randomUUID(), BCRYPT_COST);
  return dummy;
}

/**
 * Always runs exactly one bcrypt compare. Inputs over 72 bytes never match (bcrypt would truncate
 * them and accept "password + anything"), and a missing hash compares against the dummy hash.
 * @param {string} password
 * @param {string | null | undefined} hash
 */
export async function verifyPassword(password, hash) {
  const tooLong = Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES;
  const target = hash && !tooLong ? hash : await dummyHash();
  const match = await bcrypt.compare(password, target);
  return match && Boolean(hash) && !tooLong;
}
