import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "Payment plan and receipts" };

type PaymentRow = { id: string; transaction_type: string; amount: string; currency: string; reference: string; status: string; created_at: Date };

export default async function PaymentsPage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount%2Fpayments");

  const { rows } = await getPool().query<PaymentRow>(
    `SELECT id, transaction_type, amount, currency, reference, status, created_at
     FROM investment_ledger
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [session.user.id],
  );

  return (
    <section>
      <p className="eyebrow">Read-only account view</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Payments</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-mute">View ledger entries recorded by the B B Homes team. This page does not accept or process payments, and entries are not receipts unless marked verified.</p>
      <div className="mt-6 rounded-xl border border-sand bg-sand/30 p-4 text-sm font-medium">Never send money based only on a dashboard entry. Confirm payment instructions directly with your named agent.</div>
      <div className="mt-5 divide-y divide-line rounded-xl border border-line bg-card px-4 sm:px-6">
        {rows.length === 0 ? <p className="py-7 text-sm text-mute">No payment records have been added to your account.</p> : rows.map((row) => (
          <article key={row.id} className="flex flex-wrap justify-between gap-3 py-4">
            <div><h2 className="font-semibold capitalize">{row.transaction_type.replaceAll("_", " ")}</h2><p className="mt-1 text-xs text-mute">{row.reference} · {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeZone: "Africa/Accra" }).format(row.created_at)}</p></div>
            <div className="text-right"><p className="font-semibold">{row.currency} {Number(row.amount).toLocaleString("en-GH", { minimumFractionDigits: 2 })}</p><p className="mt-1 text-xs capitalize text-mute">{row.status}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
