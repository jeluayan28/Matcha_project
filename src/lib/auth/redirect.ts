// Only allow same-site relative paths, to avoid open redirects via ?next=.
//
// Control characters and backslashes are rejected outright: URL parsers silently strip
// tabs/newlines and browsers treat "\" as "/", so "/\t/evil.com" or "/\evil.com" would
// otherwise turn into the protocol-relative URL "//evil.com". The final check resolves
// the path and confirms it stays on the same origin.
export function safeNext(next: string | null | undefined, fallback = "/account") {
  if (!next || next.length > 2048) return fallback;
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  try {
    if (new URL(next, "http://local.invalid").origin !== "http://local.invalid") return fallback;
  } catch {
    return fallback;
  }
  return next;
}
