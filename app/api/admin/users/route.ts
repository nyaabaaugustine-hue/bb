import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { loadRoleUsers } from "@/lib/admin-data";
import {
  getBootstrapAdministratorEmails,
  getPortalRole,
  getSessionUser,
  isBootstrapAdministratorEmail,
  portalRoles,
  type PortalRole,
} from "@/lib/portal";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function administrator() {
  const user = await getSessionUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (await getPortalRole(user) !== "administrator") {
    console.warn("Denied role management access", { userId: user.id });
    return { response: NextResponse.json({ error: "Administrator access is required." }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  let access;
  try {
    access = await administrator();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if ("response" in access) return access.response;

  try {
    return NextResponse.json({ users: await loadRoleUsers() });
  } catch (error) {
    console.error("Role management user list failed", error);
    return NextResponse.json({ error: "We couldn't load user roles." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  let access;
  try {
    access = await administrator();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if ("response" in access) return access.response;

  let body: unknown;
  try {
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > 2048) {
      return NextResponse.json({ error: "The role change request is too large." }, { status: 413 });
    }
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 2048) {
      return NextResponse.json({ error: "The role change request is too large." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Enter a valid role change." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Enter a valid role change." }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const userId = typeof values.userId === "string" ? values.userId.trim() : "";
  const role = values.role;
  if (!userId || userId.length > 200 || typeof role !== "string" || !portalRoles.includes(role as PortalRole)) {
    return NextResponse.json({ error: "Choose a valid user and role." }, { status: 400 });
  }
  if (userId === access.user.id) {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 409 });
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1)::bigint)", ["portal-user-role-management"]);

    const target = await client.query<{ email: string }>(
      "SELECT email FROM portal_customers WHERE id = $1 FOR UPDATE",
      [userId],
    );
    if (!target.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Select an existing customer account." }, { status: 404 });
    }

    if (isBootstrapAdministratorEmail(target.rows[0].email) && role !== "administrator") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Bootstrap administrators are controlled by SUPER_ADMIN_EMAILS." }, { status: 409 });
    }

    const current = await client.query<{ role: PortalRole }>(
      "SELECT role FROM portal_user_roles WHERE user_id = $1 FOR UPDATE",
      [userId],
    );
    const previousRole = current.rows[0]?.role ?? "customer";
    if (previousRole === "administrator" && role !== "administrator") {
      const { rows } = await client.query<{ count: string }>(
        `SELECT count(*)::text AS count
         FROM (
           SELECT user_id FROM portal_user_roles WHERE role = 'administrator'
           UNION
           SELECT id FROM portal_customers WHERE lower(email) = ANY($1::text[])
         ) AS administrators`,
        [getBootstrapAdministratorEmails()],
      );
      if (Number(rows[0].count) <= 1) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "At least one administrator must remain." }, { status: 409 });
      }
    }

    await client.query(
      `INSERT INTO portal_user_roles (user_id, role, assigned_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE
         SET role = EXCLUDED.role,
             assigned_by = EXCLUDED.assigned_by,
             updated_at = now()`,
      [userId, role, access.user.id],
    );
    await client.query(
      `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'user_role_changed', 'portal_user_roles', $2, $3::jsonb)`,
      [access.user.id, userId, JSON.stringify({ previousRole, role })],
    );
    await client.query("COMMIT");
    return NextResponse.json({ userId, role });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Role change failed", error);
    return NextResponse.json({ error: "We couldn't update that user's role." }, { status: 503 });
  } finally {
    client.release();
  }
}
