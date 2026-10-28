import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { canAccessOperations, getPortalRole, getSessionUser, type PortalRole } from "@/lib/portal";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestTransitions: Record<string, string[]> = {
  pending: ["in_review", "confirmed", "cancelled", "rejected"],
  in_review: ["confirmed", "completed", "cancelled", "rejected"],
  confirmed: ["completed", "cancelled"],
};
const ledgerStatuses = new Set(["verified", "rejected"]);
const ledgerTypes = new Set(["contribution", "withdrawal", "return", "fee"]);

type AdminAccess =
  | { user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>; role: PortalRole }
  | { response: NextResponse };

async function operationsSession(): Promise<AdminAccess> {
  const user = await getSessionUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  const role = await getPortalRole(user);
  if (!canAccessOperations(role)) {
    console.warn("Denied operations access", { userId: user.id });
    return { response: NextResponse.json({ error: "Staff or administrator access is required." }, { status: 403 }) };
  }
  return { user, role };
}

export async function GET() {
  let access;
  try {
    access = await operationsSession();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if ("response" in access) return access.response;

  try {
    const db = getPool();
    const [customers, requests, ledger] = await Promise.all([
      db.query("SELECT id, email, display_name FROM portal_customers ORDER BY display_name, email LIMIT 500"),
      db.query(
        `SELECT r.id, r.user_id, c.email, c.display_name, r.request_type, r.listing_slug,
                r.details, r.status, r.created_at
         FROM portal_requests r
         JOIN portal_customers c ON c.id = r.user_id
         ORDER BY r.created_at DESC
         LIMIT 500`,
      ),
      access.role === "administrator"
        ? db.query(
            `SELECT l.id, l.user_id, c.email, c.display_name, l.transaction_type, l.amount,
                    l.currency, l.reference, l.status, l.created_at, l.verified_at
             FROM investment_ledger l
             JOIN portal_customers c ON c.id = l.user_id
             ORDER BY l.created_at DESC
             LIMIT 500`,
          )
        : Promise.resolve({ rows: [] }),
    ]);
    return NextResponse.json({
      customers: customers.rows,
      requests: requests.rows,
      ledger: ledger.rows,
    });
  } catch (error) {
    console.error("Admin portal records failed", error);
    return NextResponse.json({ error: "We couldn't load the management records." }, { status: 503 });
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
  if (access.role !== "administrator") {
    return NextResponse.json({ error: "Administrator access is required for ledger records." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid ledger entry." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Enter a valid ledger entry." }, { status: 400 });
  }
  const values = body as Record<string, unknown>;
  const userId = typeof values.userId === "string" ? values.userId.trim() : "";
  const transactionType = typeof values.transactionType === "string" ? values.transactionType : "";
  const amount = typeof values.amount === "number" ? values.amount : Number(values.amount);
  const reference = typeof values.reference === "string" ? values.reference.trim() : "";
  if (!userId || userId.length > 200 || !ledgerTypes.has(transactionType) ||
      !Number.isFinite(amount) || amount <= 0 || amount > 100_000_000 ||
      Math.round(amount * 100) / 100 !== amount || reference.length < 3 || reference.length > 120) {
    return NextResponse.json({ error: "Check the customer, transaction type, amount and reference." }, { status: 400 });
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const customer = await client.query("SELECT 1 FROM portal_customers WHERE id = $1", [userId]);
    if (!customer.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Select a customer who has used the portal." }, { status: 404 });
    }
    const { rows } = await client.query(
      `INSERT INTO investment_ledger (user_id, transaction_type, amount, reference, recorded_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, transaction_type, amount, currency, reference, status, created_at`,
      [userId, transactionType, amount, reference, access.user.id],
    );
    await client.query(
      `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'ledger_entry_created', 'investment_ledger', $2, $3::jsonb)`,
      [access.user.id, rows[0].id, JSON.stringify({ userId, transactionType, amount, reference })],
    );
    await client.query("COMMIT");
    return NextResponse.json({ entry: rows[0] }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin ledger entry creation failed", error);
    return NextResponse.json({ error: "We couldn't save that ledger entry." }, { status: 503 });
  } finally {
    client.release();
  }
}

export async function PATCH(request: Request) {
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
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid status change." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Enter a valid status change." }, { status: 400 });
  }
  const values = body as Record<string, unknown>;
  const id = typeof values.id === "string" ? values.id : "";
  const entityType = values.entityType;
  const nextStatus = typeof values.status === "string" ? values.status : "";
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "The record ID is invalid." }, { status: 400 });
  }
  if (entityType !== "request" && entityType !== "ledger") {
    return NextResponse.json({ error: "Choose a valid record type." }, { status: 400 });
  }
  if (entityType === "ledger" && access.role !== "administrator") {
    return NextResponse.json({ error: "Administrator access is required for ledger records." }, { status: 403 });
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    if (entityType === "request") {
      const current = await client.query("SELECT status FROM portal_requests WHERE id = $1 FOR UPDATE", [id]);
      if (!current.rowCount) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Request not found." }, { status: 404 });
      }
      const previousStatus = current.rows[0].status as string;
      if (!requestTransitions[previousStatus]?.includes(nextStatus)) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "That request cannot move to the selected status." }, { status: 409 });
      }
      await client.query(
        "UPDATE portal_requests SET status = $2, updated_at = now() WHERE id = $1",
        [id, nextStatus],
      );
    } else {
      if (!ledgerStatuses.has(nextStatus)) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Ledger entries can only be verified or rejected." }, { status: 400 });
      }
      const updated = await client.query(
        `UPDATE investment_ledger
         SET status = $2,
             verified_by = CASE WHEN $2 = 'verified' THEN $3 ELSE NULL END,
             verified_at = CASE WHEN $2 = 'verified' THEN now() ELSE NULL END
         WHERE id = $1 AND status = 'pending'
         RETURNING id`,
        [id, nextStatus, access.user.id],
      );
      if (!updated.rowCount) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Pending ledger entry not found." }, { status: 409 });
      }
    }

    await client.query(
      `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'record_status_changed', $2, $3, $4::jsonb)`,
      [access.user.id, entityType, id, JSON.stringify({ status: nextStatus })],
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin record status update failed", error);
    return NextResponse.json({ error: "We couldn't update that record." }, { status: 503 });
  } finally {
    client.release();
  }
}
