import { MAP_EMBED, MAP_LINK, PHONE, PHONE_HREF, gmailLink } from "@/lib/data";
import { Pin, Phone, Arrow, Gmail } from "./Icons";

/** Modern map block: full-width rounded map, softened colours, floating contact card. */
export default function MapEmbed({ height = "h-[26rem] md:h-[32rem]" }: { height?: string }) {
  return (<div className={`group relative overflow-hidden rounded-2xl border border-line bg-sand/20 shadow-lg ${height}`}>
    <iframe title="B B Homes location on Google Maps" src={MAP_EMBED} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
      className="absolute inset-0 h-full w-full border-0 [filter:saturate(.85)_contrast(1.05)] transition duration-500 group-hover:[filter:none]" />
    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-ink/10" />
    <div className="absolute inset-x-3 bottom-3 rounded-xl border border-line bg-card/95 p-4 shadow-xl backdrop-blur md:inset-x-auto md:bottom-5 md:left-5 md:w-80">
      <p className="eyebrow flex items-center gap-1"><Pin width={14} height={14} />Visit us</p>
      <p className="mt-1 font-semibold">B B Homes, Tamale</p>
      <p className="text-sm text-mute">Near Aliu Mahama Sports Stadium. Book a site visit and we will meet you there.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={MAP_LINK} target="_blank" rel="noopener" className="btn-dark !px-3 !py-1.5">Directions <Arrow width={14} height={14} /></a>
        <a href={PHONE_HREF} className="btn !px-3 !py-1.5"><Phone width={14} height={14} />{PHONE}</a>
        <a href={gmailLink("Site visit request")} target="_blank" rel="noopener" aria-label="Email us by Gmail" className="btn !px-3 !py-1.5"><Gmail width={16} height={16} /></a>
      </div></div></div>);
}
