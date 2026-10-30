"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Arrow, Chat, Doc, Home, Key, Trend, Users } from "@/components/Icons";

const primaryLinks = [
  { href: "/account", label: "Overview", Icon: Home, exact: true },
  { href: "/account/enquiries", label: "My enquiries", Icon: Chat },
  { href: "/account/site-visits", label: "Site visits", Icon: Key },
  { href: "/account/saved", label: "Saved homes", Icon: Key },
  { href: "/account/payments", label: "Payments", Icon: Trend },
  { href: "/account/messages", label: "Messages", Icon: Chat },
  { href: "/account/documents", label: "Documents", Icon: Doc },
  { href: "/account/profile", label: "Profile & preferences", Icon: Users },
];

const mobileLinks = [
  { href: "/account", label: "Overview", Icon: Home, exact: true },
  { href: "/account/enquiries", label: "Enquiries", Icon: Chat },
  { href: "/account/saved", label: "Saved", Icon: Key },
  { href: "/account/payments", label: "Payments", Icon: Trend },
  { href: "/account/more", label: "More", Icon: Arrow },
];

function isActive(pathname: string, href: string, exact = false) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, label, Icon, active }: { href: string; label: string; Icon: typeof Home; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
        active ? "bg-ink text-sand" : "text-mute hover:bg-sand/50 hover:text-ink"
      }`}
    >
      <Icon width={18} height={18} />
      {label}
    </Link>
  );
}

export default function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[70vh] bg-cream">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-3 pb-28 pt-4 sm:px-6 sm:pt-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:pb-12">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-line bg-card p-4 shadow-sm">
            <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-[.14em] text-terra">Your journey</p>
            <nav aria-label="Client dashboard" className="space-y-1">
              {primaryLinks.map(({ href, label, Icon, exact }) => (
                <NavLink key={href} href={href} label={label} Icon={Icon} active={isActive(pathname, href, exact)} />
              ))}
            </nav>
            <div className="mt-5 border-t border-line pt-4">
              <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[.14em] text-mute">Support</p>
              <Link href="/blog" className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-mute hover:bg-sand/50 hover:text-ink">Help centre &amp; guides</Link>
              <Link href="/contact" className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-mute hover:bg-sand/50 hover:text-ink">Contact the team</Link>
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <Link href="/admin" className="text-xs font-semibold text-mute hover:text-terra">Team workspace</Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 [overflow-wrap:anywhere]">{children}</div>
      </div>

      <nav aria-label="Dashboard tabs" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[max(.35rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(24,38,31,.08)] backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-xl grid-cols-5 px-1">
          {mobileLinks.map(({ href, label, Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold ${
                    active ? "text-terra" : "text-mute"
                  }`}
                >
                  <Icon width={19} height={19} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
