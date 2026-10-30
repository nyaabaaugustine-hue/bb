"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelRequestButton({ id, reference }: { id: string; reference: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    if (!window.confirm(`Cancel request ${reference}? The team will stop working on it.`)) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/portal/requests", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't cancel this request.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't cancel this request.");
      setPending(false);
    }
  }

  return (
    <div className="mt-3">
      <button type="button" className="text-sm font-semibold text-mute underline underline-offset-4 hover:text-terra" onClick={cancel} disabled={pending}>
        {pending ? "Cancelling…" : "Cancel this request"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-900">{error}</p>}
    </div>
  );
}
