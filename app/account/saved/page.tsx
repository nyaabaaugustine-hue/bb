import type { Metadata } from "next";
import SavedHomesList from "@/components/SavedHomesList";

export const metadata: Metadata = { title: "Saved homes" };

export default function SavedHomesPage() {
  return (
    <section>
      <p className="eyebrow">Your shortlist</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Saved homes</h1>
      <p className="mt-2 mb-6 text-sm leading-6 text-mute">Keep the homes and properties you want to compare close at hand.</p>
      <SavedHomesList />
    </section>
  );
}
