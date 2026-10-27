import { NextResponse } from "next/server";
// Every enquiry gets a tracking reference. TODO: persist with Drizzle + Neon, notify the team on WhatsApp.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b.phone !== "string" || b.phone.trim().length < 7) return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
  const prefix = b.type === "service" ? "SV" : b.type === "quote" ? "QT" : "BB";
  const ref = `${prefix}-${1000 + Math.floor(Math.random() * 8999)}`;
  console.log("enquiry", ref, b);
  return NextResponse.json({ ref });
}
