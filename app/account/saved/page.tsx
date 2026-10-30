import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SavedHomesList from "@/components/SavedHomesList";
import { getPool } from "@/lib/db";
import { listings } from "@/lib/data";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "Saved homes" };

export default async function SavedHomesPage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount%2Fsaved");

  const { rows } = await getPool().query<{ listing_slug: string }>(
    `SELECT listing_slug
     FROM customer_saved_homes
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [session.user.id],
  );
  const savedSlugs = new Set(rows.map(({ listing_slug }) => listing_slug));
  const initialSaved = listings.filter((listing) => savedSlugs.has(listing.slug));

  return (
    <section>
      <p className="eyebrow">Your shortlist</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Saved homes</h1>
      <p className="mt-2 mb-6 text-sm leading-6 text-mute">Keep the homes and properties you want to compare close at hand.</p>
      <SavedHomesList initialSaved={initialSaved} />
      <p className="mt-6 text-sm text-mute">Looking for something else? <Link href="/homes" className="font-semibold text-terra hover:underline">Browse all homes</Link>.</p>
    </section>
  );
}
