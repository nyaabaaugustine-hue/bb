import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { loadMessageCustomer, loadMessageThread, loadMessageThreads } from "@/lib/admin-data";
import { canAccessOperations, getPortalRole, getSessionUser, type PortalRole } from "@/lib/portal";
import { isRecord } from "@/lib/portal-domain";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Access =
  | { user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>; role: PortalRole }
  | { response: NextResponse };

async function operationsSession(): Promise<Access> {
  const user = await getSessionUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  const role = await getPortalRole(user);
  if (!canAccessOperations(role)) {
    return { response: NextResponse.json({ error: "Staff or administrator access is required." }, { status: 403 }) };
  }
  return { user, role };
}

export async function GET(request: Request) {
  let access;
  try {
    access = await operationsSession();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if ("response" in access) return access.response;

  const userId = new URL(request.url).searchParams.get("userId")?.trim() ?? "";
  try {
    if (!userId) return NextResponse.json({ threads: await loadMessageThreads(50) });
    if (userId.length > 200) return NextResponse.json({ error: "Choose a valid customer." }, { status: 400 });

    const customer = await loadMessageCustomer(userId);
    if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

    const messages = await loadMessageThread(userId);
    await getPool().query(
      `UPDATE portal_messages
       SET read_at = now()
       WHERE user_id = $1 AND author_role = 'customer' AND read_at IS NULL`,
      [userId],
    );
    return NextResponse.json({ customer, messages });
  } catch (error) {
    console.error("Admin message thread failed", error);
    return NextResponse.json({ error: "We couldn't load that conversation." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  let access;
  try {
    access = await operationsSession();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if ("response" in access) return access.response;

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8_192) {
      return NextResponse.json({ error: "That reply is too long." }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Enter a valid reply." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Enter a valid reply." }, { status: 400 });

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!userId || userId.length > 200) {
    return NextResponse.json({ error: "Choose a customer." }, { status: 400 });
  }
  if (text.length < 2 || text.length > 4_000) {
    return NextResponse.json({ error: "Write a reply between 2 and 4,000 characters." }, { status: 400 });
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const customer = await client.query("SELECT 1 FROM portal_customers WHERE id = $1", [userId]);
    if (!customer.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }
    const { rows } = await client.query(
      `INSERT INTO portal_messages (user_id, author_id, author_role, body)
       VALUES ($1, $2, 'team', $3)
       RETURNING id, user_id, request_id, author_role, body, read_at, created_at`,
      [userId, access.user.id, text],
    );
    await client.query(
      `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'team_message_sent', 'portal_messages', $2, $3::jsonb)`,
      [access.user.id, rows[0].id, JSON.stringify({ userId })],
    );
    await client.query("COMMIT");
    return NextResponse.json({ message: rows[0] }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin message reply failed", error);
    return NextResponse.json({ error: "We couldn't send that reply." }, { status: 503 });
  } finally {
    client.release();
  }
}
