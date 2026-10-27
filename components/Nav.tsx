"use client";
import Link from "next/link"; import { usePathname } from "next/navigation"; import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom"; import Logo from "./Logo"; import Img from "./Img";
import { listings, IMG, PHONE, PHONE_HREF, money, gmailLink } from "@/lib/data";
import { Menu, Close, Key, Home, Land, Crane, Trend, Wrench, Doc, Shield, Users, Pin, Phone, Gmail, Arrow } from "./Icons";

type Item = { icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement; title: string; text: string; href: string };
type Mega = { label: string; href: string; items: Item[]; feature: { img: string; eyebrow: string; title: string; text: string; href: string; cta: string } };
const house = listings.find((l) => l.slug === "existing-three-bed-home")!;

const MEGA: Record<string, Mega> = {
  homes: { label: "Find a home", href: "/homes", items: [
    { icon: Key, title: "Rent", text: "Managed rentals and medium stays", href: "/homes" },
    { icon: Home, title: "Buy a house", text: "Move in now, or a land and house package", href: "/homes" },
    { icon: Land, title: "Buy land", text: "Plots with documents shown upfront", href: "/homes" },
    { icon: Crane, title: "Off-plan", text: "Pay as it is built", href: "/homes" },
    { icon: Crane, title: "Build-to-own", text: "Phased construction on your plot", href: "/homes" },
    { icon: Trend, title: "Invest", text: "Land banks and rental starters", href: "/invest" },
  ], feature: { img: house.img, eyebrow: "Featured · " + house.zone, title: house.title, text: money(house.price), href: `/homes/${house.slug}`, cta: "View home" } },
  build: { label: "Land & build", href: "/land-and-build", items: [
    { icon: Crane, title: "Ownership pathways", text: "Rent-to-own, progressive and build-to-own", href: "/land-and-build" },
    { icon: Doc, title: "Materials shop", text: "Catalogue, estimates and quotes", href: "/materials" },
    { icon: Home, title: "Standard designs", text: "See the plan and price before you build", href: "/land-and-build" },
    { icon: Shield, title: "Payment calculator", text: "Estimate a staged payment plan", href: "/land-and-build" },
  ], feature: { img: IMG.build2, eyebrow: "Build-to-own", title: "Four phases, one clear quote", text: "Foundation, walls, roof, finish.", href: "/land-and-build", cta: "Start building" } },
  services: { label: "Services", href: "/services", items: [
    { icon: Wrench, title: "Maintenance and repairs", text: "Plumbing, electrical and fixes", href: "/services" },
    { icon: Users, title: "Property management", text: "We look after it for you", href: "/services" },
    { icon: Home, title: "Renovation", text: "Painting, upgrades and refits", href: "/services" },
    { icon: Key, title: "Letting and rentals", text: "Find and manage tenants", href: "/services" },
    { icon: Crane, title: "Construction support", text: "Site help and supervision", href: "/services" },
    { icon: Doc, title: "Valuation coordination", text: "Arrange a property valuation", href: "/services" },
  ], feature: { img: IMG.home2, eyebrow: "After you move in", title: "Every request gets a reference", text: "Track status from received to done.", href: "/services", cta: "Request a service" } },
};
const TOP: { key: string; label: string; href: string }[] = [
  { key: "homes", label: MEGA.homes.label, href: "/homes" }, { key: "build", label: MEGA.build.label, href: "/land-and-build" }, { key: "services", label: MEGA.services.label, href: "/services" },
  { key: "invest", label: "Invest", href: "/invest" }, { key: "blog", label: "News & stories", href: "/blog" }, { key: "about", label: "About", href: "/about" },
];
const PLAIN = [{ href: "/invest", label: "Invest", icon: Trend }, { href: "/blog", label: "News & stories", icon: Doc }, { href: "/about", label: "About", icon: Users }];

