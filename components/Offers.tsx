"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import Card from "./Card";
import { listings, KIND_LABEL, money, type Kind } from "@/lib/data";
import { KIND_ICON, Arrow, Doc, Shield, Wrench } from "./Icons";

const KINDS = Object.keys(KIND_LABEL) as Kind[];
const BLURB: Record<Kind, string> = {
  rent: "Managed rentals and medium stays. Pick “Now” to move in soon.",
  house: "Move-in-ready homes and land and house packages, one price and one team.",
  land: "Plots with title documents shown upfront. Selected plots can be paid in stages.",
  offplan: "Reserve now and pay as your home is built.",
  build: "Four phases on your plot: foundation, walls, roof, finish.",
  invest: "Land banks, family compounds and rental starters to grow a portfolio.",
};
const MORE = [
  { icon: Shield, title: "Staged payment plans", text: "On selected plots and build-to-own homes, agreed in writing first.", href: "/land-and-build", cta: "See how it works" },
  { icon: Doc, title: "Materials quotes", text: "Build a list, see an estimate and get wholesale pricing for projects.", href: "/materials", cta: "Open the shop" },
  { icon: Wrench, title: "Home services", text: "Management, repairs and renovation, each request tracked by reference.", href: "/services", cta: "Request a service" },
];

export default function Offers() {
  const [tab, setTab] = useState<Kind | "all">("all");
  const counts = useMemo(() => Object.fromEntries(KINDS.map((k) => [k, listings.filter((l) => l.kind === k).length])) as Record<Kind, number>, []);
  const shown = tab === "all" ? listings : listings.filter((l) => l.kind === tab);
  const from = (k: Kind) => { const p = listings.filter((l) => l.kind === k).map((l) => l.price); return p.length ? Math.min(...p) : null; };

  return (<div>
    {/* Offer types */}
    <div role="tablist" aria-label="Offer types" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
      <button role="tab" aria-selected={tab === "all"} onClick={() => setTab("all")} className={`btn shrink-0 !rounded-full transition ${tab === "all" ? "!border-ink !bg-ink !text-sand" : ""}`}>All offers <span className={`rounded-full px-1.5 text-xs ${tab === "all" ? "bg-white/20" : "bg-ink/10"}`}>{listings.length}</span></button>
      {KINDS.map((k) => { const I = KIND_ICON[k]; const on = tab === k;
        return <button key={k} role="tab" aria-selected={on} onClick={() => setTab(k)} className={`btn shrink-0 !rounded-full transition ${on ? "!border-ink !bg-ink !text-sand" : ""}`}><I width={16} height={16} />{KIND_LABEL[k]} <span className={`rounded-full px-1.5 text-xs ${on ? "bg-white/20" : "bg-ink/10"}`}>{counts[k]}</span></button>; })}
    </div>

    {/* Short description of the selected type */}
    <p className="mb-5 mt-2 min-h-[1.5rem] text-sm text-mute" aria-live="polite">
      {tab === "all" ? "Every way we can help you own, build or invest, in one place." : <>{BLURB[tab]}{from(tab) !== null && <> From <b className="text-ink">{money(from(tab)!)}</b>{tab === "rent" && " / month"}.</>}</>}
    </p>

    {/* Offers */}
    <div key={tab} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((l, i) => <div key={l.slug} className="stagger" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}><Card l={l} /></div>)}
    </div>
    {shown.length === 0 && <p className="panel text-center text-sm text-mute">No offers of this type right now. Ask an agent what is coming up.</p>}

    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-mute">Prices in cedis. Rentals are per month. An agent confirms every plan in writing.</p>
      <Link href="/homes" className="btn-primary group">Filter all offers <Arrow width={16} height={16} className="transition group-hover:translate-x-1" /></Link>
    </div>

    {/* More offers beyond listings */}
    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {MORE.map((m) => { const I = m.icon;
        return <Link key={m.title} href={m.href} className="panel panel-hover group flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-sand transition duration-300 group-hover:rotate-6 group-hover:bg-terra group-hover:text-white"><I width={22} height={22} /></span>
          <span><b className="block">{m.title}</b><span className="mt-1 block text-sm text-mute">{m.text}</span><span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-terra">{m.cta} <Arrow width={14} height={14} className="transition group-hover:translate-x-1" /></span></span></Link>; })}
    </div>
  </div>);
}
