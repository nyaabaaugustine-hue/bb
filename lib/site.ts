/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL in the hosting environment. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://bbhomes.example.com").replace(/\/+$/, "");