const Chevron = ({ open }: { open: boolean }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>;

export default function Nav() {
  const p = usePathname(); const [menu, setMenu] = useState<string | null>(null); const [mobile, setMobile] = useState(false); const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0); const [acc, setAcc] = useState<string | null>("homes");
  const [mounted, setMounted] = useState(false); useEffect(() => { setMounted(true); }, []);
  const closeT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined); const head = useRef<HTMLElement>(null);

  const open = useCallback((k: string | null) => { clearTimeout(closeT.current); setMenu(k); }, []);
  const later = useCallback(() => { clearTimeout(closeT.current); closeT.current = setTimeout(() => setMenu(null), 140); }, []);

  // Shrink on scroll and track reading progress
  useEffect(() => {
    let raf = 0;
    const f = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const y = window.scrollY; setScrolled(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight; setProgress(max > 0 ? Math.min(1, y / max) : 0);
    }); };
    f(); window.addEventListener("scroll", f, { passive: true }); window.addEventListener("resize", f);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", f); window.removeEventListener("resize", f); };
  }, []);
  useEffect(() => { setMenu(null); setMobile(false); }, [p]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu(null); setMobile(false); } }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, []);
  useEffect(() => () => clearTimeout(closeT.current), []);
  // Lock page scroll while the mobile drawer is open
  useEffect(() => { if (!mobile) return; const prev = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = prev; }; }, [mobile]);
  // Close the drawer if the window grows to desktop width
  useEffect(() => { const mq = window.matchMedia("(min-width: 1024px)"); const f = () => mq.matches && setMobile(false); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f); }, []);

  const m = menu ? MEGA[menu] : null;
  const isOn = (href: string) => p === href || p.startsWith(href + "/");

  return (<>
    <header ref={head} className="fixed inset-x-0 top-0 z-[55] px-3 pt-3" onMouseLeave={later}
    onBlur={(e) => { if (!head.current?.contains(e.relatedTarget as Node)) setMenu(null); }}>
    <div className="header-drop relative mx-auto max-w-6xl">

      {/* Soft page dim while a mega menu is open (desktop) */}
      {m && <div aria-hidden className="backdrop-in pointer-events-none fixed inset-0 -z-10 hidden bg-ink/25 backdrop-blur-[2px] lg:block" />}

      {/* Floating bar */}
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 lg:backdrop-blur-xl ${scrolled ? "border-line bg-cream/95 shadow-2xl max-lg:bg-cream" : "border-white/50 bg-cream/80 shadow-lg max-lg:bg-cream"}`}>
        {/* Utility strip (collapses on scroll) */}
        <div className={`hidden items-center justify-between overflow-hidden px-5 text-xs text-mute transition-all duration-300 lg:flex ${scrolled ? "max-h-0 border-0 py-0 opacity-0" : "max-h-10 border-b border-line/70 py-1.5 opacity-100"}`}>
          <span className="flex items-center gap-1.5"><Pin width={13} height={13} className="text-terra" />Tamale, Ghana · serving Accra, Kumasi and Tamale</span>
          <span className="flex items-center gap-5">
            <a href={PHONE_HREF} className="flex items-center gap-1.5 font-semibold text-ink transition hover:text-terra"><Phone width={13} height={13} />{PHONE}</a>
            <a href={gmailLink()} target="_blank" rel="noopener" className="flex items-center gap-1.5 font-semibold text-ink transition hover:text-terra"><Gmail width={15} height={15} />Gmail</a></span>
        </div>

        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-2.5 lg:px-5">
          <Link href="/" aria-label="B B Homes, home page" className="group/logo flex min-w-0 flex-1 items-center lg:flex-none"><Logo height={scrolled ? 34 : 40} blend animate fit className="transition-all duration-300" /></Link>

          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            {TOP.map((t) => { const on = isOn(t.href); const isMega = t.key in MEGA; const expanded = menu === t.key;
              return (<Link key={t.key} href={t.href} aria-current={on ? "page" : undefined} aria-haspopup={isMega ? "true" : undefined} aria-expanded={isMega ? expanded : undefined}
                onMouseEnter={() => open(isMega ? t.key : null)} onFocus={() => open(isMega ? t.key : null)}
                className={`group relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-ink/5 hover:text-terra ${on || expanded ? "text-terra" : ""}`}>
                {t.label}{isMega && <Chevron open={expanded} />}
                <span aria-hidden className={`absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-center rounded bg-terra transition-transform duration-300 ease-out ${on || expanded ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} /></Link>); })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/contact" className="btn-primary shimmer hidden !rounded-xl transition-transform hover:-translate-y-0.5 hover:shadow-lg lg:inline-flex" onMouseEnter={() => open(null)}>Talk to us</Link>
            <a href={gmailLink()} target="_blank" rel="noopener" aria-label="Email us by Gmail" className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-card shadow-sm transition active:scale-95 min-[400px]:flex lg:hidden"><Gmail width={20} height={20} /></a>
            <button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink bg-ink text-sand shadow-md transition active:scale-95 lg:hidden" onClick={() => setMobile((v) => !v)} aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} aria-controls="mobile-nav"><Menu /></button>
          </div>
        </div>

        {/* Scroll progress */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent"><span className="block h-full origin-left bg-gradient-to-r from-terra to-sand" style={{ transform: `scaleX(${progress})` }} /></span>
      </div>

      {/* Mega panel (desktop) */}
      {m && (
        <div key={menu} onMouseEnter={() => open(menu)} className="pop-in absolute inset-x-0 top-full mt-2 hidden overflow-hidden rounded-2xl border border-line bg-card shadow-2xl lg:block">
          <div className="grid grid-cols-[1.7fr_1fr]">
            <div className="p-6">
              <p className="eyebrow mb-3">{m.label}</p>
              <ul className="grid grid-cols-2 gap-1">{m.items.map((it, i) => { const I = it.icon;
                return (<li key={it.title} className="stagger" style={{ animationDelay: `${i * 45}ms` }}><Link href={it.href} onClick={() => setMenu(null)} className="group flex gap-3 rounded-xl p-3 transition duration-200 hover:translate-x-1 hover:bg-sand/20">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-sand transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-terra group-hover:text-white"><I width={20} height={20} /></span>
                  <span><b className="block text-sm">{it.title}</b><span className="text-xs text-mute">{it.text}</span></span></Link></li>); })}</ul>
              <Link href={m.href} onClick={() => setMenu(null)} className="group mt-3 inline-flex items-center gap-1 px-3 text-sm font-semibold text-terra hover:underline">View all {m.label.toLowerCase()} <Arrow width={16} height={16} className="transition group-hover:translate-x-1" /></Link>
            </div>
            <Link href={m.feature.href} onClick={() => setMenu(null)} className="group relative isolate flex min-h-[18rem] flex-col justify-end overflow-hidden bg-ink p-6 text-cream">
              <Img id={m.feature.img} alt="" sizes="360px" className="-z-10 transition duration-700 group-hover:scale-110" />
              <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
              <span className="eyebrow !text-sand">{m.feature.eyebrow}</span>
              <b className="mt-1 font-serif text-xl leading-snug">{m.feature.title}</b>
              <span className="mt-1 text-sm text-cream/80">{m.feature.text}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sand">{m.feature.cta} <Arrow width={16} height={16} className="transition group-hover:translate-x-1" /></span>
            </Link>
          </div></div>)}

    </div></header>

    {/* Mobile and tablet drawer is a sibling of the header so header events cannot intercept it. */}
    {mobile && mounted && createPortal(<>
        <button type="button" aria-label="Close menu" onClick={() => setMobile(false)} className="backdrop-in fixed inset-0 z-[60] border-0 bg-ink/60 p-0 backdrop-blur-sm lg:hidden" />
        <nav id="mobile-nav" aria-label="Mobile" className="drawer-in fixed inset-y-0 right-0 z-[61] flex h-[100dvh] max-h-[100dvh] w-[min(22rem,92vw)] flex-col rounded-l-3xl bg-cream pt-[env(safe-area-inset-top)] shadow-2xl lg:hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Link href="/" aria-label="B B Homes, home page" onClick={() => setMobile(false)}><Logo height={36} blend /></Link>
            <button onClick={() => setMobile(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card transition active:scale-90 hover:rotate-90"><Close width={20} height={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            {Object.entries(MEGA).map(([k, g], idx) => { const isOpen = acc === k; const on = isOn(g.href);
              return (<div key={k} className="stagger border-b border-line/70 last:border-0" style={{ animationDelay: `${120 + idx * 60}ms` }}>
                <button onClick={() => setAcc(isOpen ? null : k)} aria-expanded={isOpen} className={`flex w-full items-center justify-between py-3.5 text-left text-base font-bold transition ${on || isOpen ? "text-terra" : ""}`}>{g.label}<Chevron open={isOpen} /></button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <ul className="overflow-hidden" inert={!isOpen}>
                    {g.items.map((it) => { const I = it.icon; return (<li key={it.title}><Link href={it.href} className="flex items-center gap-3 rounded-xl px-1 py-2 text-sm font-semibold transition active:scale-[.98] active:bg-sand/20">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-sand"><I width={18} height={18} /></span>
                      <span className="min-w-0"><b className="block">{it.title}</b><span className="block truncate text-xs font-normal text-mute">{it.text}</span></span></Link></li>); })}
                    <li className="pb-3 pt-1"><Link href={g.href} className="inline-flex items-center gap-1 px-1 text-sm font-semibold text-terra">View all {g.label.toLowerCase()} <Arrow width={16} height={16} /></Link></li>
                  </ul></div></div>); })}

            {PLAIN.map((l, i) => { const I = l.icon; const on = isOn(l.href);
              return (<Link key={l.href} href={l.href} aria-current={on ? "page" : undefined} className={`stagger flex items-center justify-between border-b border-line/70 py-3.5 text-base font-bold transition last:border-0 ${on ? "text-terra" : ""}`} style={{ animationDelay: `${300 + i * 60}ms` }}>
                <span className="flex items-center gap-2.5"><I width={18} height={18} className="text-terra" />{l.label}</span><Arrow width={16} height={16} /></Link>); })}

            <p className="stagger mt-5 flex items-start gap-1.5 text-xs text-mute" style={{ animationDelay: "430ms" }}><Pin width={14} height={14} className="mt-0.5 shrink-0 text-terra" />Tamale, Ghana · serving Accra, Kumasi and Tamale</p>
          </div>

          {/* Pinned actions */}
          <div className="grid gap-2 border-t border-line bg-card/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-2 gap-2">
              <a href={gmailLink()} target="_blank" rel="noopener" className="btn active:scale-95"><Gmail width={18} height={18} />Email</a>
              <a href={PHONE_HREF} className="btn active:scale-95"><Phone width={16} height={16} />Call</a></div>
            <Link href="/contact" className="btn-primary shimmer !py-3 active:scale-95">Talk to us</Link>
          </div>
        </nav></>, document.body)}
  </>);
}
