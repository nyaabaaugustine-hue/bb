import type { Metadata } from "next";
import Enquire from "@/components/Enquire";
import MapEmbed from "@/components/MapEmbed";
import OneTapContact from "@/components/OneTapContact";
import PageHero from "@/components/PageHero";
import Team from "@/components/Team";
import { Shield } from "@/components/Icons";
import { EMAIL, IMG, PHONE } from "@/lib/data";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a named agent"
        intro="Choose how you want a reply. Every enquiry gets a reference so nothing gets lost."
        img={IMG.hero}
      />
      <div className="wrap">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="panel">
            <p className="eyebrow">One tap</p>
            <h2 className="mt-1 text-2xl">Reach a person now</h2>
            <p className="mt-2 text-sm leading-6 text-mute">
              Message us on WhatsApp, call the team, or open a pre-filled email. All three reach a named agent.
            </p>
            <OneTapContact className="mt-5" subject="General enquiry" />
            <p className="mt-4 break-all text-xs text-mute">{PHONE} · {EMAIL}</p>
          </div>

          <div className="panel">
            <p className="eyebrow">Reference first</p>
            <h2 className="mt-1 text-2xl">Send a one-tap enquiry</h2>
            <p className="mt-2 text-sm leading-6 text-mute">
              Leave your details and get a reference number immediately. The team replies on the channel you choose.
            </p>
            <div className="mt-5">
              <Enquire subject="General enquiry" label="Send an enquiry" className="btn-primary w-full justify-center" />
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 text-sm text-mute">
          <Shield width={18} height={18} className="mt-0.5 shrink-0 text-moss" />
          We use your phone number only to reply to your enquiry. No payment is taken through this website.
        </p>

        <h2 className="mb-5 mt-12 text-2xl">Find us</h2>
        <MapEmbed />
        <h2 className="mb-5 mt-14 text-2xl">Who you will speak to</h2>
        <Team />
      </div>
    </>
  );
}
