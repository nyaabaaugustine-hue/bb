"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import Img from "./Img";
import Enquire from "./Enquire";
import { IMG, PHONE, PHONE_HREF } from "@/lib/data";
import { Arrow, Phone, Key, Land, Crane, Home as HomeIcon, Trend } from "./Icons";

const SLIDES = [
  { img: IMG.hero, alt: "A modern B B Homes house with a garden", eyebrow: "B B Homes · Ghana", title: "A home is a human right.", accent: "We build it.", text: "We don’t only sell you a house. We help you move through your housing journey, with the documents, the prices and a named agent in plain sight.", cta: ["Find your home", "#find"] },
  { img: IMG.land1, alt: "A surveyed plot of land", eyebrow: "Buy land", title: "Own your land.", accent: "Pay in stages.", text: "Plots with title documents shown upfront. Selected plots can be paid in stages, agreed in writing before you commit.", cta: ["See plots and land", "/homes"] },
  { img: IMG.build2, alt: "A house under construction", eyebrow: "Build-to-own", title: "Build your house,", accent: "phase by phase.", text: "Foundation, walls, roof, finish. Clear quotes, materials from our own depot, and you pay as each phase is done.", cta: ["Land and build", "/land-and-build"] },
  { img: IMG.model1, alt: "3D model of a standard home design", eyebrow: "Standard designs", title: "See it before", accent: "it is built.", text: "Choose a standard design, see the plan and the price, then build on your own land or ours.", cta: ["Explore designs", "/land-and-build"] },
  { img: IMG.village, alt: "A village landscape", eyebrow: "Invest", title: "Start with land.", accent: "Grow into rentals.", text: "Land banks, family compounds and rental starters across Accra, Kumasi and Tamale. Figures are illustrative, never promises.", cta: ["Investment options", "/invest"] },
] as const;
const journey = [["Rent", Key], ["Buy land", Land], ["Build", Crane], ["Buy house", HomeIcon], ["Invest", Trend]] as const;
const pad = (n: number) => String(n + 1).padStart(2, "0");

export default function HeroSlider() {
  const [i, setI] = useState(0); const [paused, setPaused] = useState(false); const [x0, setX0] = useState<number | null>(null);
  const go = useCallback((n: number) => setI((n + SLIDES.length) % SLIDES.length), []);
  const s = SLIDES[i];

  return (
    <section aria-roledescription="carousel" aria-label="Featured" className="relative isolate overflow-hidden bg-ink text-cream"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)} onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)} onFocus={(e) => e.target.matches(":focus-visible") && setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }}
      onTouchStart={(e) => setX0(e.touches[0].clientX)} onTouchEnd={(e) => { if (x0 !== null) { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); } setX0(null); }}>

      {/* Slides (images stay mounted so fades are smooth) */}
      {SLIDES.map((sl, n) => (
        <div key={sl.img} aria-hidden={n !== i} className={`absolute inset-0 -z-20 transition-opacity duration-1000 ${n === i ? "opacity-100" : "opacity-0"}`}>
          <div className={`absolute inset-0 ${n === i ? "kenburns" : ""}`}><Img id={sl.img} alt={n === i ? sl.alt : ""} priority={n === 0} sizes="100vw" /></div>
        </div>))}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/25" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-ink to-transparent" />

      <div className="wrap relative grid min-h-[40rem] items-center gap-10 !pb-28 !pt-36 md:min-h-[46rem] md:!pt-44 lg:grid-cols-[1.6fr_1fr]">
        <div aria-live={paused ? "polite" : "off"} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${SLIDES.length}`}>
          <div key={i} className="fade-in">
            <p className="eyebrow !text-sand">{s.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl leading-[1.08] md:text-6xl">{s.title} <span className="text-sand">{s.accent}</span></h1>
            <p className="mt-5 max-w-xl text-lg text-cream/80">{s.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={s.cta[1]} className="btn-primary btn-lg">{s.cta[0]} <Arrow width={18} height={18} /></Link>
            </div></div>
          <ol aria-label="Your housing journey" className="mt-10 hidden flex-wrap items-center gap-2 sm:flex">{journey.map(([j, Icon], n) => <li key={j} className="flex items-center gap-2"><span className="flex items-center gap-2 rounded-full border border-cream/20 bg-ink/50 px-4 py-2 text-sm backdrop-blur"><Icon width={16} height={16} className="text-sand" />{j}</span>{n < journey.length - 1 && <Arrow width={14} height={14} className="text-terra" />}</li>)}</ol>
        </div>

        <aside className="rounded-2xl border border-cream/15 bg-ink/60 p-6 shadow-2xl backdrop-blur-md"><p className="eyebrow !text-sand">Speak to an agent</p><p className="mt-2 font-serif text-2xl">Not sure where to start?</p><p className="mt-1 text-sm text-cream/70">Tell us your budget and timing. We reply on the channel you choose.</p>
          <a href={PHONE_HREF} className="mt-5 flex items-center gap-3 rounded-xl bg-cream/10 px-4 py-3 transition hover:bg-cream/20"><Phone width={20} height={20} className="text-sand" /><span><span className="block text-xs text-cream/60">Call us</span><b>{PHONE}</b></span></a>
          <Enquire subject="General enquiry" label="Or send a one-tap enquiry" className="btn mt-3 w-full border-cream/20 bg-transparent text-cream hover:bg-cream/10" /></aside>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 pb-6">
          <span className="hidden font-serif text-sm tabular-nums text-cream/80 sm:block"><b className="text-lg text-sand">{pad(i)}</b> / {pad(SLIDES.length - 1)}</span>
          <div className="flex flex-1 gap-2" role="tablist" aria-label="Choose slide">
            {SLIDES.map((sl, n) => (
              <button key={sl.img} role="tab" aria-selected={n === i} aria-label={`Slide ${n + 1}: ${sl.eyebrow}`} onClick={() => go(n)} className="group relative h-6 flex-1 max-w-24">
                <span className="absolute inset-x-0 top-1/2 block h-1 -translate-y-1/2 overflow-hidden rounded-full bg-cream/25 transition group-hover:bg-cream/40">
                  {n < i && <span className="block h-full w-full bg-sand" />}
                  {n === i && <span key={i} onAnimationEnd={() => go(i + 1)} className="slide-progress block h-full w-full bg-sand" style={{ animationPlayState: paused ? "paused" : "running" }} />}
                </span></button>))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(i - 1)} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 bg-ink/40 backdrop-blur transition hover:bg-cream hover:text-ink"><Arrow width={18} height={18} className="rotate-180" /></button>
            <button onClick={() => go(i + 1)} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 bg-ink/40 backdrop-blur transition hover:bg-cream hover:text-ink"><Arrow width={18} height={18} /></button>
          </div></div></div>
    </section>);
}
