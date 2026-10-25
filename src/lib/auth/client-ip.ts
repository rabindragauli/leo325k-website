import { isIP } from "node:net";

/**
 * The client's IP for throttling, or null when unknown.
 *
 * Trusts only the RIGHTMOST X-Forwarded-For entry: the one added by the server's own proxy
 * (LiteSpeed on cPanel, docs/06). Entries to its left come from the client and can be forged.
 * Next.js fills the header from the socket only when it is absent, so local dev gets ::1 / 127.0.0.1.
 */
export function getClientIp(headers: Pick<Headers, "get">): string | null {
  const last = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "";
  return isIP(last) ? last : null;
}
