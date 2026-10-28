import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "Site visits" };

type VisitRow = {
  id: string;
  listing_slug: string | null;
  details: { description?: string; requestedDate?: string | null };
  status: string;
  created_at: Date;
};

export default async function SiteVisitsPage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount%2Fsite-visits");

  const { rows } = await getPool().query<VisitRow>(
    `SELECT id, listing_slug, details, status, created_at
     FROM portal_requests
     WHERE user_id = $1 AND request_type = 'viewing'
     ORDER BY created_at DESC
     LIMIT 100`,
    [session.user.id],
  );

  return (
    <section>
      <p className="eyebrow">Plan a visit</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Site visits</h1>
      <p className="mt-2 text-sm leading-6 text-mute">Visit requests are preferences, not confirmed bookings. The team will contact you to agree a time.</p>
      <div className="mt-6 divide-y divide-line rounded-xl border border-line bg-card px-4 sm:px-6">
        {rows.length === 0 ? (
          <div className="py-7"><h2 className="font-semibold">No visit requests yet</h2><p className="mt-2 text-sm text-mute">Send a viewing request from a listing or your account overview.</p><Link href="/homes" className="btn-primary mt-4">Browse homes</Link></div>
        ) : rows.map((visit) => (
          <article key={visit.id} className="py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Site visit request</h2>
              <span className={`badge ${visit.status === "confirmed" ? "badge-moss" : "badge-sand"} capitalize`}>{visit.status.replaceAll("_", " ")}</span>
            </div>
            {visit.details.requestedDate && <p className="mt-2 text-sm">Preferred time: {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" }).format(new Date(visit.details.requestedDate))}</p>}
            {visit.details.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-mute">{visit.details.description}</p>}
            <p className="mt-2 text-xs text-mute">Request ref SV-{visit.id.slice(0, 8).toUpperCase()} · Submitted {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeZone: "Africa/Accra" }).format(visit.created_at)}</p>
            {visit.listing_slug && <Link href={`/homes/${visit.listing_slug}`} className="mt-2 inline-flex text-sm font-semibold text-terra hover:underline">View property</Link>}
          </article>
        ))}
      </div>
    </section>
  );
}
