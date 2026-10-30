import type { Metadata } from "next"; import PageHero from "@/components/PageHero"; import Img from "@/components/Img"; import Reveal from "@/components/Reveal"; import { IMG, PROMISES } from "@/lib/data"; import { Shield } from "@/components/Icons";
export const metadata: Metadata = { title: "About and trust" };
const v = [["Integrity", "Clear pricing, real projects, secure enquiries"], ["Service", "Fast replies, enquiry tracking, simple forms"], ["Partnership", "Pages for developers, owners and investors"], ["Sensitivity", "Accessible, mobile-first, local language options"], ["Can-do spirit", "Ownership shown as reachable, step by step"], ["Sustainable innovation", "Lightweight pages that load well on any phone"]];
const biz = [["Real estate group", "Land, sales, affordable homes, estates, rentals, commercial"], ["Hardware and building materials", "Retail, wholesale and project supply"], ["Home services", "Construction, renovation, maintenance, facilities"]];
export default function About() { return (<><PageHero eyebrow="About and trust" title="Democratising access to housing" intro="Our vision is to make suitable living spaces accessible to people wherever they choose to live, by helping them decide where, how and when." img={IMG.land2} />
  <section aria-labelledby="welcome-title" className="overflow-hidden bg-ink text-cream">
    <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:gap-14">
      <div className="py-2">
        <Reveal>
          <p className="eyebrow !text-sand">A welcome from B B Homes</p>
          <h2 id="welcome-title" className="mt-3 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">A Welcome Address</h2>
          <div className="mt-6 max-w-2xl space-y-4 text-sm leading-7 text-cream/80 sm:text-base">
            <p>Welcome. Finding a place to call home is one of life’s most important journeys, and we are glad you are taking yours with us.</p>
            <p>At B B Homes, we bring homes, land, building materials and home services together to help make your next step clearer. Whether you are looking to rent, buy, build or invest, our aim is to give you useful choices, straightforward information and a real person to speak with.</p>
            <p>We believe trust is earned: through clear pricing, documents you can check and careful support from the first question to the next chapter. We are here to help you move forward at your own pace, with confidence in each decision.</p>
            <p>Thank you for welcoming us into your plans. We look forward to welcoming you home.</p>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-7 border-t border-cream/20 pt-5">
            <p className="text-xs uppercase tracking-[.14em] text-sand">With warm regards</p>
            <p className="mt-1 font-serif text-lg">The B B Homes Team</p>
          </div>
        </Reveal>
      </div>
      <Reveal delay={240}>
        <figure className="relative min-h-[20rem] overflow-hidden sm:min-h-[28rem]">
          <Img id={IMG.hero} alt="A modern home representing the welcome from B B Homes" sizes="(min-width:1024px) 45vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <figcaption className="absolute bottom-5 left-5 right-5 border-l-2 border-sand pl-4 text-sm leading-6 text-cream">A clearer path to finding, building and caring for home.</figcaption>
        </figure>
      </Reveal>
    </div>
  </section>
  <div className="wrap">
    <div className="grid items-center gap-8 lg:grid-cols-2"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg"><Img id={IMG.hero} alt="A B B Homes house" sizes="(min-width:1024px) 50vw, 100vw" /></div>
      <div><p className="eyebrow">Our promise to you</p><h2 className="mt-1 text-2xl md:text-3xl">Trust is built in the details</h2><ul className="mt-5 space-y-4">{PROMISES.map(([t, d]) => <li key={t} className="flex gap-3"><Shield width={22} height={22} className="mt-0.5 shrink-0 text-moss" /><span><b>{t}</b><span className="block text-sm text-mute">{d}</span></span></li>)}</ul></div></div>
    <h2 className="mb-4 mt-14 text-2xl">Our values, shown not just stated</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{v.map(([t, d]) => <div key={t} className="panel panel-hover"><b>{t}</b><p className="mt-1 text-sm text-mute">{d}</p></div>)}</div>
    <h2 className="mb-4 mt-14 text-2xl">Three businesses, one supply chain</h2><div className="grid gap-4 md:grid-cols-3">{biz.map(([t, d], i) => <div key={t} className={`panel panel-hover border-t-4 ${["!border-t-terra", "!border-t-sand", "!border-t-moss"][i]}`}><b>{t}</b><p className="mt-1 text-sm text-mute">{d}</p></div>)}</div></div></>); }
