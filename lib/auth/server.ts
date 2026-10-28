import { createNeonAuth } from "@neondatabase/auth/next/server";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const cookieSecret = requiredEnv("NEON_AUTH_COOKIE_SECRET");
if (cookieSecret.length < 32) {
  throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters.");
}

export const auth = createNeonAuth({
  baseUrl: requiredEnv("NEON_AUTH_BASE_URL"),
  cookies: {
    secret: cookieSecret,
  },
});
