import { TEAM, gmailLink, whatsappLink } from "@/lib/data";
import Img from "./Img";
import { Key, Land, Crane, Wrench, Gmail, WhatsApp } from "./Icons";

const ICONS = [Key, Land, Crane, Wrench];
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function Team() {
  return (<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{TEAM.map((m, i) => { const Icon = ICONS[i % ICONS.length];
    return (<article key={m.role} className="panel-hover group overflow-hidden rounded-xl border border-line bg-card text-center shadow-sm">
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-moss via-moss to-ink">
        {m.photo ? (<><Img id={m.photo} alt={m.name ? `${m.name}, ${m.role}` : `B B Homes ${m.role}`} sizes="(min-width:1024px) 25vw, 50vw" className="transition duration-500 group-hover:scale-105" /><div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink/40 to-transparent" /></>) : (<>
          <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-terra/30 blur-2xl" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cream/10 text-sand ring-1 ring-cream/20 backdrop-blur">
            {m.name ? <span className="font-serif text-2xl font-bold">{initials(m.name)}</span> : <Icon width={34} height={34} strokeWidth={1.5} />}</span></>)}
      </div>
      <div className="p-5"><h3 className="text-lg">{m.name ?? m.role}</h3>{m.name && <p className="eyebrow mt-1">{m.role}</p>}
        <p className="mt-2 text-sm text-mute">{m.blurb}</p>
        <a href={whatsappLink(`Hello B B Homes, I'd like to speak to the ${m.role.toLowerCase()} team.\n\nName:\nPhone:`)} target="_blank" rel="noopener noreferrer" className="whatsapp-cta mt-4 h-11 w-full"><WhatsApp width={18} height={18} />Message this team</a>
        <a href={gmailLink(`Message for the ${m.role.toLowerCase()} team`, `Hello, I'd like to speak to the ${m.role.toLowerCase()}.\n\nName:\nPhone:`)} target="_blank" rel="noopener noreferrer" className="btn mt-2 h-11 w-full"><Gmail width={18} height={18} />Email this team</a></div></article>); })}</div>);
}
