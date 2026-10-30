import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminConsole from "@/components/AdminConsole";
import AdminMessages from "@/components/AdminMessages";
import RoleManager from "@/components/RoleManager";
import { auth } from "@/lib/auth/server";
import {
  loadAdminEnquiries,
  loadAdminRequests,
  loadAdminSummary,
  loadAudit,
  loadCustomerOptions,
  loadLedger,
  loadMessageThreads,
  loadRoleUsers,
  loadStaffOptions,
  parseEnquiryFilters,
  parseRequestFilters,
} from "@/lib/admin-data";
import { canAccessOperations, getPortalRole } from "@/lib/portal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Property operations",
  description: "Private B B Homes operations workspace.",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to verify the current account.");
  if (!session?.user) redirect("/login?next=%2Fadmin");
  const role = await getPortalRole(session.user);
  if (!canAccessOperations(role)) {
    return (
      <section className="wrap !pt-6">
        <div className="mx-auto max-w-xl">
          <p className="eyebrow">Private workspace</p>
          <h1 className="mt-2 text-3xl">This area is for the B B Homes admin team.</h1>
          <p className="mt-3 text-sm leading-6 text-mute">Your account is signed in, but it does not have staff or administrator access. Public registration cannot grant these permissions.</p>
          <Link href="/account" className="btn-primary mt-5">Go to my account</Link>
        </div>
      </section>
    );
  }

  const params = await searchParams;
  const requestFilters = parseRequestFilters(params);
  const enquiryFilters = parseEnquiryFilters(params);

  const [summary, requestPage, enquiryPage, staff, ledger, roleUsers, customers, audit, messageThreads] = await Promise.all([
    loadAdminSummary(),
    loadAdminRequests(requestFilters),
    loadAdminEnquiries(enquiryFilters),
    loadStaffOptions(),
    role === "administrator" ? loadLedger(50) : Promise.resolve([]),
    role === "administrator" ? loadRoleUsers() : Promise.resolve([]),
    role === "administrator" ? loadCustomerOptions() : Promise.resolve([]),
    role === "administrator" ? loadAudit(15) : Promise.resolve([]),
    loadMessageThreads(50),
  ]);

  const cards: { label: string; value: number; href?: string }[] = [
    { label: "Customer accounts", value: summary.customers, href: role === "administrator" ? "#user-roles" : undefined },
    { label: "Open requests", value: summary.open_requests, href: "#customer-requests" },
    { label: "New enquiries", value: summary.new_enquiries, href: "#enquiries" },
    { label: "Unread messages", value: summary.unread_messages, href: "#messages" },
    { label: "Resolved in 30 days", value: summary.resolved_30d },
    ...(role === "administrator" ? [{ label: "Ledger needs review", value: summary.pending_ledger, href: "#investment-ledger" }] : []),
  ];

  return (
    <section className="wrap !pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{role === "administrator" ? "Administrator workspace" : "Staff workspace"}</p>
          <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">Property journey, handled with care.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-mute">Work the enquiry inbox and customer request queue, assign an owner, and keep an internal note on each case. Financial records and access controls are restricted to administrators.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="#enquiries" className="btn">Enquiry inbox</Link>
          <Link href="#messages" className="btn">Messages</Link>
          <Link href="/account" className="btn">Customer view</Link>
        </div>
      </div>

      <div className={`mt-7 grid gap-4 ${role === "administrator" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"}`}>
        {cards.map((card) => {
          const content = (
            <>
              <p className="text-sm text-mute">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold">{card.value}</p>
            </>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className="panel transition hover:border-terra/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra">
              {content}
              <p className="mt-1 text-xs font-semibold text-terra">Open queue →</p>
            </Link>
          ) : (
            <div key={card.label} className="panel">{content}</div>
          );
        })}
      </div>

      {role === "administrator" && <RoleManager initialUsers={roleUsers} />}
      <AdminMessages initialThreads={messageThreads} />
      <AdminConsole
        role={role}
        initialRequests={requestPage.rows}
        initialRequestPage={{ page: requestPage.page, totalPages: requestPage.totalPages, total: requestPage.total }}
        requestFilters={{ status: requestFilters.status, type: requestFilters.type, q: requestFilters.q }}
        initialEnquiries={enquiryPage.rows}
        initialEnquiryPage={{ page: enquiryPage.page, totalPages: enquiryPage.totalPages, total: enquiryPage.total }}
        enquiryFilters={{ status: enquiryFilters.status, q: enquiryFilters.q }}
        staff={staff}
        initialLedger={ledger}
        audit={audit}
        customers={customers}
      />
    </section>
  );
}
