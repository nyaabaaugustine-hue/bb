import nextEnv from "@next/env";
import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthVanillaAdapter } from "@neondatabase/auth/vanilla/adapters";
import pg from "pg";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const { Pool } = pg;

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Set ${name} before seeding test users.`);
  return value;
}

if (process.env.TEST_USERS_ENABLED !== "true") {
  throw new Error("Set TEST_USERS_ENABLED=true to explicitly enable test-user creation.");
}
if (process.env.NODE_ENV === "production") {
  throw new Error("Test users cannot be seeded while NODE_ENV=production.");
}

const target = required("TEST_USERS_TARGET").toLowerCase();
if (target !== "development" && target !== "staging") {
  throw new Error("TEST_USERS_TARGET must be development or staging.");
}

const branch = required("NEON_BRANCH");
if (required("TEST_USERS_CONFIRM_BRANCH") !== branch) {
  throw new Error("TEST_USERS_CONFIRM_BRANCH must exactly match NEON_BRANCH.");
}
if (["main", "master", "prod", "production"].includes(branch.toLowerCase())) {
  throw new Error("Test users cannot be seeded on a protected production branch.");
}

const authBaseUrl = new URL(required("NEON_AUTH_BASE_URL"));
if (!["http:", "https:"].includes(authBaseUrl.protocol)) {
  throw new Error("NEON_AUTH_BASE_URL must use HTTP or HTTPS.");
}

const bootstrapAdmins = required("SUPER_ADMIN_EMAILS")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const testUsers = [
  { role: "administrator", name: "RBAC Test Administrator", email: required("TEST_ADMIN_EMAIL"), password: required("TEST_ADMIN_PASSWORD") },
  { role: "staff", name: "RBAC Test Staff", email: required("TEST_STAFF_EMAIL"), password: required("TEST_STAFF_PASSWORD") },
  { role: "customer", name: "RBAC Test Customer", email: required("TEST_CUSTOMER_EMAIL"), password: required("TEST_CUSTOMER_PASSWORD") },
].map((user) => ({ ...user, email: user.email.toLowerCase() }));

if (!bootstrapAdmins.includes(testUsers[0].email)) {
  throw new Error("TEST_ADMIN_EMAIL must also be listed in SUPER_ADMIN_EMAILS.");
}
if (new Set(testUsers.map(({ email }) => email)).size !== testUsers.length) {
  throw new Error("Use a different email address for each test role.");
}
for (const user of testUsers) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    throw new Error(`TEST_${user.role.toUpperCase()}_EMAIL must be a valid email address.`);
  }
  if (user.password.length < 12 || user.password.length > 128) {
    throw new Error(`TEST_${user.role.toUpperCase()}_PASSWORD must be 12–128 characters.`);
  }
}

const rawConnectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error("Set DATABASE_URL_UNPOOLED or DATABASE_URL before seeding test users.");
}
const connectionUrl = new URL(rawConnectionString);
const sslMode = connectionUrl.searchParams.get("sslmode")?.toLowerCase();
if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
  connectionUrl.searchParams.set("sslmode", "verify-full");
}

async function createOrSignIn(user) {
  const client = createAuthClient(authBaseUrl.toString(), {
    adapter: BetterAuthVanillaAdapter(),
  });
  const input = { email: user.email, password: user.password, name: user.name };
  const signup = await client.signUp.email(input);
  if (!signup.error && signup.data?.user?.id) return signup.data.user;

  const signin = await client.signIn.email({ email: user.email, password: user.password });
  if (signin.error || !signin.data?.user?.id) {
    throw new Error(`Could not create or sign in the configured ${user.role} test account. Check the test credentials and Auth branch settings.`);
  }
  return signin.data.user;
}

const pool = new Pool({
  connectionString: connectionUrl.toString(),
  max: 1,
  connectionTimeoutMillis: 10_000,
});

try {
  for (const testUser of testUsers) {
    const identity = await createOrSignIn(testUser);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO portal_customers (id, email, display_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE
           SET email = EXCLUDED.email,
               display_name = EXCLUDED.display_name,
               updated_at = now()`,
        [identity.id, testUser.email, testUser.name],
      );
      await client.query(
        `INSERT INTO portal_user_roles (user_id, role, assigned_by)
         VALUES ($1, $2, 'test-user-seed')
         ON CONFLICT (user_id) DO UPDATE
           SET role = EXCLUDED.role,
               assigned_by = EXCLUDED.assigned_by,
               updated_at = now()`,
        [identity.id, testUser.role],
      );
      await client.query("COMMIT");
      console.log(`Ready: ${testUser.role} account ${testUser.email}${identity.emailVerified ? "" : " (email verification may be required)"}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  console.log(`Test accounts seeded on the confirmed ${target} branch "${branch}". Passwords were not printed or stored by this script.`);
} finally {
  await pool.end();
}
