"use client";

import { usePathname } from "next/navigation";
import Consultant from "@/components/Consultant";
import { WhatsApp } from "@/components/Icons";
import { whatsappLink } from "@/lib/data";

const privatePrefixes = ["/account", "/admin", "/auth", "/login", "/register"];

export default function PublicFloatingActions() {
  const pathname = usePathname();
  const isPrivatePage = privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isPrivatePage) return null;

  return (
    <>
      <Consultant />
      <a
        href={whatsappLink("Hello B B Homes, I'd like to speak to your team.\n\nName:\nPhone:")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message the B B Homes team on WhatsApp"
        className="whatsapp-float fixed bottom-5 right-5 z-40 flex origin-bottom-right scale-[.65] items-center gap-2 rounded-full px-4 py-3.5 text-sm font-bold text-white"
      >
        <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" />
        <WhatsApp width={24} height={24} />
        <span className="hidden sm:inline">Message the team</span>
      </a>
    </>
  );
}
