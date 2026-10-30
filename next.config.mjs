import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const isDev = process.env.NODE_ENV === "development";
// HSTS and HTTPS upgrades only make sense on a real HTTPS deployment, not a local `next start`.
const canonical = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const httpsOnly = !isDev && !canonical.includes("localhost") && !canonical.startsWith("http://");

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js streams inline bootstrap scripts; the site loads no third-party scripts.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(httpsOnly ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(httpsOnly ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  poweredByHeader: false,
  // Cloudinary resizes images itself, but these lists still decide which srcset
  // widths next/image requests. Keep the steps close to real layout sizes so a
  // thumbnail never downloads a desktop-sized file.
  images: {
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600, 1920, 2048],
    imageSizes: [48, 64, 96, 128, 160, 200, 256, 320, 384, 480],
  },
  // A package-lock.json exists higher up (C:\Users\TGNE); pin the root to this project.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
