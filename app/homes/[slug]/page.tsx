import type { Metadata } from "next"; import Link from "next/link"; import { notFound } from "next/navigation";
import { listings, KIND_LABEL, WHEN, NEXT, PROMISES, money, gmailLink, whatsappLink } from "@/lib/data"; import { Calculator } from "@/components/Tools"; import Enquire from "@/components/Enquire"; import Card from "@/components/Card"; import Img from "@/components/Img";
import { KIND_BADGE, Pin, Arrow, Shield, Check, Gmail, WhatsApp } from "@/components/Icons";
type P = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => listings.map((l) => ({ slug: l.slug }));
export async function generateMetadata({ params }: P): Promise<Metadata> { const { slug } = await params; const l = listings.find((x) => x.slug === slug); return { title: l?.title ?? "Listing" }; }
export default async function Detail({ params }: P) {
  const { slug } = await params; const l = listings.find((x) => x.slug === slug); if (!l) notFound();
  const more = listings.filter((x) => x.slug !== l.slug && x.kind === l.kind).slice(0, 3);
  const [g1, g2] = l.gallery ?? [];
  const price = l.kind === "rent" ? `${money(l.price)} / month` : money(l.price);
  return (<div className="wrap !pt-32 md:!pt-36"><Link href="/homes" className="inline-flex items-center gap-1 text-sm font-semibold text-terra hover:underline"><Arrow width={16} height={16} className="rotate-180" />All homes</Link>
    <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]"><div>
      {/* Gallery */}
      <div className="grid gap-2 sm:grid-cols-3 sm:grid-rows-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[26rem]"><Img id={l.img} alt={l.title} priority sizes="(min-width:1024px) 600px, 100vw" /></div>
        {g1 && <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl border border-line sm:block"><Img id={g1} alt="" sizes="200px" /></div>}
        {g2 && <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl border border-line sm:block"><Img id={g2} alt="" sizes="200px" /></div>}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2"><span className={KIND_BADGE[l.kind]}>{KIND_LABEL[l.kind]}</span><span className="badge border-line text-mute">Available: {WHEN[l.when]}</span><span className="inline-flex items-center gap-1 text-sm text-mute"><Pin width={14} height={14} />{l.zone}</span></div>
      <h1 className="mt-2 text-3xl md:text-4xl">{l.title}</h1>
      <p className="mt-2 font-serif text-3xl font-bold text-terra">{price}</p>
      <p className="mt-3 max-w-2xl text-mute">{l.note}. Price, documents and next steps are shown upfront. Photos shown are illustrative until the final site photos are added.</p>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Type", KIND_LABEL[l.kind]], ["City", l.zone], ["Timing", WHEN[l.when]], ["Payment", l.kind === "rent" ? "Monthly" : "Plan agreed in writing"]].map(([k, v]) => <div key={k} className="panel !p-3"><dt className="text-xs uppercase tracking-wider text-mute">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>)}</dl>
      <div className="panel mt-6 border-l-4 !border-l-terra"><b>Suggested next step</b><p className="mt-1 text-sm text-mute">{NEXT[l.kind]}</p></div>
      <h2 className="mb-3 mt-8 text-xl">What you can expect</h2>
      <ul className="grid gap-3 sm:grid-cols-2">{PROMISES.map(([t, d]) => <li key={t} className="flex gap-3 text-sm"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss text-white"><Check width={12} height={12} strokeWidth={3} /></span><span><b>{t}</b><span className="block text-mute">{d}</span></span></li>)}</ul>
    </div>
    <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
      <div className="panel shadow-md"><p className="eyebrow">Interested?</p><p className="mt-1 font-serif text-2xl font-bold">{price}</p>
        <Enquire subject={l.title} label="Enquire in one tap" className="btn-primary btn-lg mt-4 w-full" />
        <a href={whatsappLink(`Hello B B Homes, I'm interested in ${l.title} (${price}) in ${l.zone}.\n\nName:\nPhone:\nPreferred time to be contacted:`)} target="_blank" rel="noopener noreferrer" className="whatsapp-cta mt-2 w-full"><WhatsApp width={20} height={20} />Message us on WhatsApp</a>
        <a href={gmailLink(`Enquiry: ${l.title}`, `Hello B B Homes,\n\nI'm interested in: ${l.title} (${price}) in ${l.zone}.\n\nName:\nPhone:\nPreferred time to be contacted:`)} target="_blank" rel="noopener" className="btn mt-2 w-full"><Gmail width={20} height={20} />Email us by Gmail</a>
        <p className="mt-3 flex items-start gap-2 text-xs text-mute"><Shield width={16} height={16} className="mt-0.5 shrink-0 text-moss" />You get a reference number and a named agent. No payment is taken through this website.</p></div>
      {l.kind !== "rent" && <Calculator price={l.price} />}
    </aside></div>
    {more.length > 0 && <><h2 className="mb-4 mt-12 text-2xl">Similar options</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{more.map((m) => <Card key={m.slug} l={m} />)}</div></>}</div>);
}
