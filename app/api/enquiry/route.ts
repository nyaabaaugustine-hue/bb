import { after, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { forwardToFormspree } from "@/lib/formspree";
import { normalizeGhanaPhone, isEnquiryCategory, isEnquiryChannel } from "@/lib/portal-domain";
import { clientAddress, consumeRateLimit } from "@/lib/rate-limit";
import { hasSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8_192;

function invalid(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  if (!hasSameOrigin(req)) return invalid("This request could not be verified.", 403);

  const limit = consumeRateLimit(`enquiry:${clientAddress(req)}`, 6, 10 * 60_000);
  if (!limit.allowed) return invalid("Too many enquiries from this connection. Please try again shortly.", 429);

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return invalid("Enter a valid enquiry.");
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return invalid("This enquiry is too large.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return invalid("Enter a valid enquiry.");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return invalid("Enter a valid enquiry.");
  }
  const values = body as Record<string, unknown>;

  // Honeypot: bots fill the hidden company field. Answer without writing.
  if (typeof values.company === "string" && values.company.trim()) {
    return NextResponse.json({ ref: "BB-000000" });
  }

  const name = typeof values.name === "string" ? values.name.trim() : "";
  if (name.length < 2 || name.length > 120) return invalid("Enter your name.");

  const phone = typeof values.phone === "string" ? normalizeGhanaPhone(values.phone) : null;
  if (!phone) return invalid("Enter a valid Ghana phone number, like 054 198 8383.");

  const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return invalid("Enter a valid email address.");

  const channel = values.channel ?? "whatsapp";
  if (!isEnquiryChannel(channel)) return invalid("Choose how you would like us to reply.");
  if (channel === "email" && !email) return invalid("Add an email address so we can reply by email.");

  const category = values.type ?? "enquiry";
  if (!isEnquiryCategory(category)) return invalid("Choose a valid enquiry type.");

  const service = typeof values.service === "string" ? values.service.trim() : "";
  const requestedSubject = typeof values.subject === "string" ? values.subject.trim() : "";
  const fallbackSubject = category === "service" ? service || "Home service request" : "Website enquiry";
  const subject = (requestedSubject || fallbackSubject).slice(0, 160);
  const messageParts = [
    typeof values.message === "string" ? values.message.trim() : "",
    typeof values.details === "string" ? values.details.trim() : "",
    typeof values.urgency === "string" ? `Urgency: ${values.urgency.trim()}` : "",
    service && category !== "service" ? `Service: ${service}` : "",
  ].filter(Boolean);
  const message = messageParts.join("\n").slice(0, 2_000) || null;

  try {
    const { rows } = await getPool().query<{ reference: string }>(
      `INSERT INTO portal_enquiries (reference, name, phone, email, channel, category, subject, message)
       VALUES (
         $1 || '-' || lpad(nextval('portal_enquiry_reference_seq')::text, 6, '0'),
         $2, $3, $4, $5, $6, $7, $8
       )
       RETURNING reference`,
      [category === "service" ? "SV" : category === "quote" ? "QT" : "BB", name, phone, email || null, channel, category, subject, message],
    );
    const reference = rows[0].reference;
    after(() => forwardToFormspree({
      _subject: `New ${category} enquiry · ${reference}`,
      reference,
      name,
      phone,
      email,
      reply_by: channel,
      type: category,
      subject,
      message,
      source: "bbhomes website",
    }));
    return NextResponse.json({ ref: reference }, { status: 201 });
  } catch (error) {
    console.error("Enquiry could not be saved", error);
    return invalid("We couldn't save your enquiry. Please try again.", 503);
  }
}
