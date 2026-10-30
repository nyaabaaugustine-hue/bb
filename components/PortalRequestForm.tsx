"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { listings, money } from "@/lib/data";
import { requestTypeLabels, requestTypes } from "@/lib/portal-domain";

export default function PortalRequestForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const date = String(form.get("requestedDate") ?? "");
    if (date && Number.isNaN(Date.parse(date))) {
      setError("Choose a valid preferred date, or leave it blank.");
      setPending(false);
      return;
    }

    try {
      const response = await fetch("/api/portal/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: form.get("type"),
          listingSlug: form.get("listingSlug"),
          requestedDate: date ? new Date(date).toISOString() : "",
          description: form.get("description"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "We couldn't send your request.");
        return;
      }

      formElement.reset();
      setSuccess(`Request ${result.request.reference} received. Our team will review it before confirming next steps.`);
      router.refresh();
    } catch {
      setError("We couldn't send your request. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="request-type">What would you like to do?</label>
        <select id="request-type" name="type" className="field min-h-12" required>
          {requestTypes.map((value) => <option value={value} key={value}>{requestTypeLabels[value]}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="listing-slug">Property <span className="font-normal text-mute">(optional)</span></label>
        <select id="listing-slug" name="listingSlug" className="field min-h-12" defaultValue="">
          <option value="">Not property-specific</option>
          {listings.map((listing) => (
            <option key={listing.slug} value={listing.slug}>{listing.title} · {listing.zone} · {money(listing.price)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="requested-date">Preferred date <span className="font-normal text-mute">(optional)</span></label>
        <input id="requested-date" name="requestedDate" type="datetime-local" className="field min-h-12" />
      </div>
      <div>
        <label className="label" htmlFor="request-description">A few details</label>
        <textarea id="request-description" name="description" rows={4} minLength={10} maxLength={2000} required className="field resize-y" placeholder="Tell us what you have in mind, your preferred area and any timing or budget details." />
      </div>
      {error && <p role="alert" className="rounded-lg border border-red-800/20 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-900">{error}</p>}
      {success && <p role="status" className="rounded-lg border border-moss/20 bg-moss/5 px-3 py-2.5 text-sm font-medium text-moss">{success}</p>}
      <button type="submit" className="btn-primary min-h-12 w-full justify-center" disabled={pending}>
        {pending ? "Sending request…" : "Send a request"}
      </button>
      <p className="text-xs leading-5 text-mute">This is a request, not a reservation or payment. Our team will confirm availability, valuation details and any next steps with you.</p>
    </form>
  );
}
