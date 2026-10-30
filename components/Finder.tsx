"use client";
import { useState } from "react";
import { Listing, WHEN, ZONES, commit, money, featuredListings } from "@/lib/data";
import Card from "./Card";
import FeaturedFlip from "./FeaturedFlip";
import { Home } from "./Icons";

export default function Finder({ listings, compact = false }: { listings: Listing[]; compact?: boolean }) {
  const [zone, setZone] = useState("Any"); const [bud, setBud] = useState(400); const [w, setW] = useState(0);
  const r = listings.filter((l) => l.when === w && (zone === "Any" || l.zone === zone) && commit(l) <= bud * 1000);
  const featured = featuredListings(listings);
  const reset = () => { setZone("Any"); setBud(400); setW(0); };
  return (<div>
    <div className={`panel grid gap-5 !p-5 shadow-md ${compact ? "" : "md:grid-cols-3"}`}>
      <div><label htmlFor="f-zone" className="label">Where</label>
        <select id="f-zone" value={zone} onChange={(e) => setZone(e.target.value)} className="field"><option>Any</option>{ZONES.map((z) => <option key={z}>{z}</option>)}</select></div>
      <div><label htmlFor="f-bud" className="label flex justify-between">Budget <b className="text-terra">{money(bud * 1000)}</b></label>
        <input id="f-bud" type="range" min={20} max={800} step={10} value={bud} onChange={(e) => setBud(+e.target.value)} className="mt-3 w-full" />
        <span className="mt-1 flex justify-between text-xs text-mute"><span>GHS 20k</span><span>GHS 800k</span></span></div>
      <div><span className="label" id="f-when">When</span>
        <div className="seg" role="group" aria-labelledby="f-when">{WHEN.map((n, i) => <button key={n} type="button" aria-pressed={i === w} onClick={() => setW(i)} className="seg-item">{n}</button>)}</div></div>
    </div>
    <p className="my-5 text-sm text-mute" aria-live="polite">{r.length ? <><b className="text-ink">{r.length}</b> {r.length === 1 ? "option matches" : "options match"}. Next steps change with your horizon.</> : "No exact matches yet."}</p>
    {r.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{r.map((l) => <Card key={l.slug} l={l} />)}</div> : (
      <div className="panel fade-in flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand/30 text-terra"><Home width={24} height={24} /></span>
        <p className="font-semibold">Nothing fits yet</p>
        <p className="max-w-sm text-sm text-mute">Try a higher budget, another city or a later horizon, or talk to an agent who knows what is coming up.</p>
        <div className="flex gap-2"><button type="button" className="btn" onClick={reset}>Reset filters</button><a href="/contact" className="btn-primary">Talk to an agent</a></div>
      </div>)}
    <FeaturedFlip items={featured} />
  </div>);
}
