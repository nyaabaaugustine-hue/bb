import { NextResponse } from "next/server";
import { getSessionUser, syncPortalCustomer } from "@/lib/portal";
import { getPool } from "@/lib/db";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestTypes = new Set([
  "viewing",
  "rental",
  "purchase",
  "investment",
  "valuation",
  "property_submission",
  "consultation",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET() {
  let user;
  try {
    user = await getSessionUser();
  } catch {
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: "Sign in to view your account." }, { status: 401 });

  try {
    await syncPortalCustomer(user);
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

    return NextResponse.json({ requests: requests.rows, ledger: ledger.rows });
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

  if (!isRecord(body) || typeof body.type !== "string" || !requestTypes.has(body.type)) {
    return NextResponse.json({ error: "Choose a valid request type." }, { status: 400 });
  }
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length < 10 || description.length > 2000) {
    return NextResponse.json({ error: "Add a few details (10–2,000 characters)." }, { status: 400 });
  }

  const listingSlug = body.listingSlug === undefined || body.listingSlug === ""
    ? null
    : typeof body.listingSlug === "string" && /^[a-z0-9-]{1,120}$/.test(body.listingSlug)
      ? body.listingSlug
      : undefined;
  if (listingSlug === undefined) {
    return NextResponse.json({ error: "The selected property is invalid." }, { status: 400 });
  }

  const requestedDate = body.requestedDate === undefined || body.requestedDate === ""
    ? null
    : typeof body.requestedDate === "string" && !Number.isNaN(Date.parse(body.requestedDate))
      ? new Date(body.requestedDate)
      : undefined;
  if (requestedDate === undefined) {
    return NextResponse.json({ error: "Choose a valid preferred date." }, { status: 400 });
  }
  if (requestedDate && (
    requestedDate.getTime() < Date.now() ||
    requestedDate.getTime() > Date.now() + 366 * 24 * 60 * 60 * 1000
  )) {
    return NextResponse.json({ error: "Choose a preferred date within the next year." }, { status: 400 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "Your account needs an email address before submitting a request." }, { status: 400 });
  }

  try {
    await syncPortalCustomer(user);
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
      const { rows: countRows } = await client.query(
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
      return NextResponse.json({ request: rows[0] }, { status: 201 });
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
