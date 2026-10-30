"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAmount, formatDate, formatDateTime, formatWaitingAge } from "@/lib/format";
import {
  enquiryChannelLabels,
  enquiryTransitions,
  labelize,
  requestActions,
  requestReference,
  requestStatusBadgeClass,
  requestStatuses,
  requestTypeLabels,
  requestTypes,
  type EnquiryStatus,
  type RequestStatus,
} from "@/lib/portal-domain";
import type { PortalRole } from "@/lib/portal-roles";

type StaffOption = { id: string; email: string; display_name: string };
type CustomerOption = { id: string; email: string; display_name: string };

type RequestRecord = {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  request_type: string;
  listing_slug: string | null;
  details: { description?: string; requestedDate?: string | null };
  status: RequestStatus;
  created_at: string | Date;
  updated_at: string | Date;
  assigned_to: string | null;
  assigned_name: string | null;
  staff_note: string | null;
};

type EnquiryRecord = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string | null;
  channel: string;
  category: string;
  subject: string;
  message: string | null;
  status: EnquiryStatus;
  created_at: string | Date;
  handled_name: string | null;
};

type LedgerRecord = {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  transaction_type: string;
  amount: string;
  currency: string;
  reference: string;
  status: string;
  created_at: string | Date;
  verified_at: string | Date | null;
};

type AuditRecord = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string | Date;
  actor_email: string | null;
};

type RequestFilters = { status: string; type: string; q: string };
type EnquiryFilters = { status: string; q: string };
type Paged = { page: number; totalPages: number; total: number };

function buildHref(overrides: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined && value !== "" && value !== "all") params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

function Pager({ page, totalPages, total, hrefFor, label }: { page: number; totalPages: number; total: number; hrefFor: (page: number) => string; label: string }) {
  if (total === 0) return null;
  return (
    <nav aria-label={`${label} pages`} className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-mute">Page {page} of {totalPages} · {total} {total === 1 ? "record" : "records"}</span>
      <span className="flex gap-2">
        {page > 1 ? <Link href={hrefFor(page - 1)} className="btn min-h-10 px-3">Previous</Link> : null}
        {page < totalPages ? <Link href={hrefFor(page + 1)} className="btn min-h-10 px-3">Next</Link> : null}
      </span>
    </nav>
  );
}

function NoteEditor({ id, initialNote, onSave, disabled }: { id: string; initialNote: string; onSave: (note: string) => Promise<boolean>; disabled: boolean }) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  useEffect(() => setNote(initialNote), [initialNote]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onSave(note);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2">
      <label className="label" htmlFor={`note-${id}`}>Internal note</label>
      <textarea id={`note-${id}`} value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={2000} className="field resize-y" placeholder="Context for the next person who picks this up." />
      <button type="submit" className="btn min-h-9 px-3 text-xs" disabled={saving || disabled}>{saving ? "Saving…" : "Save note"}</button>
    </form>
  );
}

