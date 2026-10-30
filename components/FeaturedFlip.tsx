"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Img from "./Img";
import Enquire from "./Enquire";
import { Arrow, KIND_BADGE, Pause, Pin, Play } from "./Icons";
import { KIND_LABEL, Listing, NEXT, WHEN, money } from "@/lib/data";

const AUTO_MS = 7000;
const pad = (n: number) => String(n).padStart(2, "0");

export default function FeaturedFlip({ items }: { items: Listing[] }) {
  const [i, setI] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [manualPause, setManualPause] = useState(false);

  const go = useCallback((n: number) => {
    if (items.length > 1) setI(((n % items.length) + items.length) % items.length);
  }, [items.length]);

  const paused = hovered || manualPause;
  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = window.setTimeout(() => go(i + 1), AUTO_MS);
    return () => window.clearTimeout(timer);
  }, [i, paused, go, items.length]);

  if (!items.length) return null;
  const l = items[i];
  const nextL = items[(i + 1) % items.length];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="New and featured listings"
      className="mt-14 border-t border-line pt-10"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={(e) => e.target.matches(":focus-visible") && setHovered(true)}
      onBlur={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">New and featured</p>
          <h2 className="mt-1 max-w-xl text-2xl md:text-3xl">Fresh on the market right now</h2>
          <p className="mt-2 max-w-xl text-sm text-mute">This panel flips through our newest featured listings. It updates as soon as a new one is added.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 font-serif text-sm tabular-nums text-mute"><b className="text-lg text-ink">{pad(i + 1)}</b> / {pad(items.length)}</span>
          <button type="button" onClick={() => setManualPause((p) => !p)} aria-pressed={manualPause} aria-label={manualPause ? "Resume rotating featured listings" : "Pause rotating featured listings"} className="btn h-10 w-10 !p-0">
            {manualPause ? <Play width={16} height={16} /> : <Pause width={16} height={16} />}
          </button>
          <button type="button" onClick={() => go(i - 1)} aria-label="Previous featured listing" className="btn h-10 w-10 !p-0"><Arrow width={18} height={18} className="rotate-180" /></button>
          <button type="button" onClick={() => go(i + 1)} aria-label="Next featured listing" className="btn h-10 w-10 !p-0"><Arrow width={18} height={18} /></button>
        </div>
      </div>

      <div className="panel mt-6 overflow-hidden !p-0">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="feature-flip relative aspect-[4/3] overflow-hidden bg-sand/30 lg:aspect-auto lg:min-h-[23rem]">
            <div key={i} className="feature-flip-in absolute inset-0">
              <Link href={`/homes/${l.slug}`} aria-label={`${l.title}, ${money(l.price)}`} className="block h-full w-full">
                <Img id={l.img} alt="" sizes="(min-width:1024px) 560px, 100vw" />
              </Link>
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0"><Img id={nextL.img} alt="" sizes="(min-width:1024px) 560px, 100vw" /></div>
            <span className={`${KIND_BADGE[l.kind]} absolute left-3 top-3 bg-card/95`}>{KIND_LABEL[l.kind]}</span>
            <span className="badge absolute right-3 top-3 border-terra/30 bg-card/95 text-terra">Featured</span>
          </div>

          <div key={`copy-${i}`} className="fade-in flex flex-col justify-center gap-4 p-6 sm:p-8">
            <span className="badge w-fit border-line bg-sand/30 text-mute">{WHEN[l.when]} · {l.zone}</span>
            <h3 className="text-2xl leading-snug"><Link href={`/homes/${l.slug}`} className="transition hover:text-terra">{l.title}</Link></h3>
            <p className="flex items-center gap-1 text-sm text-mute"><Pin width={14} height={14} />{l.note}</p>
            <p className="flex items-baseline gap-1"><span className="font-serif text-3xl font-bold">{money(l.price)}</span>{l.kind === "rent" && <span className="text-sm text-mute">/ month</span>}</p>
            <p className="rounded-xl border border-line bg-sand/25 p-4 text-sm leading-6"><b className="text-ink">What happens next.</b> {NEXT[l.kind]}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Link href={`/homes/${l.slug}`} className="btn flex-1">View details</Link>
              <Enquire subject={l.title} className="btn-primary flex-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose a featured listing">
        {items.map((it, n) => (
          <button key={it.slug} type="button" onClick={() => go(n)} aria-current={n === i ? "true" : undefined} aria-label={`Show ${it.title}`} className={`badge max-w-full transition ${n === i ? "border-terra bg-terra/10 text-terra" : "border-line bg-card text-mute hover:border-ink/30 hover:text-ink"}`}>
            <span aria-hidden className="tabular-nums">{pad(n + 1)}</span>
            <span className="max-w-[9rem] truncate sm:max-w-none">{it.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
