import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import {
  loadAdminEnquiries,
  loadAdminRequests,
  loadAdminSummary,
  loadLedger,
  parseEnquiryFilters,
  parseRequestFilters,
} from "@/lib/admin-data";
import { isBootstrapAdministratorEmail } from "@/lib/portal";
import {
  canAccessOperations,
  getPortalRole,
  getSessionUser,
  type PortalRole,
} from "@/lib/portal";
import {
  isLedgerType,
  isRecord,
  isRequestStatus,
  requestTransitions,
  type RequestStatus,
} from "@/lib/portal-domain";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

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

export async function GET(request: Request) {
  let access;
  try {
    access = await operationsSession();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if ("response" in access) return access.response;

  try {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const [summary, requests, enquiries, ledger] = await Promise.all([
      loadAdminSummary(),
      loadAdminRequests(parseRequestFilters(params)),
      loadAdminEnquiries(parseEnquiryFilters(params)),
      access.role === "administrator" ? loadLedger(50) : Promise.resolve([]),
    ]);
    return NextResponse.json({
      summary,
      requests: requests.rows,
      requestPage: { page: requests.page, totalPages: requests.totalPages, total: requests.total },
      enquiries: enquiries.rows,
      enquiryPage: { page: enquiries.page, totalPages: enquiries.totalPages, total: enquiries.total },
      ledger,
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
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Enter a valid ledger entry." }, { status: 400 });
  }
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const transactionType = body.transactionType;
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  if (!userId || userId.length > 200 || !isLedgerType(transactionType) ||
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
    try { await client.query("ROLLBACK"); } catch {}
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
    return NextResponse.json({ error: "Enter a valid update." }, { status: 400 });
  }
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Enter a valid update." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const entityType = body.entityType;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "The record ID is invalid." }, { status: 400 });
  }
  if (entityType !== "request" && entityType !== "ledger") {
    return NextResponse.json({ error: "Choose a valid record type." }, { status: 400 });
  }
  if (entityType === "ledger" && access.role !== "administrator") {
    return NextResponse.json({ error: "Administrator access is required for ledger records." }, { status: 403 });
  }

  if (entityType === "ledger") {
    const nextStatus = body.status;
    if (nextStatus !== "verified" && nextStatus !== "rejected") {
      return NextResponse.json({ error: "Ledger entries can only be verified or rejected." }, { status: 400 });
    }
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
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
      await client.query(
        `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, 'ledger_status_changed', 'investment_ledger', $2, $3::jsonb)`,
        [access.user.id, id, JSON.stringify({ status: nextStatus })],
      );
      await client.query("COMMIT");
      return NextResponse.json({ ok: true, status: nextStatus });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("Admin ledger status update failed", error);
      return NextResponse.json({ error: "We couldn't update that record." }, { status: 503 });
    } finally {
      client.release();
    }
  }

  const hasStatus = body.status !== undefined;
  const hasAssignee = Object.hasOwn(body, "assignedTo");
  const hasNote = Object.hasOwn(body, "note");
  if (!hasStatus && !hasAssignee && !hasNote) {
    return NextResponse.json({ error: "Choose a status, an assignee, or a note to update." }, { status: 400 });
  }

  let nextStatus: RequestStatus | null = null;
  if (hasStatus) {
    if (!isRequestStatus(body.status)) {
      return NextResponse.json({ error: "Choose a valid request status." }, { status: 400 });
    }
    nextStatus = body.status;
  }

  let assignedTo: string | null = null;
  if (hasAssignee) {
    if (body.assignedTo === null || body.assignedTo === "") {
      assignedTo = null;
    } else if (typeof body.assignedTo === "string" && body.assignedTo.length <= 200) {
      assignedTo = body.assignedTo;
    } else {
      return NextResponse.json({ error: "Choose a valid staff member." }, { status: 400 });
    }
  }

  let note: string | null = null;
  if (hasNote) {
    if (body.note !== null && typeof body.note !== "string") {
      return NextResponse.json({ error: "Enter a valid note." }, { status: 400 });
    }
    note = typeof body.note === "string" ? body.note.trim().slice(0, 2_000) || null : null;
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ status: RequestStatus }>(
      "SELECT status FROM portal_requests WHERE id = $1 FOR UPDATE",
      [id],
    );
    if (!current.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    const previousStatus = current.rows[0].status;

    if (nextStatus && !requestTransitions[previousStatus].includes(nextStatus)) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "That request cannot move to the selected status." }, { status: 409 });
    }

    if (assignedTo) {
      const staff = await client.query<{ role: string; email: string }>(
        `SELECT COALESCE(r.role, 'customer') AS role, c.email
         FROM portal_customers c
         LEFT JOIN portal_user_roles r ON r.user_id = c.id
         WHERE c.id = $1`,
        [assignedTo],
      );
      if (!staff.rowCount || (staff.rows[0].role !== "staff" && staff.rows[0].role !== "administrator" && !isBootstrapAdministratorEmail(staff.rows[0].email))) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Assign requests to a staff member or administrator." }, { status: 400 });
      }
    }

    await client.query(
      `UPDATE portal_requests
       SET status = COALESCE($2::text, status),
           assigned_to = CASE WHEN $3::boolean THEN $4::text ELSE assigned_to END,
           staff_note = CASE WHEN $5::boolean THEN $6::text ELSE staff_note END,
           cancelled_at = CASE WHEN $2::text = 'cancelled' THEN now() ELSE cancelled_at END,
           updated_at = now()
       WHERE id = $1`,
      [id, nextStatus, hasAssignee, assignedTo, hasNote, note],
    );
    await client.query(
      `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'request_updated', 'portal_requests', $2, $3::jsonb)`,
      [access.user.id, id, JSON.stringify({
        previousStatus,
        status: nextStatus ?? previousStatus,
        assignmentChanged: hasAssignee,
        noteChanged: hasNote,
      })],
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, status: nextStatus ?? previousStatus, assignedTo: hasAssignee ? assignedTo : undefined });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error("Admin request update failed", error);
    return NextResponse.json({ error: "We couldn't update that request." }, { status: 503 });
  } finally {
    client.release();
  }
}
