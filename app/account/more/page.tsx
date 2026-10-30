import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/Icons";
import SignOutButton from "@/components/SignOutButton";

export const metadata: Metadata = { title: "More account options" };

const links = [
  ["/account/site-visits", "Site visits", "View visit requests submitted to the team."],
  ["/account/messages", "Messages", "Read and reply to your named agent in your private thread."],
  ["/account/documents", "Documents", "Understand what the team can share with you."],
  ["/account/profile", "Profile & preferences", "Keep your contact details up to date."],
  ["/account/payments", "Payments", "Review ledger entries recorded by the team."],
  ["/services", "Home services", "Explore available home care and maintenance services."],
  ["/blog", "Help centre & guides", "Read property guides and common questions."],
  ["/contact", "Contact the team", "Choose WhatsApp, phone, or email."],
];

export default function MorePage() {
  return (
    <section>
      <p className="eyebrow">More</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">More account options</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {links.map(([href, title, description]) => (
          <Link key={href} href={href} className="panel group flex items-start justify-between gap-4 transition hover:border-terra/40 hover:shadow-md">
            <span><b>{title}</b><span className="mt-1 block text-sm leading-5 text-mute">{description}</span></span>
            <Arrow width={18} height={18} className="mt-0.5 shrink-0 text-terra transition group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
      <div className="panel mt-6">
        <h2 className="text-xl">Journey-specific areas</h2>
        <p className="mt-2 text-sm leading-6 text-mute">Rental, land, build, owner, investor, and materials sections will appear when those records are supported by your account. We have not assigned a journey stage based on assumptions.</p>
        <p className="mt-2 text-sm leading-6 text-mute">Email notifications and referral tracking are not connected in this release. Replies from your agent appear in your dashboard Messages page.</p>
      </div>
      <div className="mt-6 lg:hidden"><SignOutButton /></div>
    </section>
  );
}
