import Link from "next/link"; import Finder from "@/components/Finder"; import Img from "@/components/Img"; import Enquire from "@/components/Enquire";
import Team from "@/components/Team"; import MapEmbed from "@/components/MapEmbed"; import HeroSlider from "@/components/HeroSlider"; import Offers from "@/components/Offers";
import { listings, IMG, PROMISES, STEPS, FAQ } from "@/lib/data";
import { Arrow, Shield, Check } from "@/components/Icons";
const doors = [
  ["Find a home", "Rent, buy, land or off-plan, matched to place, budget and timing.", "/homes", IMG.hero],
  ["Build and supply", "Build-to-own, standard designs and a building materials shop.", "/land-and-build", IMG.build2],
  ["Care for it", "Management, maintenance and renovation after move-in.", "/services", IMG.home2],
] as const;
const flywheel = ["Land", "Development", "Building materials", "Affordable homes", "Sales and rentals", "Property management", "Home services", "Referrals and repeat business"];
export default function Home() {
  return (<>
    {/* HERO SLIDER */}
    <HeroSlider />

    {/* TRUST STRIP */}
    <section aria-label="Our commitments" className="border-b border-line bg-card"><ul className="mx-auto grid max-w-6xl gap-x-6 gap-y-3 px-5 py-5 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-4">{PROMISES.map(([t]) => <li key={t} className="flex items-center gap-2"><Shield width={18} height={18} className="shrink-0 text-moss" />{t}</li>)}</ul></section>

    {/* FINDER */}
    <section id="find" className="wrap scroll-mt-28"><p className="eyebrow">Find your home</p><h2 className="mb-6 mt-1 max-w-2xl text-2xl md:text-3xl">Where do you want to live, what can you afford, and when do you need it?</h2><Finder listings={listings} /></section>

    {/* ALL OFFERS */}
    <section id="offers" className="wrap !pt-4 scroll-mt-28"><p className="eyebrow">Our offers</p><h2 className="mb-6 mt-1 max-w-2xl text-2xl md:text-3xl">Rent, buy, build or invest. Every offer in one place.</h2><Offers /></section>

    {/* THREE DOORS */}
    <section className="wrap !pt-4"><h2 className="mb-6 text-2xl md:text-3xl">One website, three doors</h2><div className="grid gap-5 md:grid-cols-3">{doors.map(([t, d, h, img]) => <Link key={t} href={h} className="panel-hover group overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <span className="relative block aspect-[16/10] overflow-hidden"><Img id={img} alt="" sizes="(min-width:768px) 33vw, 100vw" className="transition duration-500 group-hover:scale-105" /></span>
      <span className="block p-5"><b className="text-lg">{t}</b><span className="mt-1 block text-sm text-mute">{d}</span><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-terra">Explore <Arrow width={16} height={16} className="transition group-hover:translate-x-1" /></span></span></Link>)}</div></section>

    {/* WHY TRUST US */}
    <section className="bg-ink text-cream"><div className="wrap grid items-center gap-10 lg:grid-cols-2">
      <div><p className="eyebrow !text-sand">Why people trust B B Homes</p><h2 className="mt-1 text-2xl md:text-4xl">Nothing hidden. Everything you can check.</h2>
        <p className="mt-3 max-w-lg text-cream/75">Buying land or a home is the biggest decision many families make. We show you the paperwork and the price first, and we put a name behind every reply.</p>
        <ul className="mt-6 space-y-4">{PROMISES.map(([t, d]) => <li key={t} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand text-ink"><Check width={14} height={14} strokeWidth={3} /></span><span><b>{t}</b><span className="block text-sm text-cream/70">{d}</span></span></li>)}</ul></div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-cream/10"><Img id={IMG.land1} alt="Surveyed land plot ready for building" sizes="(min-width:1024px) 50vw, 100vw" /></div>
    </div></section>

    {/* HOW IT WORKS */}
    <section className="wrap"><p className="eyebrow">How it works</p><h2 className="mb-8 mt-1 text-2xl md:text-3xl">From first question to the front door</h2>
      <ol className="grid gap-5 md:grid-cols-5">{STEPS.map(([t, d], i) => <li key={t} className="relative"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-terra font-serif text-lg font-bold text-white shadow">{i + 1}</span>
        {i < STEPS.length - 1 && <span aria-hidden className="absolute left-12 top-5 hidden h-px w-[calc(100%-2rem)] bg-line md:block" />}
        <b className="mt-3 block">{t}</b><p className="mt-1 text-sm text-mute">{d}</p></li>)}</ol></section>

    {/* FLYWHEEL */}
    <section className="wrap !pt-0"><p className="eyebrow">How it fits together</p><h2 className="mb-6 mt-1 text-2xl md:text-3xl">One customer, many steps, one relationship</h2><ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{flywheel.map((f, i) => <li key={f} className="panel panel-hover !p-4"><span className="font-serif text-2xl text-terra/80">{String(i + 1).padStart(2, "0")}</span><p className="mt-1 text-sm font-semibold">{f}</p></li>)}</ol></section>

    {/* TEAM */}
    <section className="wrap !pt-0"><p className="eyebrow">Our team</p><h2 className="mb-2 mt-1 text-2xl md:text-3xl">The people behind your home</h2><p className="mb-8 max-w-2xl text-mute">Four teams, one promise: a named person answers you, and nothing is hidden. Email any team directly.</p><Team /></section>

    {/* MAP */}
    <section className="wrap !pt-0"><p className="eyebrow">Find us</p><h2 className="mb-6 mt-1 text-2xl md:text-3xl">Come and see us, and see the sites</h2><MapEmbed /></section>

    {/* FAQ */}
    <section className="wrap !pt-0"><div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]"><div><p className="eyebrow">Questions</p><h2 className="mt-1 text-2xl md:text-3xl">Straight answers</h2><p className="mt-3 text-mute">Can’t see yours? Ask an agent. We’d rather you ask than guess.</p></div>
      <div className="divide-y divide-line rounded-xl border border-line bg-card shadow-sm">{FAQ.map(([q, a]) => <details key={q} className="group p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">{q}<span aria-hidden className="text-xl text-terra transition group-open:rotate-45">+</span></summary><p className="mt-3 text-sm text-mute">{a}</p></details>)}</div></div></section>

    {/* CTA */}
    <section className="wrap !pt-0"><div className="relative isolate overflow-hidden rounded-2xl bg-ink px-6 py-12 text-center text-cream md:py-16">
      <Img id={IMG.village} alt="" sizes="100vw" className="-z-20 opacity-30" /><div aria-hidden className="absolute inset-0 -z-10 bg-ink/60" />
      <h2 className="mx-auto max-w-2xl text-2xl md:text-4xl">Ready to take the next step toward your home?</h2>
      <p className="mx-auto mt-3 max-w-lg text-cream/75">Tell us where, how much and when. A named agent will reply on the channel you choose.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3"><Enquire subject="General enquiry" label="Send an enquiry" className="btn-primary btn-lg" /><Link href="/contact" className="btn btn-lg border-cream/30 bg-cream/10 text-cream hover:bg-cream/20">Contact options</Link></div></div></section>
  </>);
}
