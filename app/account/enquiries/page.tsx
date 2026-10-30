import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CancelRequestButton from "@/components/CancelRequestButton";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";
import { formatDate } from "@/lib/format";
import {
  customerCancellableStatuses,
  labelize,
  requestReference,
  requestStatusBadgeClass,
  type RequestStatus,
} from "@/lib/portal-domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "My enquiries" };

type RequestRow = {
  id: string;
  request_type: string;
  listing_slug: string | null;
  details: { description?: string; requestedDate?: string | null };
  status: RequestStatus;
  created_at: Date;
  agent_name: string | null;
};

export default async function EnquiriesPage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount%2Fenquiries");

  const { rows } = await getPool().query<RequestRow>(
    `SELECT r.id, r.request_type, r.listing_slug, r.details, r.status, r.created_at,
            agent.display_name AS agent_name
     FROM portal_requests r
     LEFT JOIN portal_customers agent ON agent.id = r.assigned_to
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC
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
                <h2 className="font-semibold capitalize">{labelize(item.request_type)}</h2>
                <p className="mt-1 text-xs font-semibold tracking-wide text-mute">{requestReference(item)}</p>
              </div>
              <span className={`${requestStatusBadgeClass(item.status)} capitalize`}>{labelize(item.status)}</span>
            </div>
            {item.details.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-mute">{item.details.description}</p>}
            <p className="mt-2 text-xs text-mute">
              Received {formatDate(item.created_at) ?? "date unavailable"}
              {item.details.requestedDate ? ` · Preferred ${formatDate(item.details.requestedDate) ?? "date unavailable"}` : ""}
            </p>
            {item.agent_name && <p className="mt-1 text-xs text-mute">Your contact: <span className="font-semibold text-ink">{item.agent_name}</span></p>}
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {item.listing_slug && <Link href={`/homes/${item.listing_slug}`} className="inline-flex items-center text-sm font-semibold text-terra hover:underline">View property</Link>}
              <Link href="/contact" className="inline-flex items-center text-sm font-semibold text-mute hover:text-terra hover:underline">Ask the team</Link>
            </div>
            {customerCancellableStatuses.has(item.status) && <CancelRequestButton id={item.id} reference={requestReference(item)} />}
          </article>
        ))}
      </div>
    </section>
  );
}
