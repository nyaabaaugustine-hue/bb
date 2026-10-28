"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import NewsletterPopup, { NewsletterButton } from "@/components/NewsletterPopup";
import PublicFloatingActions from "@/components/PublicFloatingActions";
import ScreenGuard from "@/components/ScreenGuard";
import SignOutButton from "@/components/SignOutButton";
import { Gmail, Phone } from "@/components/Icons";
import { gmailLink, logoIconUrl, PHONE, PHONE_HREF } from "@/lib/data";

const explore = [
  ["/homes", "Find a home"],
  ["/land-and-build", "Land and build"],
  ["/materials", "Materials shop"],
  ["/services", "Home services"],
  ["/invest", "Invest"],
  ["/blog", "News & stories"],
  ["/about", "About us"],
];

function isPortalPath(pathname: string) {
  return pathname === "/account" || pathname.startsWith("/account/")
    || pathname === "/admin" || pathname.startsWith("/admin/");
}

function PortalHeader({ admin }: { admin: boolean }) {
  return (
    <header className="sticky top-0 z-[55] border-b border-line bg-card/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="B B Homes public website" className="shrink-0">
          <Logo height={32} />
        </Link>
        <div className="min-w-0 flex-1 border-l border-line pl-3">
          <p className="truncate text-sm font-bold text-ink">{admin ? "Property operations" : "Customer portal"}</p>
          <p className="hidden text-xs text-mute sm:block">{admin ? "Private team workspace" : "Your property journey"}</p>
        </div>
        <nav aria-label="Portal actions" className="flex shrink-0 items-center gap-2">
          {admin ? (
            <>
              <Link href="/account" className="btn hidden min-h-10 px-3 text-xs sm:inline-flex">My account</Link>
              <Link href="/" className="btn hidden min-h-10 px-3 text-xs md:inline-flex">View website</Link>
            </>
          ) : (
            <Link href="/homes" className="btn hidden min-h-10 px-3 text-xs sm:inline-flex">Browse homes</Link>
          )}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="mt-16 bg-ink text-cream">
      <div className="wrap grid gap-8 !py-12 md:grid-cols-3">
        <div>
          <Link href="/" aria-label="B B Homes, home page"><Logo height={56} plate /></Link>
          <p className="mt-4 max-w-xs text-sm text-cream/70">A home is a human right, we build it.</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow !text-sand">Explore</p>
          <div className="mt-3 flex flex-col gap-2">
            {explore.map(([href, label]) => <Link key={href} href={href} className="w-fit text-cream/80 transition hover:translate-x-0.5 hover:text-sand">{label}</Link>)}
          </div>
        </div>
        <div className="text-sm">
          <p className="eyebrow !text-sand">Contact</p>
          <p className="mt-3 text-cream/80">Replies by phone or email.</p>
          <a href={PHONE_HREF} className="mt-3 flex w-fit items-center gap-2 font-semibold text-cream hover:text-sand"><Phone width={16} height={16} />{PHONE}</a>
          <a href={gmailLink()} target="_blank" rel="noopener" className="mt-2 flex w-fit items-center gap-2 font-semibold text-cream hover:text-sand"><span className="flex h-5 w-5 items-center justify-center rounded bg-white"><Gmail width={14} height={14} /></span>Email us on Gmail</a>
          <Link href="/contact" className="btn-primary mt-4">Talk to an agent</Link>
          <NewsletterButton className="mt-3 block text-left text-cream/80 underline-offset-2 transition hover:text-sand hover:underline">Get free deal alerts by email</NewsletterButton>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-3 border-t border-cream/10 py-5 text-center text-xs text-cream/50 sm:flex-row">
        <span>© {new Date().getFullYear()} B B Homes. All rights reserved.</span>
        <span className="flex gap-4"><Link href="/privacy" className="hover:text-sand">Privacy</Link><Link href="/terms" className="hover:text-sand">Terms</Link><Link href="/blog" className="hover:text-sand">News &amp; stories</Link></span>
      </div>
    </footer>
  );
}

export default function RootChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const portal = isPortalPath(pathname);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sand">Skip to content</a>
      {portal ? <PortalHeader admin={pathname === "/admin" || pathname.startsWith("/admin/")} /> : <Nav />}
      <main id="main">{children}</main>
      {portal ? null : (
        <>
          <PublicFloatingActions />
          <NewsletterPopup />
          <ScreenGuard />
          <PublicFooter />
        </>
      )}
    </>
  );
}
