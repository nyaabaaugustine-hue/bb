import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";
import { ensurePortalCustomer } from "@/lib/portal";
import { displayPhone } from "@/lib/portal-domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "Profile and preferences" };

export default async function ProfilePage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount%2Fprofile");
  await ensurePortalCustomer(session.user);

  const { rows } = await getPool().query<{
    display_name: string;
    phone: string | null;
    preferred_channel: string | null;
    preferred_zone: string | null;
    budget_min: string | null;
    budget_max: string | null;
    marketing_opt_in: boolean;
  }>(
    `SELECT display_name, phone, preferred_channel, preferred_zone, budget_min, budget_max, marketing_opt_in
     FROM portal_customers
     WHERE id = $1`,
    [session.user.id],
  );
  const profile = rows[0] ?? {
    display_name: session.user.name ?? "",
    phone: null,
    preferred_channel: null,
    preferred_zone: null,
    budget_min: null,
    budget_max: null,
    marketing_opt_in: false,
  };

  return (
    <section>
      <p className="eyebrow">Your account</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Profile &amp; preferences</h1>
      <div className="mt-6 grid max-w-3xl gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)]">
        <div className="panel">
          <h2 className="text-xl">Contact details</h2>
          <p className="mt-1 text-sm leading-6 text-mute">Keep these current so your agent reaches the right person.</p>
          <div className="mt-5">
            <ProfileForm
              displayName={profile.display_name}
              phone={displayPhone(profile.phone)}
              preferredChannel={profile.preferred_channel}
              preferredZone={profile.preferred_zone}
              budgetMin={profile.budget_min}
              budgetMax={profile.budget_max}
              marketingOptIn={profile.marketing_opt_in}
            />
          </div>
        </div>
        <aside className="panel space-y-3">
          <h2 className="text-xl">Account</h2>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mute">Email</p>
            <p className="mt-1 break-all text-sm font-medium">{session.user.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mute">Email status</p>
            <p className="mt-1 text-sm font-medium">{session.user.emailVerified ? "Verified" : "Not verified"}</p>
          </div>
          <p className="border-t border-line pt-3 text-xs leading-5 text-mute">Your channel, area and budget preferences are saved to your account and shown to the team when they follow up.</p>
        </aside>
      </div>
    </section>
  );
}
