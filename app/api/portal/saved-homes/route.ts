import { NextResponse } from "next/server";
import { getSessionUser, ensurePortalCustomer } from "@/lib/portal";
import { getPool } from "@/lib/db";
import { hasSameOrigin } from "@/lib/request-security";
import { listings } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listingSlugs = new Set(listings.map(({ slug }) => slug));

async function authenticatedUser() {
  try {
    const user = await getSessionUser();
    return { user, error: null };
  } catch {
    return { user: null, error: NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 }) };
  }
}

export async function GET() {
  const { user, error } = await authenticatedUser();
  if (error) return error;
  if (!user) return NextResponse.json({ error: "Sign in to view saved homes." }, { status: 401 });

  try {
    const { rows } = await getPool().query<{ listing_slug: string; created_at: Date }>(
      `SELECT listing_slug, created_at
       FROM customer_saved_homes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id],
    );
    return NextResponse.json({
      savedHomes: rows.flatMap(({ listing_slug, created_at }) => {
        const listing = listings.find(({ slug }) => slug === listing_slug);
        return listing ? [{ slug: listing.slug, createdAt: created_at }] : [];
      }),
    });
  } catch (cause) {
    console.error("Saved homes could not be loaded", cause);
    return NextResponse.json({ error: "We couldn't load your saved homes right now." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const { user, error } = await authenticatedUser();
  if (error) return error;
  if (!user) return NextResponse.json({ error: "Sign in to save a home." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid listing." }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("slug" in body) ||
    typeof body.slug !== "string" ||
    !listingSlugs.has(body.slug)
  ) {
    return NextResponse.json({ error: "Choose a valid home from our listings." }, { status: 400 });
  }

  try {
    await ensurePortalCustomer(user);
    await getPool().query(
      `INSERT INTO customer_saved_homes (user_id, listing_slug)
       VALUES ($1, $2)
       ON CONFLICT (user_id, listing_slug) DO NOTHING`,
      [user.id, body.slug],
    );
    return NextResponse.json({ saved: true });
  } catch (cause) {
    console.error("Saved home could not be added", cause);
    return NextResponse.json({ error: "We couldn't save that home. Please try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const { user, error } = await authenticatedUser();
  if (error) return error;
  if (!user) return NextResponse.json({ error: "Sign in to manage saved homes." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Choose a valid saved home." }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("slug" in body) ||
    typeof body.slug !== "string" ||
    !listingSlugs.has(body.slug)
  ) {
    return NextResponse.json({ error: "Choose a valid saved home." }, { status: 400 });
  }

  try {
    await getPool().query(
      "DELETE FROM customer_saved_homes WHERE user_id = $1 AND listing_slug = $2",
      [user.id, body.slug],
    );
    return NextResponse.json({ saved: false });
  } catch (cause) {
    console.error("Saved home could not be removed", cause);
    return NextResponse.json({ error: "We couldn't remove that saved home. Please try again." }, { status: 503 });
  }
}
