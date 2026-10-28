import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile and preferences" };

export default async function ProfilePage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount%2Fprofile");

  return (
    <section>
      <p className="eyebrow">Your account</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Profile &amp; preferences</h1>
      <div className="panel mt-6 max-w-2xl">
        <h2 className="text-xl">Account details</h2>
        <dl className="mt-4 divide-y divide-line">
          <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wide text-mute">Name</dt><dd className="mt-1 font-medium">{session.user.name || "Not provided"}</dd></div>
          <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wide text-mute">Email</dt><dd className="mt-1 break-all font-medium">{session.user.email || "Not provided"}</dd></div>
          <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wide text-mute">Email status</dt><dd className="mt-1 font-medium">{session.user.emailVerified ? "Verified" : "Not verified"}</dd></div>
        </dl>
        <p className="mt-3 border-t border-line pt-4 text-sm leading-6 text-mute">Saved place, budget, timing, language, and notification preferences are not stored yet. Share a change with your agent and we’ll add editable preferences in a later release.</p>
      </div>
    </section>
  );
}
