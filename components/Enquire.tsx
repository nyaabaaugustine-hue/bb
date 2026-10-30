"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { enquiryChannelLabels, enquiryChannels, type EnquiryChannel } from "@/lib/portal-domain";
import { Close, Gmail, Phone, WhatsApp } from "./Icons";
import SentNotice from "./SentNotice";

const channelIcons = { whatsapp: WhatsApp, phone: Phone, email: Gmail } as const;
const channelLabels = { whatsapp: "WhatsApp", phone: "Call", email: "Email" } as const;

export default function Enquire({ subject, label = "Enquire", type = "enquiry", className = "btn-primary" }: { subject: string; label?: string; type?: string; className?: string }) {
  const [open, setOpen] = useState(false); const [ref, setRef] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [channel, setChannel] = useState<EnquiryChannel>("whatsapp");
  const [mounted, setMounted] = useState(false);
  const titleId = useId(); const trigger = useRef<HTMLButtonElement>(null); const box = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  // Escape to close, lock page scroll, focus the first field, trap Tab, and return focus on close.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    const t = trigger.current;
    box.current?.querySelector<HTMLElement>("input, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !box.current) return;
      const f = box.current.querySelectorAll<HTMLElement>("button, input, select, a[href]");
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; t?.focus(); };
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const f = Object.fromEntries(new FormData(e.currentTarget));
      const r = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, subject, type }) });
      const j = await r.json();
      if (!r.ok) setErr(j.error ?? "Something went wrong. Please try again."); else setRef(j.ref);
    } catch { setErr("Network problem. Please check your connection and try again."); }
    setBusy(false);
  }

  return (<>
    <button ref={trigger} className={className} onClick={() => { setOpen(true); setRef(""); setErr(""); }}>{label}</button>
    {open && mounted && createPortal(
      <div className="overlay-in fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
        <div ref={box} role="dialog" aria-modal="true" aria-labelledby={titleId} className="panel pop-in relative w-full max-w-sm !p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="btn-ghost absolute right-3 top-3 !p-1.5"><Close width={18} height={18} /></button>
          {ref ? (
            <SentNotice
              title="Your enquiry is with our team."
              titleId={titleId}
              message={`A named agent will reply on ${enquiryChannelLabels[channel].toLowerCase()}. Keep your reference handy.`}
              reference={ref}
            >
              <div className="mt-5 grid gap-2">
                <button className="btn-primary w-full" onClick={() => setOpen(false)}>Done</button>
                <button className="btn w-full" onClick={() => { setRef(""); setErr(""); }}>Send another enquiry</button>
              </div>
            </SentNotice>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="eyebrow">One-tap enquiry</p>
              <h3 id={titleId} className="!mt-1 mb-3 pr-8 text-lg leading-snug">{subject}</h3>
              <p className="text-xs font-semibold uppercase tracking-wide text-mute">Leave your details</p>
              <div><label htmlFor={`${titleId}-n`} className="label">Your name</label><input id={`${titleId}-n`} name="name" required autoComplete="name" placeholder="Ama Mensah" className="field" /></div>
              <div><label htmlFor={`${titleId}-p`} className="label">Phone number</label><input id={`${titleId}-p`} name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="024 000 0000" className="field" /></div>
              <div><label htmlFor={`${titleId}-e`} className="label">Email <span className="font-normal text-mute">({channel === "email" ? "required" : "optional"})</span></label><input id={`${titleId}-e`} name="email" type="email" required={channel === "email"} autoComplete="email" placeholder="you@example.com" className="field" /></div>
              <fieldset>
                <legend className="label">Reply by</legend>
                <div className="grid grid-cols-3 gap-2">
                  {enquiryChannels.map((value) => {
                    const Icon = channelIcons[value];
                    const active = channel === value;
                    return (
                      <label
                        key={value}
                        className={`flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition focus-within:ring-2 focus-within:ring-terra focus-within:ring-offset-1 ${
                          active ? "border-terra bg-terra/10 text-ink" : "border-line bg-card text-mute hover:border-ink/30 hover:text-ink"
                        }`}
                      >
                        <input type="radio" name="channel" value={value} checked={active} onChange={() => setChannel(value)} className="sr-only" />
                        <Icon width={18} height={18} className={value === "whatsapp" ? "text-[#25D366]" : value === "phone" ? "text-terra" : ""} />
                        {channelLabels[value]}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {err && <p role="alert" className="rounded-lg bg-terra/10 px-3 py-2 text-sm text-terra">{err}</p>}
              <button disabled={busy} className="btn-primary w-full !py-3">{busy ? "Sending…" : "Send enquiry"}</button>
            </form>
          )}
        </div>
      </div>, document.body)}
  </>);
}
