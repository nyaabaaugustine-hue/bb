import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { ZONES } from "@/lib/data";
import { ensurePortalCustomer, getSessionUser } from "@/lib/portal";
import { isEnquiryChannel, isRecord, normalizeGhanaPhone } from "@/lib/portal-domain";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  if (!user) return NextResponse.json({ error: "Sign in to update your profile." }, { status: 401 });

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 4_096) {
      return NextResponse.json({ error: "This profile update is too large." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Enter valid profile details." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Enter valid profile details." }, { status: 400 });

  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (displayName.length < 1 || displayName.length > 120) {
    return NextResponse.json({ error: "Enter a display name between 1 and 120 characters." }, { status: 400 });
  }
  const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
  const phone = rawPhone ? normalizeGhanaPhone(rawPhone) : null;
  if (rawPhone && !phone) {
    return NextResponse.json({ error: "Enter a valid Ghana phone number, like 054 198 8383." }, { status: 400 });
  }

  const hasChannel = Object.hasOwn(body, "preferredChannel");
  let preferredChannel: string | null = null;
  if (hasChannel) {
    if (body.preferredChannel === null || body.preferredChannel === "") {
      preferredChannel = null;
    } else if (typeof body.preferredChannel === "string" && isEnquiryChannel(body.preferredChannel)) {
      preferredChannel = body.preferredChannel;
    } else {
      return NextResponse.json({ error: "Choose WhatsApp, phone or email as your reply channel." }, { status: 400 });
    }
  }

  const hasZone = Object.hasOwn(body, "preferredZone");
  let preferredZone: string | null = null;
  if (hasZone) {
    if (body.preferredZone === null || body.preferredZone === "") {
      preferredZone = null;
    } else if (typeof body.preferredZone === "string" && (ZONES as readonly string[]).includes(body.preferredZone)) {
      preferredZone = body.preferredZone;
    } else {
      return NextResponse.json({ error: "Choose Accra, Kumasi or Tamale." }, { status: 400 });
    }
  }

  const readBudget = (key: "budgetMin" | "budgetMax") => {
    if (!Object.hasOwn(body, key)) return { changed: false, value: null as number | null };
    const raw = body[key];
    if (raw === null || raw === "") return { changed: true, value: null };
    const amount = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(amount) || amount < 0 || amount > 100_000_000) return { changed: true, value: NaN };
    return { changed: true, value: Math.round(amount * 100) / 100 };
  };
  const minBudget = readBudget("budgetMin");
  const maxBudget = readBudget("budgetMax");
  if (Number.isNaN(minBudget.value) || Number.isNaN(maxBudget.value)) {
    return NextResponse.json({ error: "Enter a budget between 0 and 100,000,000 GHS." }, { status: 400 });
  }
  if (minBudget.value !== null && maxBudget.value !== null && maxBudget.value < minBudget.value) {
    return NextResponse.json({ error: "Your maximum budget must be at least your minimum." }, { status: 400 });
  }

  const hasMarketing = Object.hasOwn(body, "marketingOptIn");
  if (hasMarketing && typeof body.marketingOptIn !== "boolean") {
    return NextResponse.json({ error: "Choose whether you want property updates." }, { status: 400 });
  }

  try {
    await ensurePortalCustomer(user);
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<{
        display_name: string;
        phone: string | null;
        preferred_channel: string | null;
        preferred_zone: string | null;
        budget_min: string | null;
        budget_max: string | null;
        marketing_opt_in: boolean;
      }>(
        `UPDATE portal_customers
         SET display_name = $2,
             phone = $3,
             preferred_channel = CASE WHEN $4::boolean THEN $5::text ELSE preferred_channel END,
             preferred_zone = CASE WHEN $6::boolean THEN $7::text ELSE preferred_zone END,
             budget_min = CASE WHEN $8::boolean THEN $9::numeric ELSE budget_min END,
             budget_max = CASE WHEN $10::boolean THEN $11::numeric ELSE budget_max END,
             marketing_opt_in = CASE WHEN $12::boolean THEN $13::boolean ELSE marketing_opt_in END,
             updated_at = now()
         WHERE id = $1
         RETURNING display_name, phone, preferred_channel, preferred_zone, budget_min, budget_max, marketing_opt_in`,
        [
          user.id, displayName, phone,
          hasChannel, preferredChannel,
          hasZone, preferredZone,
          minBudget.changed, minBudget.value,
          maxBudget.changed, maxBudget.value,
          hasMarketing, body.marketingOptIn ?? false,
        ],
      );
      await client.query(
        `INSERT INTO portal_audit_log (actor_user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, 'profile_updated', 'portal_customers', $1, $2::jsonb)`,
        [user.id, JSON.stringify({
          displayNameChanged: true,
          phoneChanged: Boolean(phone),
          preferencesChanged: hasChannel || hasZone || minBudget.changed || maxBudget.changed || hasMarketing,
        })],
      );
      await client.query("COMMIT");
      return NextResponse.json({ profile: rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Profile update failed", error);
    return NextResponse.json({ error: "We couldn't save your profile. Please try again." }, { status: 503 });
  }
}
