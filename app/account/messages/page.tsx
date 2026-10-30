import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CustomerMessages from "@/components/CustomerMessages";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";
import { ensurePortalCustomer } from "@/lib/portal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const { data: session, error } = await auth.getSession();
  if (error) throw new Error("Unable to load your account session.");
  if (!session?.user) redirect("/login?next=%2Faccount%2Fmessages");
  await ensurePortalCustomer(session.user);

  const db = getPool();
  const { rows } = await db.query<{
    id: string;
    author_role: "customer" | "team";
    body: string;
    created_at: Date;
  }>(
    `SELECT id, author_role, body, created_at
     FROM portal_messages
     WHERE user_id = $1
     ORDER BY created_at ASC
     LIMIT 300`,
    [session.user.id],
  );
  await db.query(
    `UPDATE portal_messages
     SET read_at = now()
     WHERE user_id = $1 AND author_role = 'team' AND read_at IS NULL`,
    [session.user.id],
  );

  return (
    <section>
      <p className="eyebrow">Keep in touch</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Messages</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-mute">
        A private thread with your B B Homes agent. Ask about viewings, documents, payment plans or anything else on your property journey.
      </p>
      <CustomerMessages initialMessages={rows} />
    </section>
  );
}
