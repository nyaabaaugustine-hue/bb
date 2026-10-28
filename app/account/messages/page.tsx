import type { Metadata } from "next";
import Link from "next/link";
import { gmailLink, whatsappLink } from "@/lib/data";
import { Gmail, WhatsApp } from "@/components/Icons";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <section>
      <p className="eyebrow">Keep in touch</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Messages</h1>
      <div className="panel mt-6 max-w-2xl">
        <h2 className="text-xl">Your shared inbox is not connected yet</h2>
        <p className="mt-2 text-sm leading-6 text-mute">For now, conversations with the team continue on WhatsApp or email. Replies from those channels will not appear in this dashboard yet.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappLink("Hello B B Homes, I would like to follow up on my account enquiry.")} target="_blank" rel="noopener noreferrer" className="whatsapp-cta"><WhatsApp width={18} height={18} />Message on WhatsApp</a>
          <a href={gmailLink("Follow-up from my B B Homes account")} target="_blank" rel="noopener noreferrer" className="btn"><Gmail width={18} height={18} />Email the team</a>
          <Link href="/contact" className="btn">Contact options</Link>
        </div>
      </div>
    </section>
  );
}
