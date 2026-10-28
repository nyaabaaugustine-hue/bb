import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminConsole from "@/components/AdminConsole";
import RoleManager from "@/components/RoleManager";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";
import { canAccessOperations, getPortalRole } from "@/lib/portal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Property operations",
  description: "Private B B Homes operations workspace.",
};

export default async function AdminPage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to verify the current account.");
  if (!session?.user) redirect("/login?next=%2Fadmin");
  const role = await getPortalRole(session.user);
  if (!canAccessOperations(role)) {
    return (
      <section className="wrap !pt-32">
        <div className="mx-auto max-w-xl">
          <p className="eyebrow">Private workspace</p>
          <h1 className="mt-2 text-3xl">This area is for the B B Homes admin team.</h1>
          <p className="mt-3 text-sm leading-6 text-mute">Your account is signed in, but it does not have staff or administrator access. Public registration cannot grant these permissions.</p>
          <Link href="/account" className="btn-primary mt-5">Go to my account</Link>
        </div>
      </section>
    );
  }

  const db = getPool();
  const [customers, requests, ledger] = await Promise.all([
    db.query("SELECT id, email, display_name FROM portal_customers ORDER BY display_name, email LIMIT 500"),
    db.query(
      `SELECT r.id, r.user_id, c.email, c.display_name, r.request_type, r.listing_slug,
              r.details, r.status, r.created_at
       FROM portal_requests r
       JOIN portal_customers c ON c.id = r.user_id
       ORDER BY r.created_at DESC
       LIMIT 500`,
    ),
    role === "administrator"
      ? db.query(
          `SELECT l.id, l.user_id, c.email, c.display_name, l.transaction_type, l.amount,
                  l.currency, l.reference, l.status, l.created_at, l.verified_at
           FROM investment_ledger l
           JOIN portal_customers c ON c.id = l.user_id
           ORDER BY l.created_at DESC
           LIMIT 500`,
        )
      : Promise.resolve({ rows: [] }),
  ]);
  const openRequests = requests.rows.filter((request) => !["completed", "cancelled", "rejected"].includes(request.status)).length;
  const pendingLedger = ledger.rows.filter((entry) => entry.status === "pending").length;

  return (
    <section className="wrap !pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{role === "administrator" ? "Administrator workspace" : "Staff workspace"}</p>
          <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">Property journey, handled with care.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-mute">Review customer requests and coordinate follow-up. Financial records and access controls are restricted to administrators.</p>
        </div>
        <Link href="/account" className="btn">Customer view</Link>
      </div>
      <div className={`mt-7 grid gap-4 ${role === "administrator" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <div className="panel"><p className="text-sm text-mute">Customer accounts</p><p className="mt-2 text-3xl font-semibold">{customers.rowCount}</p></div>
        <div className="panel"><p className="text-sm text-mute">Open requests</p><p className="mt-2 text-3xl font-semibold">{openRequests}</p></div>
        {role === "administrator" && <div className="panel"><p className="text-sm text-mute">Ledger needs review</p><p className="mt-2 text-3xl font-semibold">{pendingLedger}</p></div>}
      </div>
      {role === "administrator" && <RoleManager initialUsers={customers.rows} />}
      <AdminConsole role={role} customers={customers.rows} initialRequests={requests.rows} initialLedger={ledger.rows} />
    </section>
  );
}
