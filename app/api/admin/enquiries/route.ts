import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { canAccessOperations, getPortalRole, getSessionUser } from "@/lib/portal";
import { enquiryTransitions, isEnquiryStatus, isRecord, type EnquiryStatus } from "@/lib/portal-domain";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export async function PATCH(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  let user;
  try {
    user = await getSessionUser();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const role = await getPortalRole(user);
  if (!canAccessOperations(role)) {
    return NextResponse.json({ error: "Staff or administrator access is required." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid enquiry update." }, { status: 400 });
  }
  if (!isRecord(body) || typeof body.id !== "string" || !UUID.test(body.id) || !isEnquiryStatus(body.status)) {
    return NextResponse.json({ error: "Choose a valid enquiry and status." }, { status: 400 });
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ status: EnquiryStatus }>(
      "SELECT status FROM portal_enquiries WHERE id = $1 FOR UPDATE",
      [body.id],
    );
    if (!current.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    }
    const previousStatus = current.rows[0].status;
    if (!enquiryTransitions[previousStatus].includes(body.status)) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "That enquiry cannot move to the selected status." }, { status: 409 });
    }

    await client.query(
      `UPDATE portal_enquiries
       SET status = $2,
           handled_by = CASE WHEN $2 IN ('contacted', 'closed') THEN COALESCE(handled_by, $3) ELSE handled_by END,
           updated_at = now()
       WHERE id = $1`,
      [body.id, body.status, user.id],
    );
    await client.query(
      `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'enquiry_status_changed', 'portal_enquiries', $2, $3::jsonb)`,
      [user.id, body.id, JSON.stringify({ previousStatus, status: body.status })],
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, status: body.status });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error("Enquiry status update failed", error);
    return NextResponse.json({ error: "We couldn't update that enquiry." }, { status: 503 });
  } finally {
    client.release();
  }
}
