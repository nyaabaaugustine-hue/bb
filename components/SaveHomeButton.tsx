"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Key } from "@/components/Icons";

export default function SaveHomeButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [known, setKnown] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/portal/saved-homes", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        if (!active) return;
        setSaved((result.savedHomes as { slug: string }[]).some((item) => item.slug === slug));
      })
      .catch(() => {})
      .finally(() => { if (active) setKnown(true); });
    return () => { active = false; };
  }, [slug]);

  async function toggle() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/portal/saved-homes", {
        method: saved ? "DELETE" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.push("/login?next=%2Fhomes%2F" + encodeURIComponent(slug));
        return;
      }
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't update this home.");
      const nextSaved = response.ok ? result.saved : saved;
      setSaved(nextSaved);
      setKnown(true);
      setMessage(nextSaved ? "Saved to your account." : "Removed from your saved homes.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "We couldn't update this home.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn mt-2 w-full" onClick={toggle} disabled={pending} aria-pressed={saved}>
        <Key width={18} height={18} />
        {pending ? "Updating…" : !known ? "Save to my homes" : saved ? "Saved · remove" : "Save to my homes"}
      </button>
      {message && <p role="status" className="mt-2 text-center text-xs text-mute">{message}</p>}
    </div>
  );
}
