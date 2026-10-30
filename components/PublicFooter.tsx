import Link from "next/link";
import Logo from "@/components/Logo";
import NewsletterButton from "@/components/NewsletterButton";
import { Gmail, Phone } from "@/components/Icons";
import { gmailLink, PHONE, PHONE_HREF } from "@/lib/data";

const explore = [
  ["/homes", "Find a home"],
  ["/land-and-build", "Land and build"],
  ["/materials", "Materials shop"],
  ["/services", "Home services"],
  ["/invest", "Invest"],
  ["/blog", "News & stories"],
  ["/about", "About us"],
];

export default function PublicFooter() {
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
