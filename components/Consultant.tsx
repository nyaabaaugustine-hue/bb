"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { listings, commit, money, PHONE, PHONE_HREF, gmailLink, aiBadgeUrl } from "@/lib/data";
import { Close, Arrow, Gmail } from "./Icons"; import { logoUrl } from "@/lib/data";

/* ---------- Types and helpers ---------- */
type L = { label: string; href: string; ext?: boolean };
type Msg = { id: number; from: "bot" | "me"; text: string; links?: L[]; live?: boolean };

const STORE = "bb-consultant";
const read = (k: string) => { try { return sessionStorage.getItem(`${STORE}:${k}`); } catch { return null; } };
const write = (k: string, v: string) => { try { sessionStorage.setItem(`${STORE}:${k}`, v); } catch { /* storage unavailable */ } };

const call: L = { label: `Call ${PHONE}`, href: PHONE_HREF, ext: true };
const mail = (subject?: string): L => ({ label: "Email us by Gmail", href: gmailLink(subject), ext: true });

const CHIPS = ["Find a home", "Buy land", "Build a house", "Invest", "Payment plans", "Talk to a human"];
const INTRO = "Hi, I'm the B B Homes assistant, your online consultant. I can help you find a home, land or a build plan, and pass you to a human agent whenever you like.";

/** Pulls a cedi budget out of free text: "300k", "GHS 250,000", "1.2m". */
function budget(t: string): number | null {
  const m = t.toLowerCase().replace(/ghs|cedis?|ghc|₵/g, "").match(/(\d[\d,]*\.?\d*)\s*(k|thousand|m|million)?/);
  if (!m) return null;
  let n = parseFloat(m[1].replace(/,/g, "")); if (!isFinite(n)) return null;
  const u = m[2]; if (u === "k" || u === "thousand") n *= 1e3; else if (u === "m" || u === "million") n *= 1e6;
  return n >= 1000 ? n : null;
}

