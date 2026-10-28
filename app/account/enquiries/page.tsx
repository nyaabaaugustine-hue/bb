import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "My enquiries" };

type RequestRow = {
  id: string;
  request_type: string;
  listing_slug: string | null;
  details: { description?: string; requestedDate?: string | null };
  status: string;
  created_at: Date;
};

const label = (value: string) => value.replaceAll("_", " ");
const referencePrefix = (type: string) => type === "viewing" ? "SV" : ["valuation", "property_submission"].includes(type) ? "QT" : "BB";

export default async function EnquiriesPage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount%2Fenquiries");

  const { rows } = await getPool().query<RequestRow>(
    `SELECT id, request_type, listing_slug, details, status, created_at
     FROM portal_requests
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [session.user.id],
  );

  return (
    <section>
      <p className="eyebrow">Your journey</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">My enquiries</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-mute">Follow up on requests sent to B B Homes. A request is not a reservation; our team confirms each next step with you.</p>
      <div className="mt-6 divide-y divide-line rounded-xl border border-line bg-card px-4 sm:px-6">
        {rows.length === 0 ? (
          <div className="py-8">
            <h2 className="text-lg font-semibold">No enquiries yet</h2>
            <p className="mt-2 text-sm text-mute">When you send an enquiry or request a visit, its reference and status will appear here.</p>
            <Link href="/homes" className="btn-primary mt-4">Explore homes</Link>
          </div>
        ) : rows.map((item) => (
          <article key={item.id} className="py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold capitalize">{label(item.request_type)}</h2>
                <p className="mt-1 text-xs font-semibold tracking-wide text-mute">{referencePrefix(item.request_type)}-{item.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <span className={`badge ${["confirmed", "completed"].includes(item.status) ? "badge-moss" : "badge-sand"} capitalize`}>{label(item.status)}</span>
            </div>
            {item.details.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-mute">{item.details.description}</p>}
            <p className="mt-2 text-xs text-mute">Received {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeZone: "Africa/Accra" }).format(item.created_at)}</p>
            {item.listing_slug && <Link href={`/homes/${item.listing_slug}`} className="mt-2 inline-flex items-center text-sm font-semibold text-terra hover:underline">View property</Link>}
          </article>
        ))}
      </div>
    </section>
  );
}
