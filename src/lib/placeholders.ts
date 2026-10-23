export type TextPart = { text: string; placeholder: boolean };

/**
 * Splits copy into plain text and [bracketed placeholders], e.g.
 * "Write to [official district email]." → ["Write to ", "[official district email]", "."].
 */
export function splitPlaceholders(text: string): TextPart[] {
  return text
    .split(/(\[[^\]]+\])/)
    .filter((part) => part !== "")
    .map((part) => ({ text: part, placeholder: /^\[[^\]]+\]$/.test(part) }));
}

/** True when the whole value is still a placeholder, e.g. "[District mission statement]". */
export function isPlaceholder(text: string | null | undefined): boolean {
  return !text || /^\[[^\]]+\]$/.test(text.trim());
}