function answer(raw: string): { text: string; links?: L[] } {
  const t = raw.toLowerCase().trim();
  const amt = budget(t);
  if (amt) {
    const hits = listings.filter((l) => commit(l) <= amt).sort((a, b) => b.price - a.price).slice(0, 3);
    return hits.length
      ? { text: `With about ${money(amt)}, these are options you can look at right now. Rentals are counted as a year of rent. An agent confirms the real plan.`, links: [...hits.map((l) => ({ label: `${l.title} · ${money(l.price)}${l.kind === "rent" ? "/mo" : ""}`, href: `/homes/${l.slug}` })), { label: "See everything in the finder", href: "/homes" }] }
      : { text: `I don't see a listing under ${money(amt)} yet. Try a later horizon in the finder, or an agent may know what is coming up.`, links: [{ label: "Open the finder", href: "/homes" }, mail("My budget is " + money(amt))] };
  }
  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(t)) return { text: "Hello! Are you looking to rent, buy land, build, buy a house, or invest? You can also type a budget, like “300k”, and I'll show what fits." };
  if (/human|agent|person|someone|call|phone|whatsapp|talk|speak|number|contact/.test(t)) return { text: "Of course. A named agent will reply on the channel you prefer. You can also tap the green WhatsApp button at the bottom right.", links: [mail("I'd like to speak to an agent"), call, { label: "Send a one-tap enquiry", href: "/contact" }] };
  if (/rent|rental|lease|tenant|stay/.test(t)) return { text: "We have managed rentals and medium stays. Use the finder to filter by city and budget, and pick “Now” if you need to move in soon.", links: [{ label: "Browse rentals and homes", href: "/homes" }] };
  if (/land|plot|acre|title/.test(t) && !/build|construct/.test(t)) return { text: "Our plots show title documents upfront, and some can be paid in stages. We encourage you to verify documents, including with your own lawyer, before any payment.", links: [{ label: "See plots and land", href: "/homes" }, { label: "Land and build pathways", href: "/land-and-build" }] };
  if (/build|construct|design|phase|foundation|roof/.test(t)) return { text: "You can build on land you own or buy a land and house package. Builds are done in four phases (foundation, walls, roof, finish), and you pay phase by phase.", links: [{ label: "Land and build", href: "/land-and-build" }, { label: "Materials shop", href: "/materials" }] };
  if (/invest|return|portfolio|rental income|profit|roi/.test(t)) return { text: "You can start with land and grow into rentals. The calculators are illustrative only. They are not advice or a promise of returns.", links: [{ label: "Investment options", href: "/invest" }] };
  if (/pay|stage|instal|deposit|mobile money|momo|plan|afford/.test(t)) return { text: "On selected plots and build-to-own homes you can pay in stages. A written payment plan is agreed before you commit. No payment is taken through this website.", links: [{ label: "Try the affordability calculator", href: "/land-and-build" }, mail("Payment plan enquiry")] };
  if (/document|legal|genuine|verify|safe|trust|scam|lawyer/.test(t)) return { text: "Fair question. We show title and site documents before you pay, you can book a site visit, and you are free to verify everything independently. Nothing is hidden.", links: [{ label: "About and trust", href: "/about" }] };
  if (/cement|steel|tile|paint|material|supply|hardware|quote/.test(t)) return { text: "Our materials shop lets you build a list, see an estimate and request a quote. Agents apply wholesale pricing for projects.", links: [{ label: "Open materials shop", href: "/materials" }] };
  if (/repair|maint|plumb|electric|renovat|manage|service|fix/.test(t)) return { text: "Our home services team covers management, maintenance, repairs and renovation. Every request gets a reference and a visible status.", links: [{ label: "Request a service", href: "/services" }] };
  if (/where|location|address|visit|office|map|direction|tamale|accra|kumasi/.test(t)) return { text: "We are in Tamale, near Aliu Mahama Sports Stadium, and we serve Accra, Kumasi and Tamale. Book a site visit and we will meet you there.", links: [{ label: "See the map", href: "/contact" }, mail("Site visit request")] };
  if (/home|house|buy|apartment|flat|bed|off-?plan|find|looking/.test(t)) return { text: "Tell me a rough budget (for example “250k”) and I'll show what fits. Or use the finder to filter by city, budget and timing.", links: [{ label: "Open the finder", href: "/homes" }] };
  if (/thank|thanks|great|ok(ay)?|cool/.test(t)) return { text: "You're welcome! If you'd like a human to take it from here, I can connect you by email, or you can tap the green WhatsApp button.", links: [mail()] };
  return { text: "I'm an automated assistant, so I may miss some questions. I can help with homes, land, building, investing and payment plans, or connect you to a person.", links: [mail("I have a question")] };
}

