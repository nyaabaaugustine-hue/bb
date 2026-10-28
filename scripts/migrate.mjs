import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import pg from "pg";

const { Pool } = pg;
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const rawConnectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("Set DATABASE_URL_UNPOOLED or DATABASE_URL before applying migrations.");
}

const connectionUrl = new URL(rawConnectionString);
const sslMode = connectionUrl.searchParams.get("sslmode")?.toLowerCase();
if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
  connectionUrl.searchParams.set("sslmode", "verify-full");
}
const connectionString = connectionUrl.toString();

const migrationDirectory = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });

try {
  await pool.query(`CREATE TABLE IF NOT EXISTS app_schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);

  const files = (await readdir(migrationDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const name of files) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1)::bigint)", ["bbhomes-schema-migrations"]);
      const { rowCount } = await client.query(
        "SELECT 1 FROM app_schema_migrations WHERE name = $1",
        [name],
      );
      if (rowCount) {
        await client.query("COMMIT");
        console.log(`Already applied: ${name}`);
        continue;
      }

      const migration = await readFile(join(migrationDirectory, name), "utf8");
      await client.query(migration);
      await client.query("INSERT INTO app_schema_migrations (name) VALUES ($1)", [name]);
      await client.query("COMMIT");
      console.log(`Applied: ${name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
