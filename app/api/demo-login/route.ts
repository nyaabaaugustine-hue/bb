import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";
import { portalRoles, type PortalRole } from "@/lib/portal-roles";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-click demo sign-in for local testing only. The route disappears outside
 * development and requires the same explicit TEST_USERS_ENABLED opt-in as the
 * test-user seeder; credentials come from the TEST_* env vars and are never
 * sent to the browser.
 */
const demoRoles: Record<PortalRole, { name: string; emailVar: string; passwordVar: string; redirect: string }> = {
  customer: { name: "Demo customer", emailVar: "TEST_CUSTOMER_EMAIL", passwordVar: "TEST_CUSTOMER_PASSWORD", redirect: "/account" },
  staff: { name: "Demo staff", emailVar: "TEST_STAFF_EMAIL", passwordVar: "TEST_STAFF_PASSWORD", redirect: "/admin" },
  administrator: { name: "Demo administrator", emailVar: "TEST_ADMIN_EMAIL", passwordVar: "TEST_ADMIN_PASSWORD", redirect: "/admin" },
};

function demoEnabled() {
  return process.env.NODE_ENV === "development" && process.env.TEST_USERS_ENABLED === "true";
}

function readCredentials(role: PortalRole) {
  const config = demoRoles[role];
  const email = process.env[config.emailVar]?.trim().toLowerCase();
  const password = process.env[config.passwordVar];
  return email && password ? { email, password } : null;
}

type DemoIdentity = { id: string };

async function provision(userId: string, role: PortalRole, email: string, name: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE neon_auth.user SET "emailVerified" = true, "updatedAt" = now()
       WHERE id = $1 AND "emailVerified" = false`,
      [userId],
    );
    await client.query(
      `INSERT INTO portal_customers (id, email, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now()`,
      [userId, email, name],
    );
    await client.query(
      `INSERT INTO portal_user_roles (user_id, role, assigned_by)
       VALUES ($1, $2, 'demo-login')
       ON CONFLICT (user_id) DO UPDATE
         SET role = EXCLUDED.role, assigned_by = 'demo-login', updated_at = now()`,
      [userId, role],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function findUserId(email: string) {
  const { rows } = await getPool().query<DemoIdentity>(
    `SELECT id FROM neon_auth.user WHERE lower(email) = lower($1) LIMIT 1`,
    [email],
  );
  return rows[0]?.id ?? null;
}

export async function POST(request: Request) {
  if (!demoEnabled()) return new NextResponse(null, { status: 404 });
  if (!hasSameOrigin(request)) return new NextResponse(null, { status: 403 });

  const role = new URL(request.url).searchParams.get("role");
  if (!role || !portalRoles.includes(role as PortalRole)) {
    return NextResponse.json({ error: "Choose a demo role." }, { status: 400 });
  }
  const demoRole = role as PortalRole;
  const config = demoRoles[demoRole];
  const credentials = readCredentials(demoRole);
  if (!credentials) {
    return NextResponse.json(
      { error: "Demo logins are not configured. Add the TEST_* credentials to .env.local." },
      { status: 503 },
    );
  }

  const signIn = () => auth.signIn.email(credentials);
  const firstTry = await signIn();
  let userId = firstTry.data?.user?.id ?? null;

  if (!userId) {
    const signUp = await auth.signUp.email({ ...credentials, name: config.name });
    userId = signUp.data?.user?.id ?? (await findUserId(credentials.email));
    if (!userId) {
      console.error("[demo-login] sign-in failed", firstTry.error?.code, firstTry.error?.status, firstTry.error?.message);
      console.error("[demo-login] sign-up failed", signUp.error?.code, signUp.error?.status, signUp.error?.message);
      return NextResponse.json(
        { error: "Could not create the demo account. Check the TEST_* credentials and Neon Auth settings." },
        { status: 502 },
      );
    }
    await provision(userId, demoRole, credentials.email, config.name);
    const retry = await signIn();
    userId = retry.data?.user?.id ?? null;
    if (!userId && retry.error) console.error("[demo-login] retry failed", retry.error.code, retry.error.status, retry.error.message);
    if (!userId) {
      return NextResponse.json(
        { error: "The demo account exists but sign-in failed. Check the TEST_* credentials in .env.local." },
        { status: 502 },
      );
    }
  }

  await provision(userId, demoRole, credentials.email, config.name);
  return NextResponse.json({ redirect: config.redirect });
}
