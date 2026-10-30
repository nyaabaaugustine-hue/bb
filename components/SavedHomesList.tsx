"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Img from "@/components/Img";
import { KIND_LABEL, Listing, money } from "@/lib/data";
import { Arrow } from "@/components/Icons";

export default function SavedHomesList({ initialSaved }: { initialSaved: Listing[] }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState("");

  async function remove(slug: string) {
    setRemoving(slug);
    setError("");
    try {
      const response = await fetch("/api/portal/saved-homes", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't remove this home.");
      setSaved((current) => current.filter((listing) => listing.slug !== slug));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't remove this home.");
    } finally {
      setRemoving("");
    }
  }

  if (saved.length === 0) {
    return (
      <div className="panel">
        <h2 className="text-xl">Your shortlist starts here</h2>
        <p className="mt-2 text-sm leading-6 text-mute">Save a home from its listing page and it will be kept here on your account.</p>
        <Link href="/homes" className="btn-primary mt-4">Explore homes <Arrow width={16} height={16} /></Link>
      </div>
    );
  }

  return (
    <div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {saved.map((listing) => (
          <article key={listing.slug} className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
            <Link href={`/homes/${listing.slug}`} className="group">
              <div className="relative aspect-[16/10]"><Img id={listing.img} alt={listing.title} sizes="(min-width:1280px) 25vw, (min-width:640px) 45vw, 100vw" /></div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-terra">{KIND_LABEL[listing.kind]} · {listing.zone}</p>
                <h2 className="mt-1 font-semibold group-hover:text-terra">{listing.title}</h2>
                <p className="mt-2 font-serif text-lg font-bold">{money(listing.price)}{listing.kind === "rent" ? " / month" : ""}</p>
              </div>
            </Link>
            <div className="flex gap-2 px-4 pb-4">
              <Link href={`/homes/${listing.slug}`} className="btn flex-1">View home</Link>
              <button type="button" className="btn" onClick={() => remove(listing.slug)} disabled={removing === listing.slug}>
                {removing === listing.slug ? "Removing…" : "Remove"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
