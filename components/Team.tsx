import { LINKEDIN_URL, TEAM, gmailLink, whatsappLink } from "@/lib/data";
import TeamPhoto from "./TeamPhoto";
import { Gmail, LinkedIn, WhatsApp } from "./Icons";

export default function Team() {
  return (<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{TEAM.map((m, i) => {
    return (<article key={m.role} className="panel-hover group overflow-hidden rounded-xl border border-line bg-card text-center shadow-sm">
      <TeamPhoto photo={m.photo} name={m.name} role={m.role} index={i} />
      <div className="p-5"><h3 className="text-lg">{m.name ?? m.role}</h3>{m.name && <p className="eyebrow mt-1">{m.role}</p>}
        <p className="mt-2 text-sm text-mute">{m.blurb}</p>
        <a href={whatsappLink(`Hello B B Homes, I'd like to speak to the ${m.role.toLowerCase()} team.\n\nName:\nPhone:`)} target="_blank" rel="noopener noreferrer" className="whatsapp-cta mt-4 h-11 w-full"><WhatsApp width={18} height={18} />Message this team</a>
        <a href={gmailLink(`Message for the ${m.role.toLowerCase()} team`, `Hello, I'd like to speak to the ${m.role.toLowerCase()}.\n\nName:\nPhone:`)} target="_blank" rel="noopener noreferrer" className="btn mt-2 h-11 w-full"><Gmail width={18} height={18} />Email this team</a>
        {LINKEDIN_URL ? (
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label={`Connect with the ${m.role.toLowerCase()} team on LinkedIn`} className="btn mt-2 h-11 w-full"><LinkedIn width={18} height={18} className="text-[#0A66C2]" />Connect on LinkedIn</a>
        ) : (
          <span role="link" aria-disabled="true" title="LinkedIn page coming soon" className="btn mt-2 h-11 w-full cursor-default"><LinkedIn width={18} height={18} className="text-[#0A66C2]" />Connect on LinkedIn</span>
        )}</div></article>); })}</div>);
}
