"use client";

import DeferredConsultant from "@/components/DeferredConsultant";
import { Gmail, Phone, WhatsApp } from "@/components/Icons";
import { PHONE_HREF, gmailLink, whatsappLink } from "@/lib/data";

export default function PublicFloatingActions() {
  return (
    <>
      <DeferredConsultant />
      {/* Contact icons start with Gmail at the top, directly under the assistant badge. */}
      <div className="fixed bottom-[calc(7rem_+_env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-3 sm:bottom-[calc(8.25rem_+_env(safe-area-inset-bottom))] sm:right-5">
        <a
          href={gmailLink()}
          target="_blank"
          rel="noopener"
          aria-label="Email the B B Homes team"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        >
          <Gmail width={20} height={20} />
        </a>
        <a
          href={PHONE_HREF}
          aria-label="Call the B B Homes team"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black bg-ink text-sand shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        >
          <Phone width={19} height={19} />
        </a>
        <a
          href={whatsappLink("Hello B B Homes, I'd like to speak to your team.\n\nName:\nPhone:")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message the B B Homes team on WhatsApp"
          className="whatsapp-float relative flex h-14 w-14 items-center justify-center gap-2 rounded-full text-sm font-bold text-white sm:h-auto sm:w-auto sm:justify-start sm:px-4 sm:py-3.5"
        >
          <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" />
          <WhatsApp width={24} height={24} />
          <span className="hidden sm:inline">Message the team</span>
        </a>
      </div>
    </>
  );
}
