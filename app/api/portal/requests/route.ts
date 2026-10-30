import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { listings } from "@/lib/data";
import { ensurePortalCustomer, getSessionUser } from "@/lib/portal";
import {
  customerCancellableStatuses,
  isRecord,
  isRequestType,
  requestReference,
  type RequestStatus,
} from "@/lib/portal-domain";
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
  if (!user) return NextResponse.json({ error: "Sign in to view your account." }, { status: 401 });

  try {
    await ensurePortalCustomer(user);
    const [requests, ledger] = await Promise.all([
      getPool().query(
        `SELECT id, request_type, listing_slug, details, status, created_at, updated_at
         FROM portal_requests
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 100`,
        [user.id],
      ),
      getPool().query(
        `SELECT id, transaction_type, amount, currency, reference, status, created_at, verified_at
         FROM investment_ledger
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 100`,
        [user.id],
      ),
    ]);

    return NextResponse.json({
      requests: requests.rows.map((row) => ({ ...row, reference: requestReference(row) })),
      ledger: ledger.rows,
    });
  } catch (error) {
    console.error("Portal request list failed", error);
    return NextResponse.json({ error: "We couldn't load your account right now." }, { status: 503 });
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
  if (!user) return NextResponse.json({ error: "Sign in before submitting a request." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid request." }, { status: 400 });
  }

  if (!isRecord(body) || !isRequestType(body.type)) {
    return NextResponse.json({ error: "Choose a valid request type." }, { status: 400 });
  }
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length < 10 || description.length > 2000) {
    return NextResponse.json({ error: "Add a few details (10–2,000 characters)." }, { status: 400 });
  }

  let listingSlug: string | null = null;
  if (body.listingSlug !== undefined && body.listingSlug !== "") {
    if (typeof body.listingSlug !== "string" || !listings.some(({ slug }) => slug === body.listingSlug)) {
      return NextResponse.json({ error: "Choose a property from our current listings." }, { status: 400 });
    }
    listingSlug = body.listingSlug;
  }

  let requestedDate: Date | null = null;
  if (body.requestedDate !== undefined && body.requestedDate !== "") {
    if (typeof body.requestedDate !== "string" || Number.isNaN(Date.parse(body.requestedDate))) {
      return NextResponse.json({ error: "Choose a valid preferred date." }, { status: 400 });
    }
    requestedDate = new Date(body.requestedDate);
    if (requestedDate.getTime() < Date.now() || requestedDate.getTime() > Date.now() + 366 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "Choose a preferred date within the next year." }, { status: 400 });
    }
  }
  if (!user.email) {
    return NextResponse.json({ error: "Your account needs an email address before submitting a request." }, { status: 400 });
  }

  try {
    await ensurePortalCustomer(user);
    const details = JSON.stringify({
      description,
      requestedDate: requestedDate?.toISOString() ?? null,
    });
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext($1)::bigint)",
        [`portal-request-limit:${user.id}`],
      );
      const { rows: countRows } = await client.query<{ count: number }>(
        `SELECT count(*)::int AS count
         FROM portal_requests
         WHERE user_id = $1 AND created_at > now() - interval '1 hour'`,
        [user.id],
      );
      if (countRows[0].count >= 10) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "You've reached the hourly request limit. Please try again later." }, { status: 429 });
      }

      const { rows } = await client.query(
        `INSERT INTO portal_requests (user_id, contact_email, request_type, listing_slug, details)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         RETURNING id, request_type, listing_slug, details, status, created_at`,
        [user.id, user.email.toLowerCase(), body.type, listingSlug, details],
      );
      await client.query("COMMIT");
      return NextResponse.json(
        { request: { ...rows[0], reference: requestReference(rows[0]) } },
        { status: 201 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Portal request creation failed", error);
    return NextResponse.json({ error: "We couldn't save your request. Please try again." }, { status: 503 });
  }
}

/** Customers may cancel their own request while it is still active. */
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
  if (!user) return NextResponse.json({ error: "Sign in to manage your requests." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid cancellation." }, { status: 400 });
  }
  if (!isRecord(body) || typeof body.id !== "string" || !UUID.test(body.id) || body.status !== "cancelled") {
    return NextResponse.json({ error: "Choose a request to cancel." }, { status: 400 });
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ status: RequestStatus }>(
      "SELECT status FROM portal_requests WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [body.id, user.id],
    );
    if (!current.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    const previousStatus = current.rows[0].status;
    if (!customerCancellableStatuses.has(previousStatus)) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "This request has already finished and can no longer be cancelled. Contact the team instead." },
        { status: 409 },
      );
    }

    await client.query(
      "UPDATE portal_requests SET status = 'cancelled', cancelled_at = now(), updated_at = now() WHERE id = $1",
      [body.id],
    );
    await client.query(
      `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'request_cancelled_by_customer', 'portal_requests', $2, $3::jsonb)`,
      [user.id, body.id, JSON.stringify({ previousStatus, status: "cancelled" })],
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, status: "cancelled" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Customer request cancellation failed", error);
    return NextResponse.json({ error: "We couldn't cancel that request. Please try again." }, { status: 503 });
  } finally {
    client.release();
  }
}
