import type { Metadata } from "next"; import Enquire from "@/components/Enquire"; import PageHero from "@/components/PageHero"; import MapEmbed from "@/components/MapEmbed"; import Team from "@/components/Team";
import { PHONE, PHONE_HREF, IMG, EMAIL, gmailLink } from "@/lib/data"; import { Phone, Shield, Gmail } from "@/components/Icons";
export const metadata: Metadata = { title: "Contact" };
export default function Contact() { return (<><PageHero eyebrow="Contact" title="Talk to a named agent" intro="Choose how you want a reply. Every enquiry gets a reference so nothing gets lost." img={IMG.hero} />
  <div className="wrap"><div className="grid gap-4 md:grid-cols-3">
    <a href={PHONE_HREF} className="panel panel-hover flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-sand"><Phone width={22} height={22} /></span><span><b className="block">Call us</b><span className="text-sm text-mute">{PHONE}</span></span></a>
    <a href={gmailLink()} target="_blank" rel="noopener" className="panel panel-hover flex items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-white"><Gmail width={26} height={26} /></span><span className="min-w-0"><b className="block">Email by Gmail</b><span className="block truncate text-sm text-mute">{EMAIL}</span></span></a>
    <div className="panel flex items-center justify-between gap-3"><span><b className="block">One-tap enquiry</b><span className="text-sm text-mute">Get a reference number</span></span><Enquire subject="General enquiry" label="Send" className="btn-primary" /></div></div>
    <p className="mt-4 flex items-start gap-2 text-sm text-mute"><Shield width={18} height={18} className="mt-0.5 shrink-0 text-moss" />We use your phone number only to reply to your enquiry. No payment is taken through this website.</p>
    <h2 className="mb-5 mt-12 text-2xl">Find us</h2><MapEmbed />
    <h2 className="mb-5 mt-14 text-2xl">Who you will speak to</h2><Team /></div></>); }
