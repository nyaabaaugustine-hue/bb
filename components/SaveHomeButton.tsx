"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key } from "@/components/Icons";

export default function SaveHomeButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/portal/saved-homes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.push("/login?next=%2Fhomes%2F" + encodeURIComponent(slug));
        return;
      }
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't save this home.");
      setMessage("Saved to your account.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "We couldn't save this home.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn mt-2 w-full" onClick={save} disabled={pending}>
        <Key width={18} height={18} />{pending ? "Saving…" : "Save to my homes"}
      </button>
      {message && <p role="status" className="mt-2 text-center text-xs text-mute">{message}</p>}
    </div>
  );
}
