import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

type GlobalWithPool = typeof globalThis & { __bbhomesPool?: Pool };
const globalWithPool = globalThis as GlobalWithPool;

function normalizeSslMode(connectionString: string) {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode")?.toLowerCase();
  if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}

export function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Missing required environment variable: DATABASE_URL");

  if (!globalWithPool.__bbhomesPool) {
    const pool = new Pool({
      connectionString: normalizeSslMode(connectionString),
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
    attachDatabasePool(pool);
    globalWithPool.__bbhomesPool = pool;
  }

  return globalWithPool.__bbhomesPool;
}
