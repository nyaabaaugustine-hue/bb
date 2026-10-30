import { after, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { forwardToFormspree } from "@/lib/formspree";
import { isValidEmail, normalizeGhanaPhone } from "@/lib/portal-domain";
import { clientAddress, consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limit = consumeRateLimit(`subscribe:${clientAddress(req)}`, 5, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many sign-ups from this connection. Please try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > 4_096) {
      return NextResponse.json({ error: "This request is too large." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  if (typeof values.company === "string" && values.company.trim()) {
    return NextResponse.json({ ok: true }); // honeypot: bots fill this hidden field
  }

  const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const phone = typeof values.phone === "string" ? normalizeGhanaPhone(values.phone) : null;
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Please enter a valid Ghana phone number, like 054 198 8383." }, { status: 400 });
  }
  if (values.consent !== true) {
    return NextResponse.json({ error: "Please tick the box to agree to receive updates." }, { status: 400 });
  }

  try {
    await getPool().query(
      `INSERT INTO newsletter_subscribers (email, phone, status, source, consented_at)
       VALUES ($1, $2, 'subscribed', 'website', now())
       ON CONFLICT (email) DO UPDATE
         SET phone = COALESCE(EXCLUDED.phone, newsletter_subscribers.phone),
             status = 'subscribed',
             consented_at = now(),
             updated_at = now()`,
      [email, phone],
    );
    after(() => forwardToFormspree({
      _subject: "New website newsletter sign-up",
      email,
      phone,
      marketing_consent: "yes",
      source: "bbhomes website newsletter",
    }));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter sign-up could not be saved", error);
    return NextResponse.json({ error: "We couldn't save your sign-up. Please try again." }, { status: 503 });
  }
}
