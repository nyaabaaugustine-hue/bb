"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { PortalRole } from "@/lib/portal-roles";

type Customer = { id: string; email: string; display_name: string };
type RequestRecord = {
  id: string;
  email: string;
  display_name: string;
  request_type: string;
  listing_slug: string | null;
  details: { description?: string; requestedDate?: string | null };
  status: string;
  created_at: string;
};
type LedgerRecord = {
  id: string;
  email: string;
  display_name: string;
  transaction_type: string;
  amount: string;
  currency: string;
  reference: string;
  status: string;
  created_at: string;
};

const requestTransitions: Record<string, { status: string; label: string }[]> = {
  pending: [
    { status: "in_review", label: "Start review" },
    { status: "confirmed", label: "Confirm" },
    { status: "rejected", label: "Reject" },
  ],
  in_review: [
    { status: "confirmed", label: "Confirm" },
    { status: "completed", label: "Complete" },
    { status: "rejected", label: "Reject" },
  ],
  confirmed: [{ status: "completed", label: "Complete" }],
};

const pretty = (value: string) => value.replaceAll("_", " ");

export default function AdminConsole({
  role,
  customers,
  initialRequests,
  initialLedger,
}: {
  role: PortalRole;
  customers: Customer[];
  initialRequests: RequestRecord[];
  initialLedger: LedgerRecord[];
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [ledger, setLedger] = useState(initialLedger);
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function changeStatus(entityType: "request" | "ledger", id: string, status: string) {
    setPendingId(id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/records", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entityType, id, status }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "The record could not be updated.");
        return;
      }

      if (entityType === "request") {
        setRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      } else {
        setLedger((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      }
      setNotice("Record updated and audit logged.");
      router.refresh();
    } catch {
      setError("The record could not be updated. Check your connection and try again.");
    } finally {
      setPendingId("");
    }
  }

  async function addLedgerEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
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
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "The ledger entry could not be saved.");
        return;
      }
      formElement.reset();
      const customer = customers.find((item) => item.id === result.entry.user_id);
      setLedger((current) => [{
        ...result.entry,
        email: customer?.email ?? "",
        display_name: customer?.display_name ?? "",
        created_at: new Date().toISOString(),
      }, ...current]);
      setNotice("Pending ledger entry recorded. Verify it only after confirming settlement.");
      router.refresh();
    } catch {
      setError("The ledger entry could not be saved. Check your connection and try again.");
    } finally {
      setPendingId("");
    }
  }

  return (
    <div className="mt-8 space-y-10">
      {error && <p role="alert" className="rounded-lg border border-red-800/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-moss/20 bg-moss/5 px-4 py-3 text-sm font-medium text-moss">{notice}</p>}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-2xl">Customer requests</h2><p className="mt-1 text-sm text-mute">Bookings, valuations and property submissions need a human review.</p></div>
          <span className="badge badge-sand">{requests.length} shown</span>
        </div>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {requests.length === 0 ? <p className="py-6 text-sm text-mute">No customer requests have arrived yet.</p> : requests.map((item) => (
            <article key={item.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold capitalize">{pretty(item.request_type)}{item.listing_slug ? ` · ${item.listing_slug}` : ""}</h3>
                  <p className="mt-1 text-sm text-mute">{item.display_name || item.email} · {item.email}</p>
                </div>
                <span className={`badge ${item.status === "confirmed" || item.status === "completed" ? "badge-moss" : "badge-sand"} capitalize`}>{pretty(item.status)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{item.details.description}</p>
              <p className="mt-2 text-xs text-mute">Received {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeZone: "Africa/Accra" }).format(new Date(item.created_at))} · {item.id.slice(0, 8).toUpperCase()}</p>
              {requestTransitions[item.status]?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {requestTransitions[item.status].map((action) => (
                    <button key={action.status} type="button" className={action.status === "rejected" ? "btn" : "btn-primary"} disabled={pendingId === item.id} onClick={() => changeStatus("request", item.id, action.status)}>
                      {pendingId === item.id ? "Updating…" : action.label}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {role === "administrator" && <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
        <div>
          <h2 className="text-2xl">Investment ledger</h2>
          <p className="mt-1 text-sm text-mute">Record entries for a customer; verify only after checking settlement outside this portal.</p>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {ledger.length === 0 ? <p className="py-6 text-sm text-mute">No ledger entries have been recorded.</p> : ledger.map((entry) => (
              <article key={entry.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold capitalize">{pretty(entry.transaction_type)} · {entry.currency} {Number(entry.amount).toLocaleString("en-GH", { minimumFractionDigits: 2 })}</p>
                  <p className="mt-1 text-sm text-mute">{entry.display_name || entry.email} · {entry.reference}</p>
                  <p className="mt-1 text-xs capitalize text-mute">{pretty(entry.status)}</p>
                </div>
                {entry.status === "pending" && (
                  <div className="flex gap-2">
                    <button type="button" className="btn-primary" disabled={pendingId === entry.id} onClick={() => changeStatus("ledger", entry.id, "verified")}>Verify</button>
                    <button type="button" className="btn" disabled={pendingId === entry.id} onClick={() => changeStatus("ledger", entry.id, "rejected")}>Reject</button>
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
      </section>}
    </div>
  );
}
