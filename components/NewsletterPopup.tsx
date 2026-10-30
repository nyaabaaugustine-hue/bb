"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Img from "./Img"; import Logo from "./Logo";
import { IMG } from "@/lib/data";
import { NEWSLETTER_EVENT } from "@/lib/newsletter";
import SentNotice from "./SentNotice";
import { Close, Check, Phone, Shield } from "./Icons";

const KEY = "bb-newsletter-v3";
const DISMISSED_KEY = `${KEY}:dismissed`;
const DELAY = 900;
const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const set = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* storage unavailable */ } };
const wasDismissed = () => { try { return sessionStorage.getItem(DISMISSED_KEY) === "1"; } catch { return false; } };
const dismissForSession = () => { try { sessionStorage.setItem(DISMISSED_KEY, "1"); } catch { /* storage unavailable */ } };

const Mail = (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const id = useId(); const box = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Show shortly after load. A dismissal lasts for this tab's session; subscriptions persist.
  // Add ?newsletter=1 to the URL to force it while testing.
  useEffect(() => {
    const portalPath = pathname === "/auth" || pathname === "/login" || pathname === "/register"
      || pathname === "/account" || pathname.startsWith("/account/")
      || pathname === "/admin" || pathname.startsWith("/admin/");
    const force = new URLSearchParams(window.location.search).has("newsletter");
    const v = get();
    const blocked = portalPath || (!force && (v === "subscribed" || wasDismissed()));
    const reopen = () => setOpen(true);
    window.addEventListener(NEWSLETTER_EVENT, reopen);
    if (portalPath) setOpen(false);
    if (blocked) return () => window.removeEventListener(NEWSLETTER_EVENT, reopen);
    let fired = false;
    const show = () => { if (fired) return; fired = true; cleanup(); setOpen(true); };
    const t = setTimeout(show, force ? 400 : DELAY);
    function cleanup() { clearTimeout(t); }
    return () => { cleanup(); window.removeEventListener(NEWSLETTER_EVENT, reopen); };
  }, [pathname]);

  const close = () => { setOpen(false); if (get() !== "subscribed") dismissForSession(); };

  // Escape, focus trap, scroll lock. Tells the chat assistant to wait while this is open.
  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.newsletter = "open";
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    box.current?.querySelector<HTMLElement>("input[type=email]")?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !box.current) return;
      const f = box.current.querySelectorAll<HTMLElement>("button, input:not([tabindex='-1']), a[href]"); if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; delete document.documentElement.dataset.newsletter; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), phone: f.get("phone"), company: f.get("company"), consent: f.get("consent") === "on" }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) setErr(j.error ?? "Something went wrong. Please try again."); else { set("subscribed"); setDone(true); }
    } catch { setErr("Network problem. Please check your connection and try again."); }
    setBusy(false);
  }

  if (!open) return null;
  return createPortal(
    <div className="overlay-in fixed inset-0 z-[70] flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={close}>
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby={`${id}-t`} onClick={(e) => e.stopPropagation()}
        className="pop-in relative grid max-h-[100dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl md:grid-cols-[1fr_1.1fr] md:overflow-hidden">
        <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 z-10 rounded-full bg-card/90 p-2 text-ink shadow transition hover:bg-white md:bg-transparent md:shadow-none md:hover:bg-ink/5"><Close width={18} height={18} /></button>

        {/* Image side */}
        <div className="relative isolate hidden min-h-[30rem] overflow-hidden bg-ink md:block">
          <Img id={IMG.model2} alt="3D model of a modern house" priority sizes="400px" className="-z-10" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
          <Logo height={40} plate className="absolute left-5 top-5" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
            <span className="badge border-sand/40 bg-sand/20 text-sand backdrop-blur">Ghana real estate</span>
            <p className="mt-3 font-serif text-2xl leading-tight">Be first to hear about new homes, plots and deals.</p>
            <ul className="mt-4 space-y-2 text-sm text-cream/85">{["New listings in Accra, Kumasi and Tamale", "Plots and staged-payment offers", "Building and investment tips"].map((t) => <li key={t} className="flex items-center gap-2"><Check width={16} height={16} className="shrink-0 text-sand" strokeWidth={2.5} />{t}</li>)}</ul>
          </div>
        </div>

        {/* Form side */}
        <div className="p-6 sm:p-8">
          {/* Compact image on phones */}
          <div className="relative -mx-6 -mt-6 mb-5 h-36 overflow-hidden md:hidden"><Img id={IMG.model2} alt="" sizes="100vw" /><div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card to-transparent" /><Logo height={32} plate className="absolute left-4 top-4" /></div>
          {done ? (
            <SentNotice
              title="You're on the list."
              titleId={`${id}-t`}
              message="Thank you. New Ghana real estate deals will land in your inbox. You can opt out at any time."
            >
              <button onClick={() => setOpen(false)} className="btn-primary btn-lg mt-6 w-full">Continue browsing</button>
            </SentNotice>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <div><p className="eyebrow">Free deal alerts</p>
                <h2 id={`${id}-t`} className="mt-1 text-2xl leading-tight sm:text-3xl">Get Ghana real estate deals first</h2>
                <p className="mt-2 text-sm text-mute">Join our list for new homes, plots and offers, sent to your inbox.</p></div>
              <div><label htmlFor={`${id}-e`} className="label">Email address</label>
                <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" /><input id={`${id}-e`} name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="field !pl-10" /></div></div>
              <div><label htmlFor={`${id}-p`} className="label">Phone number</label>
                <div className="relative"><Phone width={18} height={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" /><input id={`${id}-p`} name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="054 198 8383" className="field !pl-10" /></div></div>
              {/* Honeypot: hidden from people, bots fill it */}
              <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <label className="flex cursor-pointer items-start gap-2.5 text-xs text-mute"><input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-terra" />I agree to receive real estate updates from B B Homes by email. I can unsubscribe at any time.</label>
              {err && <p role="alert" className="rounded-lg bg-terra/10 px-3 py-2 text-sm text-terra">{err}</p>}
              <button disabled={busy} className="btn-primary btn-lg w-full">{busy ? "Subscribing…" : "Send me the deals"}</button>
              <div className="flex items-center justify-between gap-3 text-xs text-mute"><span className="flex items-center gap-1.5"><Shield width={14} height={14} className="text-moss" />No spam. Your details stay private.</span><button type="button" onClick={close} className="font-semibold underline-offset-2 hover:text-ink hover:underline">No thanks</button></div>
            </form>)}
        </div>
      </div>
    </div>, document.body);
}
