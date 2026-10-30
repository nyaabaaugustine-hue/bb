import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { ensurePortalCustomer, getSessionUser } from "@/lib/portal";
import { isRecord } from "@/lib/portal-domain";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export async function GET() {
  let user;
  try {
    user = await getSessionUser();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: "Sign in to view your messages." }, { status: 401 });

  try {
    await ensurePortalCustomer(user);
    const db = getPool();
    const { rows } = await db.query(
      `SELECT id, request_id, author_role, body, read_at, created_at
       FROM portal_messages
       WHERE user_id = $1
       ORDER BY created_at ASC
       LIMIT 300`,
      [user.id],
    );
    await db.query(
      `UPDATE portal_messages
       SET read_at = now()
       WHERE user_id = $1 AND author_role = 'team' AND read_at IS NULL`,
      [user.id],
    );
    return NextResponse.json({ messages: rows });
  } catch (error) {
    console.error("Customer message list failed", error);
    return NextResponse.json({ error: "We couldn't load your messages right now." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  let user;
  try {
    user = await getSessionUser();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: "Sign in before sending a message." }, { status: 401 });

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8_192) {
      return NextResponse.json({ error: "That message is too long." }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Enter a valid message." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Enter a valid message." }, { status: 400 });

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (text.length < 2 || text.length > 4_000) {
    return NextResponse.json({ error: "Write a message between 2 and 4,000 characters." }, { status: 400 });
  }

  let requestId: string | null = null;
  if (body.requestId !== undefined && body.requestId !== "" && body.requestId !== null) {
    if (typeof body.requestId !== "string" || !UUID.test(body.requestId)) {
      return NextResponse.json({ error: "Choose a valid request to attach." }, { status: 400 });
    }
    requestId = body.requestId;
  }

  try {
    await ensurePortalCustomer(user);
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1)::bigint)", [`portal-message-limit:${user.id}`]);
      const { rows: countRows } = await client.query<{ count: number }>(
        `SELECT count(*)::int AS count
         FROM portal_messages
         WHERE user_id = $1 AND author_role = 'customer' AND created_at > now() - interval '1 hour'`,
        [user.id],
      );
      if (countRows[0].count >= 30) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "You've sent a lot of messages in the last hour. Please try again shortly." }, { status: 429 });
      }

      if (requestId) {
        const owned = await client.query(
          "SELECT 1 FROM portal_requests WHERE id = $1 AND user_id = $2",
          [requestId, user.id],
        );
        if (!owned.rowCount) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "That request is not on your account." }, { status: 404 });
        }
      }

      const { rows } = await client.query(
        `INSERT INTO portal_messages (user_id, request_id, author_id, author_role, body)
         VALUES ($1, $2, $3, 'customer', $4)
         RETURNING id, request_id, author_role, body, read_at, created_at`,
        [user.id, requestId, user.id, text],
      );
      await client.query(
        `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, 'customer_message_sent', 'portal_messages', $2, $3::jsonb)`,
        [user.id, rows[0].id, JSON.stringify({ requestId })],
      );
      await client.query("COMMIT");
      return NextResponse.json({ message: rows[0] }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Customer message creation failed", error);
    return NextResponse.json({ error: "We couldn't send your message. Please try again." }, { status: 503 });
  }
}
