import Link from "next/link";
import { Listing, KIND_LABEL, WHEN, money } from "@/lib/data";
import Enquire from "./Enquire";
import Img from "./Img";
import { KIND_BADGE, Pin } from "./Icons";

export default function Card({ l }: { l: Listing }) {
  return (<article className="panel-hover group fade-in flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-sm">
    <Link href={`/homes/${l.slug}`} tabIndex={-1} aria-hidden className="relative block aspect-[4/3] overflow-hidden bg-sand/30">
      <Img id={l.img} alt="" sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw" className="transition duration-500 group-hover:scale-105" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/50 to-transparent" />
      <span className={`${KIND_BADGE[l.kind]} absolute left-3 top-3 bg-card/95`}>{KIND_LABEL[l.kind]}</span>
      <span className="badge absolute right-3 top-3 border-line bg-card/95 text-mute">{WHEN[l.when]}</span>
    </Link>
    <div className="flex flex-1 flex-col gap-1.5 p-4">
      <Link href={`/homes/${l.slug}`} className="font-semibold leading-snug transition group-hover:text-terra">{l.title}</Link>
      <span className="flex items-center gap-1 text-xs text-mute"><Pin width={14} height={14} />{l.zone} · {l.note}</span>
      <div className="mt-1 flex items-baseline gap-1"><span className="font-serif text-xl font-bold">{money(l.price)}</span>{l.kind === "rent" && <span className="text-xs text-mute">/ month</span>}</div>
      <div className="mt-auto flex gap-2 pt-3"><Link href={`/homes/${l.slug}`} className="btn flex-1">Details</Link><Enquire subject={l.title} className="btn-primary flex-1" /></div>
    </div></article>);
}
