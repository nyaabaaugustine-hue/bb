"use client";
import { useState } from "react";
import { materials, money, gmailLink } from "@/lib/data";
import Enquire from "./Enquire"; import SentNotice from "./SentNotice"; import { materialIcon } from "./MaterialIcons"; import { Gmail } from "./Icons";
function Range({ label, v, set, min, max, step = 1, fmt }: { label: string; v: number; set: (n: number) => void; min: number; max: number; step?: number; fmt: (n: number) => string }) {
  return <label className="mt-3 block text-sm font-semibold">{label} <b className="text-terra">{fmt(v)}</b><input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} className="mt-1 w-full accent-terra" /></label>;
}
export function Calculator({ price = 180000 }: { price?: number }) {
  const [p, setP] = useState(price), [d, setD] = useState(20), [y, setY] = useState(10);
  return (<div className="panel"><h3 className="text-lg">What can I afford?</h3>
    <Range label="Price" v={p} set={setP} min={30000} max={600000} step={5000} fmt={money} />
    <Range label="Deposit" v={d} set={setD} min={5} max={50} step={5} fmt={(n) => n + "%"} />
    <Range label="Years" v={y} set={setY} min={2} max={20} fmt={(n) => String(n)} />
    <p className="mt-4 font-serif text-3xl font-bold text-terra">{money((p * (1 - d / 100)) / (y * 12))}</p>
    <p className="mb-4 text-xs text-mute">per month. Illustrative, no interest. An agent confirms the real plan.</p>
    <Enquire subject={`Payment plan for ${money(p)}`} label="Get this plan from an agent" className="btn-primary w-full" /></div>);
}
export function Projection() {
  const [a, setA] = useState(200000), [y, setY] = useState(5);
  const vals = Array.from({ length: y + 1 }, (_, i) => a * Math.pow(1.08, i)); const max = vals[vals.length - 1];
  return (<div className="grid gap-4 md:grid-cols-2"><div className="panel">
    <Range label="Amount" v={a} set={setA} min={50000} max={1000000} step={10000} fmt={money} />
    <Range label="Years" v={y} set={setY} min={1} max={10} fmt={(n) => String(n)} />
    <p className="mt-4 font-serif text-3xl font-bold text-terra">{money(max)}</p><p className="text-xs text-mute">Illustrative at 8% a year. Not a promise or advice.</p></div>
    <div className="panel flex h-48 items-end gap-1">{vals.map((v, i) => <div key={i} className="flex-1 rounded-t bg-terra transition-all" style={{ height: `${(v / max) * 100}%` }} />)}</div></div>);
}
export function Shop() {
  const [c, setC] = useState<Record<number, number>>({});
  const items = Object.entries(c).filter(([, q]) => q > 0); const total = items.reduce((s, [i, q]) => s + q * materials[+i][1], 0);
  const bump = (i: number, n: number) => setC((o) => ({ ...o, [i]: Math.max(0, (o[i] || 0) + n) }));
  return (<div className="grid gap-6 md:grid-cols-[1fr_320px]">
    <div className="space-y-3">{materials.map(([n, pr], i) => { const I = materialIcon(n); const q = c[i] || 0;
      return <div key={n} className={`panel flex items-center justify-between gap-3 !py-3 transition ${q ? "!border-terra/60 bg-white" : ""}`}>
        <div className="flex min-w-0 items-center gap-3.5">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition duration-300 ${q ? "bg-terra text-white" : "bg-ink text-sand"}`}><I width={32} height={32} /></span>
          <div className="min-w-0"><b className="block truncate">{n}</b><span className="text-xs text-mute">{money(pr)} each</span></div></div>
        <div className="flex shrink-0 items-center gap-2"><button className="btn !px-3" onClick={() => bump(i, -1)} aria-label={`Less ${n}`}>−</button><b className="w-6 text-center">{q}</b><button className="btn !px-3" onClick={() => bump(i, 1)} aria-label={`More ${n}`}>+</button></div></div>; })}</div>
    <aside className="panel h-fit md:sticky md:top-20"><h3 className="text-lg">Your quote request</h3>
      <div className="my-3 space-y-1 text-sm">{items.length ? items.map(([i, q]) => <div key={i} className="flex justify-between"><span>{q} × {materials[+i][0]}</span><b>{money(q * materials[+i][1])}</b></div>) : <span className="text-mute">Add items to build a quote.</span>}</div>
      {items.length > 0 && <div className="mb-3 flex justify-between border-t border-line pt-2"><b>Estimate</b><b>{money(total)}</b></div>}
      {items.length > 0 ? <Enquire type="quote" subject={`Materials quote, ${money(total)} estimate`} label="Request quote" className="btn-primary w-full" /> : <button disabled className="btn w-full opacity-50">Request quote</button>}
      {items.length > 0 && <a href={gmailLink(`Materials quote request, ${money(total)} estimate`, `Hello B B Homes,\n\nI would like a quote for:\n${items.map(([i, q]) => `- ${q} x ${materials[+i][0]} (${money(q * materials[+i][1])})`).join("\n")}\n\nEstimate: ${money(total)}\n\nName:\nPhone:\nDelivery location:`)} target="_blank" rel="noopener" className="btn mt-2 w-full"><Gmail width={20} height={20} />Email this list by Gmail</a>}
      <p className="mt-3 text-xs text-mute">For our own developments, external developers and homeowners. An agent applies wholesale pricing.</p></aside></div>);
}
export function ServiceForm() {
  const [ref, setRef] = useState(""), [svc, setSvc] = useState("Plumbing repair"), [err, setErr] = useState("");
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)); setErr("");
    const r = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, type: "service", subject: f.service }) }); const j = await r.json();
    if (!r.ok) return setErr(typeof j.error === "string" ? j.error : "We couldn't save your request.");
    setRef(j.ref);
  }
  return (<div className="grid gap-4 md:grid-cols-2">
    {ref ? (
      <div className="panel">
        <SentNotice
          title="Service request received."
          message={<>A coordinator will call the number you gave about {svc.toLowerCase()}. Nothing is booked or charged until you agree.</>}
          reference={ref}
        >
          <button className="btn mt-5 w-full" onClick={() => { setRef(""); setErr(""); }}>Send another request</button>
        </SentNotice>
      </div>
    ) : (
      <form onSubmit={go} className="panel space-y-3"><h3 className="text-lg">Request a service</h3>
        <input name="name" required autoComplete="name" placeholder="Your name" className="field" />
        <select name="service" value={svc} onChange={(e) => setSvc(e.target.value)} className="field">{["Plumbing repair", "Electrical fault", "Painting and renovation", "Property management", "Construction support"].map((s) => <option key={s}>{s}</option>)}</select>
        <select name="urgency" className="field"><option>Today</option><option>This week</option><option>Planned</option></select>
        <input name="phone" required placeholder="Phone number" inputMode="tel" autoComplete="tel" className="field" />
        <textarea name="message" rows={3} maxLength={2000} placeholder="What needs attention?" className="field resize-y" />
        {err && <p role="alert" className="text-sm text-terra">{err}</p>}<button className="btn-primary w-full">Submit request</button></form>
    )}
    <div className="panel"><h3 className="text-lg">What happens next</h3>
      <p className="mt-2 text-sm leading-6 text-mute">Every service request gets a reference. A coordinator calls you to confirm the scope, timing and price before any work starts.</p>
      {ref && <a href="/contact" className="btn mt-4">Contact the team</a>}</div></div>);
}
