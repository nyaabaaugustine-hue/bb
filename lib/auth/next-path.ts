// Pure helper (no server or client imports) so the proxy, server pages and the
// client AuthForm all validate the post-login destination the same way.
const ACCOUNT_PATH = /^\/account(?:\/[a-z0-9-]+)?$/;
const HOME_PATH = /^\/homes\/[a-z0-9-]+$/;

export function safeNextPath(value: string | null | undefined, fallback = "/account") {
  if (!value) return fallback;
  if (value === "/admin" || ACCOUNT_PATH.test(value) || HOME_PATH.test(value)) return value;
  return fallback;
}

export function loginPathFor(next: string) {
  return `/login?next=${encodeURIComponent(safeNextPath(next))}`;
}