/* ---------- UI pieces ---------- */
const Bot = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <rect x="4" y="8" width="16" height="11" rx="4" /><path d="M12 8V5M9.5 13v1.5M14.5 13v1.5" /><circle cx="12" cy="4" r="1" fill="currentColor" /></svg>);
const Dots = () => (<span className="inline-flex items-center gap-1" role="status" aria-label="Assistant is typing">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-mute/70" style={{ animationDelay: `${i * 140}ms` }} />)}</span>);

/** Reveals text character by character, like live typing. */
function Typed({ text, live, onTick, onDone }: { text: string; live?: boolean; onTick?: () => void; onDone?: () => void }) {
  const [n, setN] = useState(live ? 0 : text.length);
  useEffect(() => {
    if (!live) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(text.length); onDone?.(); return; }
    let i = 0; const id = setInterval(() => { i += 2; setN(i); onTick?.(); if (i >= text.length) { clearInterval(id); setN(text.length); onDone?.(); } }, 18);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, live]);
  return <>{text.slice(0, n)}{n < text.length && <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-ink/60 align-middle" />}</>;
}

/* ---------- Main component ---------- */
export default function Consultant() {
  const [open, setOpen] = useState(false); const [badgeOk, setBadgeOk] = useState(true);
  const [teaser, setTeaser] = useState<"off" | "typing" | "shown">("off");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());
  const id = useRef(0); const box = useRef<HTMLDivElement>(null); const inputRef = useRef<HTMLInputElement>(null);
  const queue = useRef<Promise<void>>(Promise.resolve()); const started = useRef(false); const openRef = useRef(false);
  openRef.current = open;

  const scroll = useCallback(() => { const b = box.current; if (b) b.scrollTop = b.scrollHeight; }, []);
  useEffect(scroll, [msgs, typing, scroll]);

  /** Queue a bot reply: show typing dots, then type the message out. Replies never overlap. */
  const say = useCallback((text: string, links?: L[]) => {
    queue.current = queue.current.then(() => new Promise<void>((res) => {
      setTyping(true);
      setTimeout(() => { setTyping(false); const m: Msg = { id: ++id.current, from: "bot", text, links, live: true }; setMsgs((x) => [...x, m]); setTimeout(res, Math.min(text.length * 9 + 250, 1800)); }, 650 + Math.min(text.length * 7, 1100));
    }));
  }, []);

  const send = useCallback((text: string) => {
    const t = text.trim(); if (!t) return;
    setMsgs((x) => [...x, { id: ++id.current, from: "me", text: t }]); setInput("");
    const a = answer(t); say(a.text, a.links);
  }, [say]);

  // First open: introduce itself.
  useEffect(() => {
    if (!open || started.current) return; started.current = true;
    say(INTRO); say("What are you looking for today? Pick an option or type a budget like “300k”.");
    if (window.matchMedia("(min-width: 640px)").matches) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open, say]);

  // Pop up once in a while (max 3 times a session) while the chat is closed.
  useEffect(() => {
    if (read("dismissed")) return;
    let count = Number(read("pops") ?? 0); const timers: ReturnType<typeof setTimeout>[] = [];
    const pop = () => {
      if (count >= 3 || read("dismissed")) return;
      timers.push(setTimeout(pop, 70000));
      if (openRef.current || document.documentElement.dataset.newsletter) return; // wait while the newsletter popup is showing
      count++; write("pops", String(count)); setTeaser("typing");
      timers.push(setTimeout(() => setTeaser("shown"), 1900));
      timers.push(setTimeout(() => setTeaser("off"), 1900 + 11000));
    };
    timers.push(setTimeout(pop, 7000));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => { if (open) setTeaser("off"); }, [open]);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [open]);

  const dismissTeaser = () => { setTeaser("off"); write("dismissed", "1"); };
  const showChips = !typing && msgs.length > 0 && msgs[msgs.length - 1].from === "bot" && doneIds.has(msgs[msgs.length - 1].id);

  return (<>
    {/* Teaser bubble */}
    {!open && teaser !== "off" && (
      <div className="pop-in fixed bottom-[calc(24rem_+_env(safe-area-inset-bottom))] right-4 z-40 w-[min(20rem,calc(100vw-2rem))] sm:bottom-[calc(26rem_+_env(safe-area-inset-bottom))] sm:right-5">
        <div className="relative rounded-2xl rounded-br-md border border-line bg-card p-4 pr-9 shadow-2xl">
          <button onClick={dismissTeaser} aria-label="Dismiss" className="absolute right-2 top-2 rounded-md p-1 text-mute hover:bg-ink/5"><Close width={14} height={14} /></button>
          <button onClick={() => setOpen(true)} className="block w-full text-left text-sm">
            <b className="mb-0.5 block text-xs text-terra">B B Homes assistant · online</b>
            {teaser === "typing" ? <Dots /> : <span>Hi, I'm your online consultant. Looking for a home, land or a build plan? I can help you in a minute.</span>}
          </button></div></div>)}

    {/* Chat panel */}
    {open && (
      <div role="dialog" aria-label="Chat with the B B Homes assistant" className="pop-in fixed bottom-[calc(24rem_+_env(safe-area-inset-bottom))] right-4 z-50 flex max-h-[min(34rem,calc(100dvh_-_25.5rem_-_env(safe-area-inset-bottom)))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl sm:bottom-[calc(26rem_+_env(safe-area-inset-bottom))] sm:right-5 sm:max-h-[min(34rem,calc(100dvh_-_27.5rem_-_env(safe-area-inset-bottom)))]">
        <header className="relative flex items-center gap-3 overflow-hidden bg-ink px-4 py-3 text-cream">
          <div aria-hidden className="absolute -right-6 -top-10 h-24 w-24 rounded-full bg-terra/40 blur-2xl" />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-cream p-1.5">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={logoUrl(28)} alt="B B Homes" style={{ borderRadius: "6%" }} className="max-h-full max-w-full object-contain" /><span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink bg-[#25D366]" /></span>
          <div className="relative min-w-0 flex-1"><p className="truncate font-semibold leading-tight">B B Homes assistant</p><p className="text-xs text-cream/70">Online consultant · automated</p></div>
          <button onClick={() => setOpen(false)} aria-label="Minimise chat" className="relative rounded-lg p-1.5 text-cream/80 hover:bg-cream/10 hover:text-cream"><Close width={18} height={18} /></button>
        </header>

        <div ref={box} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-cream/50 px-4 py-4">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] text-sm leading-relaxed ${m.from === "me" ? "rounded-2xl rounded-br-md bg-terra px-3.5 py-2 text-white" : "rounded-2xl rounded-bl-md border border-line bg-white px-3.5 py-2.5 shadow-sm"}`}>
                {m.from === "bot" ? <Typed text={m.text} live={m.live} onTick={scroll} onDone={() => { setDoneIds((s) => new Set(s).add(m.id)); scroll(); }} /> : m.text}
                {m.links && doneIds.has(m.id) && (
                  <div className="fade-in mt-3 flex flex-col gap-1.5">{m.links.map((l) => {
                    const cls = "";
                    const inner = <>{l.href.includes("mail.google.com") && <Gmail width={16} height={16} />}<span className="truncate">{l.label}</span>{!l.href.includes("mail.google.com") && <Arrow width={14} height={14} className="shrink-0" />}</>;
                    return l.ext ? <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className={`btn !justify-between !px-3 !py-2 text-xs ${cls}`}>{inner}</a>
                      : <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className={`btn !justify-between !px-3 !py-2 text-xs ${cls}`}>{inner}</Link>; })}</div>)}
              </div></div>))}
          {typing && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 shadow-sm"><Dots /></div></div>}
          {showChips && <div className="fade-in flex flex-wrap gap-2 pt-1">{CHIPS.map((c) => <button key={c} onClick={() => send(c)} className="rounded-full border border-terra/40 bg-card px-3 py-1.5 text-xs font-semibold text-terra transition hover:bg-terra hover:text-white">{c}</button>)}</div>}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-line bg-card p-3">
          <label htmlFor="bb-chat-input" className="sr-only">Type your message</label>
          <input id="bb-chat-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question or type a budget…" autoComplete="off" className="field !py-2.5" />
          <button type="submit" disabled={!input.trim()} aria-label="Send message" className="btn-primary !px-3 !py-2.5"><Arrow width={18} height={18} /></button>
        </form>
        <p className="border-t border-line bg-card px-4 pb-2.5 pt-1.5 text-center text-[11px] text-mute">Automated assistant. For advice or payment plans, an agent will confirm.</p>
      </div>)}

    {/* Floating button: the B B Homes badge sits at the top of the right-hand dock, directly above the Gmail icon */}
    <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Close chat" : "Chat with our online consultant"} aria-expanded={open}
      className="group fixed bottom-[calc(18.25rem_+_env(safe-area-inset-bottom))] right-4 z-40 flex h-20 w-20 items-center justify-center rounded-full transition duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 sm:bottom-[calc(19.25rem_+_env(safe-area-inset-bottom))] sm:right-5 sm:h-24 sm:w-24">
      {!open && teaser !== "off" && <span aria-hidden className="absolute inset-2 -z-10 animate-ping rounded-full bg-sand/60 [animation-duration:2s]" />}
      {badgeOk
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={aiBadgeUrl(288)} alt="" draggable={false} onError={() => setBadgeOk(false)} className={`h-full w-full object-contain drop-shadow-[0_8px_14px_rgba(24,38,31,.35)] ${open ? "" : "float-soft"}`} />
        : <span className="flex h-full w-full items-center justify-center rounded-full bg-ink text-sand shadow-xl ring-1 ring-cream/20"><Bot className="h-9 w-9" /></span>}
      {open && <span aria-hidden className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sand shadow-lg ring-2 ring-cream"><Close width={14} height={14} /></span>}
      {!open && <span aria-hidden className="absolute right-2 top-3 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#25D366] shadow" />}
      <span className="sr-only">{open ? "Close chat" : "Ask us"}</span>
    </button>
  </>);
}
