import { NextResponse } from "next/server";

// Newsletter sign-up. TODO: persist (Neon + Drizzle, or Mailchimp / Brevo / Google Sheets) and add to a WhatsApp broadcast list.
// Until then it only logs, so connect storage before launch or sign-ups are lost.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts 054 198 8383, +233541988383 or 233541988383. Returns 233XXXXXXXXX or null. */
function ghanaPhone(raw: string): string | null {
  const d = raw.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  if (/^233\d{9}$/.test(d)) return d;
  if (/^0\d{9}$/.test(d)) return "233" + d.slice(1);
  if (/^\d{9}$/.test(d)) return "233" + d;
  return null;
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.company) return NextResponse.json({ ok: true }); // honeypot: bots fill this hidden field
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const phone = typeof b.phone === "string" ? ghanaPhone(b.phone) : null;
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Please enter a valid Ghana phone number, like 054 198 8383." }, { status: 400 });
  if (b.consent !== true) return NextResponse.json({ error: "Please tick the box to agree to receive updates." }, { status: 400 });
  console.log("newsletter signup", { email, phone, at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
