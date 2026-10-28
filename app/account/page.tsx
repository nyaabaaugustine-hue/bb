import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";
import { syncPortalCustomer } from "@/lib/portal";
import PortalRequestForm from "@/components/PortalRequestForm";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "My property journey",
  description: "Manage your B B Homes enquiries, viewing requests, valuations and investment updates.",
};

type RequestRow = {
  id: string;
  request_type: string;
  listing_slug: string | null;
  details: { description?: string; requestedDate?: string | null };
  status: string;
  created_at: Date;
};
const label = (value: string) => value.replaceAll("_", " ");
const requestReference = (item: RequestRow) => {
  const prefix = item.request_type === "viewing"
    ? "SV"
    : ["valuation", "property_submission"].includes(item.request_type) ? "QT" : "BB";
  return `${prefix}-${item.id.slice(0, 8).toUpperCase()}`;
};
const dateLabel = (value: Date) => new Intl.DateTimeFormat("en-GH", {
  dateStyle: "medium",
  timeZone: "Africa/Accra",
}).format(value);

export default async function AccountPage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount");
  await syncPortalCustomer(session.user);

  const db = getPool();
  const [requestResult, paymentResult, savedResult] = await Promise.all([
    db.query<RequestRow>(
      `SELECT id, request_type, listing_slug, details, status, created_at
       FROM portal_requests
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [session.user.id],
    ),
    db.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM investment_ledger WHERE user_id = $1",
      [session.user.id],
    ),
    db.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM customer_saved_homes WHERE user_id = $1",
      [session.user.id],
    ),
  ]);
  const requests = requestResult.rows;
  const paymentCount = paymentResult.rows[0].count;

  return (
    <section>
      <div className="rounded-2xl bg-ink px-5 py-6 text-cream sm:px-7 sm:py-8">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-sand">Journey passport</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="mt-1 text-3xl leading-tight sm:text-4xl">Good to have you here, {session.user.name || "there"}.</h1>
          <p className="mt-2 break-all text-sm text-cream/70">{session.user.email}</p>
        </div>
        <p className="max-w-sm text-sm leading-6 text-cream/75">{requests.length ? "Your B B Homes team is reviewing your latest request. We’ll confirm the next step with you." : "Start with a home, a question, or a visit request. Your updates will collect here."}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/homes" className="btn-primary !border-sand !bg-sand !text-ink hover:!bg-white">Explore homes</Link>
          <Link href="/account/enquiries" className="btn !border-cream/25 !bg-cream/10 !text-cream hover:!bg-cream/20">View enquiries</Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="panel"><p className="text-sm text-mute">Open requests</p><p className="mt-2 text-3xl font-semibold">{requests.filter((item) => !["completed", "cancelled", "rejected"].includes(item.status)).length}</p></div>
        <Link href="/account/saved" className="panel transition hover:border-terra/40"><p className="text-sm text-mute">Saved homes</p><p className="mt-2 text-3xl font-semibold">{savedResult.rows[0].count}</p></Link>
        <Link href="/account/payments" className="panel transition hover:border-terra/40"><p className="text-sm text-mute">Payment records</p><p className="mt-2 text-3xl font-semibold">{paymentCount}</p></Link>
      </div>

      <div className="mt-7 grid items-start gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-2xl">Recent updates</h2><p className="mt-1 text-sm text-mute">Appointments and property requests are confirmed by the team.</p></div>
            <Link href="/account/enquiries" className="text-sm font-semibold text-terra hover:underline">All enquiries</Link>
          </div>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {requests.length === 0 ? (
              <p className="py-6 text-sm text-mute">No requests yet. When you are ready, send your first one here.</p>
            ) : requests.slice(0, 4).map((item) => (
              <article key={item.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold capitalize">{label(item.request_type)}</h3>
                  <span className={`badge ${item.status === "confirmed" || item.status === "completed" ? "badge-moss" : "badge-sand"} capitalize`}>{label(item.status)}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-mute">{item.details.description}</p>
                <p className="mt-2 text-xs text-mute">Received {dateLabel(item.created_at)} · Ref {requestReference(item)}</p>
              </article>
            ))}
          </div>

        </section>

        <aside className="panel xl:sticky xl:top-28">
          <h2 className="text-2xl">Take your next step</h2>
          <p className="mt-1 text-sm leading-6 text-mute">Tell us what you are considering. A team member will follow up before anything is confirmed.</p>
          <div className="mt-5"><PortalRequestForm /></div>
        </aside>
      </div>
    </section>
  );
}
