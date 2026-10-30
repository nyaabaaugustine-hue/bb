import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";
import { ensurePortalCustomer } from "@/lib/portal";
import {
  labelize,
  requestReference,
  requestStageCopy,
  requestStages,
  requestStatusBadgeClass,
} from "@/lib/portal-domain";
import { formatDate } from "@/lib/format";
import OneTapContact from "@/components/OneTapContact";
import PortalRequestForm from "@/components/PortalRequestForm";

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

export default async function AccountPage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount");
  await ensurePortalCustomer(session.user);

  const db = getPool();
  const [requestResult, openResult, paymentResult, savedResult, profileResult, messageResult] = await Promise.all([
    db.query<RequestRow>(
      `SELECT id, request_type, listing_slug, details, status, created_at
       FROM portal_requests
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [session.user.id],
    ),
    db.query<{ count: number }>(
      `SELECT count(*)::int AS count
       FROM portal_requests
       WHERE user_id = $1 AND status NOT IN ('completed', 'cancelled', 'rejected')`,
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
    db.query<{ display_name: string; phone: string | null; preferred_channel: string | null; preferred_zone: string | null }>(
      "SELECT display_name, phone, preferred_channel, preferred_zone FROM portal_customers WHERE id = $1",
      [session.user.id],
    ),
    db.query<{ count: number }>(
      `SELECT count(*)::int AS count
       FROM portal_messages
       WHERE user_id = $1 AND author_role = 'team' AND read_at IS NULL`,
      [session.user.id],
    ),
  ]);
  const requests = requestResult.rows;
  const openRequests = openResult.rows[0].count;
  const paymentCount = paymentResult.rows[0].count;
  const profile = profileResult.rows[0];
  const unreadMessages = messageResult.rows[0]?.count ?? 0;
  const profileComplete = Boolean(profile?.phone && profile?.preferred_channel && profile?.preferred_zone);
  const greeting = profile?.display_name || session.user.name || "there";

  return (
    <section>
      <div className="rounded-2xl bg-ink px-5 py-6 text-cream sm:px-7 sm:py-8">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-sand">Journey passport</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="mt-1 text-3xl leading-tight sm:text-4xl">Good to have you here, {greeting}.</h1>
            <p className="mt-2 break-all text-sm text-cream/70">{session.user.email}</p>
          </div>
          <p className="max-w-sm text-sm leading-6 text-cream/75">
            {openRequests
              ? `You have ${openRequests} open ${openRequests === 1 ? "request" : "requests"}. Your B B Homes team is reviewing the latest one and will confirm the next step with you.`
              : "Start with a home, a question, or a visit request. Your updates will collect here."}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/homes" className="btn-primary !border-sand !bg-sand !text-ink hover:!bg-white">Explore homes</Link>
          <Link href="/account/enquiries" className="btn !border-cream/25 !bg-cream/10 !text-cream hover:!bg-cream/20">View enquiries</Link>
          <Link href="/account/profile" className="btn !border-cream/25 !bg-cream/10 !text-cream hover:!bg-cream/20">Edit profile</Link>
        </div>
      </div>

      {unreadMessages > 0 && (
        <Link href="/account/messages" className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-terra/30 bg-terra/5 px-4 py-3 text-sm font-semibold text-terra transition hover:bg-terra/10">
          <span>You have {unreadMessages} new {unreadMessages === 1 ? "reply" : "replies"} from the B B Homes team.</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/account/enquiries" className="panel transition hover:border-terra/40">
          <p className="text-sm text-mute">Open requests</p>
          <p className="mt-2 text-3xl font-semibold">{openRequests}</p>
        </Link>
        <Link href="/account/saved" className="panel transition hover:border-terra/40">
          <p className="text-sm text-mute">Saved homes</p>
          <p className="mt-2 text-3xl font-semibold">{savedResult.rows[0].count}</p>
        </Link>
        <Link href="/account/payments" className="panel transition hover:border-terra/40">
          <p className="text-sm text-mute">Payment records</p>
          <p className="mt-2 text-3xl font-semibold">{paymentCount}</p>
        </Link>
        <Link href="/account/messages" className="panel transition hover:border-terra/40">
          <p className="text-sm text-mute">Team messages</p>
          <p className="mt-2 text-3xl font-semibold">{unreadMessages}</p>
        </Link>
      </div>

      {!profileComplete && (
        <div className="panel mt-4 flex flex-wrap items-center justify-between gap-3 border-l-4 !border-l-terra">
          <p className="text-sm leading-6 text-mute">
            <b className="text-ink">Finish your profile.</b> Add a phone number, a preferred reply channel and an area so your agent reaches you the right way.
          </p>
          <Link href="/account/profile" className="btn min-h-10 shrink-0 px-3 text-xs">Update profile</Link>
        </div>
      )}

      <div className="mt-7 grid items-start gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl">Recent updates</h2>
              <p className="mt-1 text-sm text-mute">Appointments and property requests are confirmed by the team.</p>
            </div>
            <Link href="/account/enquiries" className="text-sm font-semibold text-terra hover:underline">All enquiries</Link>
          </div>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {requests.length === 0 ? (
              <p className="py-6 text-sm text-mute">No requests yet. When you are ready, send your first one here.</p>
            ) : requests.slice(0, 4).map((item) => {
              const currentIndex = (requestStages as readonly string[]).indexOf(item.status);
              return (
                <article key={item.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold capitalize">{labelize(item.request_type)}</h3>
                    <span className={`${requestStatusBadgeClass(item.status)} capitalize`}>{labelize(item.status)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-mute">{item.details.description}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/80">{requestStageCopy[item.status as keyof typeof requestStageCopy] ?? "The team will update this request as it progresses."}</p>
                  {currentIndex >= 0 ? (
                    <ol aria-label={`Request progress: ${labelize(item.status)}`} className="mt-4 grid grid-cols-4 gap-2">
                      {requestStages.map((stage, index) => (
                        <li key={stage} className="min-w-0">
                          <span aria-hidden="true" className={`mb-1 block h-1.5 rounded-full ${index <= currentIndex ? "bg-terra" : "bg-line"}`} />
                          <span className={`text-[11px] capitalize ${index === currentIndex ? "font-bold text-terra" : "text-mute"}`}>{labelize(stage)}</span>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  <p className="mt-2 text-xs text-mute">
                    Received {formatDate(item.created_at) ?? "date unavailable"} · Ref {requestReference(item)}
                    {item.details.requestedDate ? ` · Preferred follow-up ${formatDate(item.details.requestedDate) ?? "date unavailable"}` : ""}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-28">
          <div className="panel">
            <h2 className="text-2xl">Take your next step</h2>
            <p className="mt-1 text-sm leading-6 text-mute">Tell us what you are considering. A team member will follow up before anything is confirmed.</p>
            <div className="mt-5"><PortalRequestForm /></div>
          </div>
          <div className="panel">
            <h2 className="text-xl">Talk to a person now</h2>
            <p className="mt-1 text-sm leading-6 text-mute">One tap to reach the team on WhatsApp, by phone or by email.</p>
            <OneTapContact
              variant="stack"
              className="mt-3"
              subject="Account follow-up"
              message={`Hello B B Homes, I would like to follow up on my account${profile?.display_name ? ` (${profile.display_name})` : ""}.`}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