export default function AdminConsole({
  role,
  initialRequests,
  initialRequestPage,
  requestFilters,
  initialEnquiries,
  initialEnquiryPage,
  enquiryFilters,
  staff,
  initialLedger,
  audit,
  customers,
}: {
  role: PortalRole;
  initialRequests: RequestRecord[];
  initialRequestPage: Paged;
  requestFilters: RequestFilters;
  initialEnquiries: EnquiryRecord[];
  initialEnquiryPage: Paged;
  enquiryFilters: EnquiryFilters;
  staff: StaffOption[];
  initialLedger: LedgerRecord[];
  audit: AuditRecord[];
  customers: CustomerOption[];
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [ledger, setLedger] = useState(initialLedger);
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => setRequests(initialRequests), [initialRequests]);
  useEffect(() => setEnquiries(initialEnquiries), [initialEnquiries]);
  useEffect(() => setLedger(initialLedger), [initialLedger]);

  function clearMessages() {
    setError("");
    setNotice("");
  }

  async function updateRequest(body: Record<string, unknown>, successMessage: string) {
    const response = await fetch("/api/admin/records", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entityType: "request", ...body }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "The request could not be updated.");
    setNotice(successMessage);
    router.refresh();
    return result;
  }

  async function changeStatus(id: string, status: RequestStatus) {
    setPendingId(id);
    clearMessages();
    try {
      await updateRequest({ id, status }, "Request updated and audit logged.");
      setRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request could not be updated.");
    } finally {
      setPendingId("");
    }
  }

  async function assign(id: string, assignedTo: string) {
    setPendingId(id);
    clearMessages();
    try {
      await updateRequest({ id, assignedTo: assignedTo || null }, "Assignment updated.");
      const person = staff.find((member) => member.id === assignedTo);
      setRequests((current) => current.map((item) => item.id === id
        ? { ...item, assigned_to: assignedTo || null, assigned_name: person?.display_name || person?.email || null }
        : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request could not be assigned.");
    } finally {
      setPendingId("");
    }
  }

  async function saveNote(id: string, note: string) {
    setPendingId(id);
    clearMessages();
    try {
      await updateRequest({ id, note }, "Internal note saved.");
      setRequests((current) => current.map((item) => item.id === id ? { ...item, staff_note: note.trim() || null } : item));
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The note could not be saved.");
      return false;
    } finally {
      setPendingId("");
    }
  }

  async function changeEnquiryStatus(id: string, status: EnquiryStatus) {
    setPendingId(id);
    clearMessages();
    try {
      const response = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "The enquiry could not be updated.");
      setEnquiries((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      setNotice("Enquiry updated and audit logged.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The enquiry could not be updated.");
    } finally {
      setPendingId("");
    }
  }

  async function changeLedgerStatus(id: string, status: "verified" | "rejected") {
    setPendingId(id);
    clearMessages();
    try {
      const response = await fetch("/api/admin/records", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entityType: "ledger", id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "The record could not be updated.");
      setLedger((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      setNotice("Ledger entry updated and audit logged.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The record could not be updated.");
    } finally {
      setPendingId("");
    }
  }

  async function addLedgerEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    setPendingId("new-ledger");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/admin/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: form.get("userId"),
          transactionType: form.get("transactionType"),
          amount: Number(form.get("amount")),
          reference: form.get("reference"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "The ledger entry could not be saved.");
      formElement.reset();
      const customer = customers.find((item) => item.id === result.entry.user_id);
      setLedger((current) => [{
        ...result.entry,
        email: customer?.email ?? "",
        display_name: customer?.display_name ?? "",
        verified_at: null,
      }, ...current]);
      setNotice("Pending ledger entry recorded. Verify it only after confirming settlement.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The ledger entry could not be saved.");
    } finally {
      setPendingId("");
    }
  }

  const requestHref = (page: number, overrides: Record<string, string | number | undefined> = {}) => buildHref({
    status: requestFilters.status,
    type: requestFilters.type,
    q: requestFilters.q,
    enquiryStatus: enquiryFilters.status,
    enquiryQ: enquiryFilters.q,
    page,
    ...overrides,
  });
  const enquiryHref = (page: number, overrides: Record<string, string | number | undefined> = {}) => buildHref({
    status: requestFilters.status,
    type: requestFilters.type,
    q: requestFilters.q,
    enquiryStatus: enquiryFilters.status,
    enquiryQ: enquiryFilters.q,
    enquiryPage: page,
    ...overrides,
  });

  return (
    <div className="mt-8 space-y-10">
      {error && <p role="alert" className="rounded-lg border border-red-800/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-moss/20 bg-moss/5 px-4 py-3 text-sm font-medium text-moss">{notice}</p>}

      <section id="enquiries" className="scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl">Public enquiry inbox</h2>
            <p className="mt-1 text-sm text-mute">Enquiries from the website are saved here with a reference. Call or write back, then mark them contacted or closed.</p>
          </div>
          <span className="badge badge-sand">{initialEnquiryPage.total} matching</span>
        </div>
        <form key={`${enquiryFilters.status}-${enquiryFilters.q}`} action="/admin#enquiries" method="get" className="mt-4 grid gap-3 rounded-xl border border-line bg-card p-4 sm:grid-cols-[1fr_auto_auto]">
          <input type="hidden" name="status" value={requestFilters.status} />
          <input type="hidden" name="type" value={requestFilters.type} />
          <input type="hidden" name="q" value={requestFilters.q} />
          <label className="text-sm font-semibold">Search enquiries
            <input type="search" name="enquiryQ" defaultValue={enquiryFilters.q} placeholder="Name, phone, email, reference or message" className="field mt-1 min-h-11 w-full" />
          </label>
          <label className="text-sm font-semibold">Status
            <select name="enquiryStatus" defaultValue={enquiryFilters.status} className="field mt-1 min-h-11 w-full sm:w-40">
              <option value="new">New</option>
              <option value="all">All statuses</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <button type="submit" className="btn-primary min-h-11 self-end">Apply</button>
        </form>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {enquiries.length === 0 ? (
            <p className="py-6 text-sm text-mute">No enquiries match this view.</p>
          ) : enquiries.map((item) => (
            <article key={item.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{item.subject}</h3>
                  <p className="mt-1 text-sm text-mute">
                    {item.name} · {item.reference} · {labelize(item.category)} · {enquiryChannelLabels[item.channel as keyof typeof enquiryChannelLabels] ?? item.channel}
                  </p>
                </div>
                <span className={`${requestStatusBadgeClass(item.status === "closed" ? "completed" : item.status === "contacted" ? "confirmed" : "pending")} capitalize`}>{item.status}</span>
              </div>
              {item.message && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{item.message}</p>}
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-mute">
                <span>{item.phone}</span>
                {item.email && <a href={`mailto:${item.email}`} className="font-semibold text-terra hover:underline">{item.email}</a>}
                <span>Received {formatDate(item.created_at) ?? "date unavailable"}</span>
                {item.handled_name && <span>Handled by {item.handled_name}</span>}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`tel:+${item.phone}`} className="btn min-h-9 px-3 text-xs">Call</a>
                <a href={`https://wa.me/${item.phone}`} target="_blank" rel="noopener noreferrer" className="btn min-h-9 px-3 text-xs">WhatsApp</a>
                {enquiryTransitions[item.status].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={status === "closed" ? "btn min-h-9 px-3 text-xs" : "btn-primary min-h-9 px-3 text-xs"}
                    disabled={pendingId === item.id}
                    onClick={() => changeEnquiryStatus(item.id, status)}
                  >
                    {pendingId === item.id ? "Updating…" : status === "contacted" ? "Mark contacted" : "Close enquiry"}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <Pager page={initialEnquiryPage.page} totalPages={initialEnquiryPage.totalPages} total={initialEnquiryPage.total} hrefFor={(page) => enquiryHref(page)} label="Enquiries" />
      </section>

      <section id="customer-requests" className="scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl">Customer requests</h2>
            <p className="mt-1 text-sm text-mute">Bookings, valuations and property submissions need a human review. Assign an owner so nothing is picked up twice.</p>
          </div>
          <span className="badge badge-sand">{initialRequestPage.total} matching</span>
        </div>
        <form key={`${requestFilters.status}-${requestFilters.type}-${requestFilters.q}`} action="/admin#customer-requests" method="get" className="mt-4 grid gap-3 rounded-xl border border-line bg-card p-4 sm:grid-cols-2 xl:grid-cols-5">
          <input type="hidden" name="enquiryStatus" value={enquiryFilters.status} />
          <input type="hidden" name="enquiryQ" value={enquiryFilters.q} />
          <label className="text-sm font-semibold">Search requests
            <input type="search" name="q" defaultValue={requestFilters.q} placeholder="Name, email, property or reference" className="field mt-1 min-h-11 w-full" />
          </label>
          <label className="text-sm font-semibold">Status
            <select name="status" defaultValue={requestFilters.status} className="field mt-1 min-h-11 w-full">
              <option value="open">Open requests</option>
              <option value="all">All statuses</option>
              {requestStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Request type
            <select name="type" defaultValue={requestFilters.type} className="field mt-1 min-h-11 w-full">
              <option value="all">All request types</option>
              {requestTypes.map((type) => <option key={type} value={type}>{requestTypeLabels[type]}</option>)}
            </select>
          </label>
          <button type="submit" className="btn-primary min-h-11 self-end">Apply filters</button>
          <Link href="/admin#customer-requests" className="self-end text-sm font-semibold text-terra underline underline-offset-4">Clear filters</Link>
        </form>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {requests.length === 0 ? (
            <p className="py-6 text-sm text-mute">No requests match this view.</p>
          ) : requests.map((item) => (
            <article key={item.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold capitalize">{requestTypeLabels[item.request_type as keyof typeof requestTypeLabels] ?? labelize(item.request_type)}{item.listing_slug ? ` · ${item.listing_slug}` : ""}</h3>
                  <p className="mt-1 text-sm text-mute">{item.display_name || item.email} · {item.email}</p>
                </div>
                <span className={`${requestStatusBadgeClass(item.status)} capitalize`}>{labelize(item.status)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{item.details.description}</p>
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-mute">
                <span>Received {formatDate(item.created_at) ?? "date unavailable"}</span>
                <span className="font-semibold text-terra">{formatWaitingAge(item.created_at)}</span>
                <span>Ref {requestReference(item)}</span>
                {item.details.requestedDate && <span>Preferred follow-up: {formatDate(item.details.requestedDate) ?? "date unavailable"}</span>}
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="text-xs font-semibold text-mute">Assigned to
                  <select
                    className="field mt-1 block min-h-10 min-w-52"
                    value={item.assigned_to ?? ""}
                    disabled={pendingId === item.id}
                    onChange={(event) => assign(item.id, event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {staff.map((member) => <option key={member.id} value={member.id}>{member.display_name || member.email}</option>)}
                  </select>
                </label>
                {item.assigned_name && <p className="pb-2 text-xs text-mute">Owner: <span className="font-semibold text-ink">{item.assigned_name}</span></p>}
              </div>
              {requestActions[item.status]?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {requestActions[item.status]!.map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      className={action.status === "rejected" || action.status === "cancelled" ? "btn" : "btn-primary"}
                      disabled={pendingId === item.id}
                      onClick={() => changeStatus(item.id, action.status)}
                    >
                      {pendingId === item.id ? "Updating…" : action.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <details className="mt-3">
                <summary className="w-fit cursor-pointer text-sm font-semibold text-terra">Internal note{item.staff_note ? " · saved" : ""}</summary>
                <NoteEditor id={item.id} initialNote={item.staff_note ?? ""} disabled={pendingId === item.id} onSave={(note) => saveNote(item.id, note)} />
                {item.staff_note && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-sand/30 px-3 py-2 text-xs leading-5 text-mute">{item.staff_note}</p>}
              </details>
            </article>
          ))}
        </div>
        <Pager page={initialRequestPage.page} totalPages={initialRequestPage.totalPages} total={initialRequestPage.total} hrefFor={(page) => requestHref(page)} label="Customer requests" />
      </section>

      {role === "administrator" && (
        <section id="investment-ledger" className="scroll-mt-28 grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
          <div>
            <h2 className="text-2xl">Investment ledger</h2>
            <p className="mt-1 text-sm text-mute">Record entries for a customer; verify only after checking settlement outside this portal. Showing the latest 50.</p>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {ledger.length === 0 ? <p className="py-6 text-sm text-mute">No ledger entries have been recorded.</p> : ledger.map((entry) => (
                <article key={entry.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold capitalize">{labelize(entry.transaction_type)} · {entry.currency} {formatAmount(Number(entry.amount))}</p>
                    <p className="mt-1 text-sm text-mute">{entry.display_name || entry.email} · {entry.reference}</p>
                    <p className="mt-1 text-xs capitalize text-mute">
                      {entry.status} · {formatDate(entry.created_at) ?? "date unavailable"}
                      {entry.verified_at ? ` · verified ${formatDate(entry.verified_at)}` : ""}
                    </p>
                  </div>
                  {entry.status === "pending" && (
                    <div className="flex gap-2">
                      <button type="button" className="btn-primary" disabled={pendingId === entry.id} onClick={() => changeLedgerStatus(entry.id, "verified")}>Verify</button>
                      <button type="button" className="btn" disabled={pendingId === entry.id} onClick={() => changeLedgerStatus(entry.id, "rejected")}>Reject</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          <form className="panel space-y-4" onSubmit={addLedgerEntry}>
            <div><h2 className="text-xl">Record a transaction</h2><p className="mt-1 text-sm leading-6 text-mute">This creates a pending record. It does not collect or move money.</p></div>
            <div>
              <label className="label" htmlFor="ledger-user">Customer</label>
              <select id="ledger-user" name="userId" required className="field min-h-11">
                <option value="">Choose customer</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.display_name || customer.email} · {customer.email}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="transaction-type">Entry type</label>
              <select id="transaction-type" name="transactionType" required className="field min-h-11">
                <option value="contribution">Investment contribution</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="return">Return</option>
                <option value="fee">Fee</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="amount">Amount (GHS)</label>
              <input id="amount" name="amount" type="number" min="0.01" max="100000000" step="0.01" required className="field min-h-11" />
            </div>
            <div>
              <label className="label" htmlFor="reference">Settlement reference</label>
              <input id="reference" name="reference" minLength={3} maxLength={120} required className="field min-h-11" />
            </div>
            <button type="submit" className="btn-primary min-h-11 w-full justify-center" disabled={pendingId === "new-ledger" || customers.length === 0}>
              {pendingId === "new-ledger" ? "Saving…" : "Record pending entry"}
            </button>
            {customers.length === 0 && <p className="text-xs leading-5 text-mute">A customer will appear here after they create an account and use the portal.</p>}
          </form>
        </section>
      )}

      {role === "administrator" && (
        <section id="audit-log" className="scroll-mt-28">
          <h2 className="text-2xl">Recent staff activity</h2>
          <p className="mt-1 text-sm text-mute">The latest audited actions in the workspace.</p>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {audit.length === 0 ? <p className="py-6 text-sm text-mute">No audited actions yet.</p> : audit.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span><b>{labelize(entry.action)}</b> · {entry.entity_type} {entry.entity_id.slice(0, 8)}</span>
                <span className="text-xs text-mute">{entry.actor_email ?? "system"} · {formatDateTime(entry.created_at) ?? "date unavailable"}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
