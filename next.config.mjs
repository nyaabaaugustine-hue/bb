import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // A package-lock.json exists higher up (C:\Users\TGNE); pin the root to this project.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
};

export default nextConfig;
