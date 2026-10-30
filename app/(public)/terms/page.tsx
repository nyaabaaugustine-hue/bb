import type { Metadata } from "next";
import Link from "next/link";
import { EMAIL, PHONE, PHONE_HREF } from "@/lib/data";

export const metadata: Metadata = {
  title: "Website terms",
  description: "The terms that apply when you use the B B Homes website, browse listings or send an enquiry.",
};

const updated = "28 October 2026";

export default function TermsPage() {
  return (
    <section className="wrap max-w-3xl !pt-32 sm:!pt-36">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-3xl md:text-4xl">Website terms</h1>
      <p className="mt-2 text-sm text-mute">Last updated {updated}</p>
      <p className="mt-5 text-sm leading-6 text-mute">
        These terms apply when you use this website. By browsing or sending an enquiry you accept them. If you do not agree, please do not use the site.
      </p>

      <div className="mt-8 space-y-8 text-sm leading-6">
        <div>
          <h2 className="text-xl">Information, not an offer</h2>
          <p className="mt-3 text-mute">
            Listings, prices, images, floor areas and payment illustrations are shown for guidance. They are not an offer, a reservation or a promise of availability. Prices and terms can change and an option is only secured by a written agreement signed by B B Homes. Verify documents, title and site conditions independently before paying anything.
          </p>
        </div>

        <div>
          <h2 className="text-xl">No payments on this site</h2>
          <p className="mt-3 text-mute">
            This website does not take payments. Payment and ledger entries shown in the customer portal are records our team enters after receiving funds through agreed channels. Always confirm account details with a named teammember before transferring money, and keep your receipts.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Enquiries and requests</h2>
          <p className="mt-3 text-mute">
            Sending an enquiry, booking a site visit or creating a portal request does not create a contract. We aim to reply promptly, but response times are not guaranteed. You are responsible for the accuracy of the contact details you give us.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Your account</h2>
          <p className="mt-3 text-mute">
            Keep your sign-in details private and tell us if you suspect misuse. Do not share your account. We may suspend access where we reasonably believe it is being used unlawfully or in a way that harms the service or another person.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Acceptable use</h2>
          <p className="mt-3 text-mute">
            Do not attempt to disrupt the site, access another person&apos;s records, scrape content at scale, or use the enquiry forms to send unlawful, misleading or abusive material. We may block access and report serious misuse.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Content and intellectual property</h2>
          <p className="mt-3 text-mute">
            The B B Homes name, logo, photographs, designs and written content belong to us or our licensors. You may view and share links for personal, non-commercial use. Do not reproduce or reuse them commercially without written permission.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Links and third-party services</h2>
          <p className="mt-3 text-mute">
            The site links to WhatsApp, Gmail and an embedded Google map. Those services have their own terms and privacy practices. We are not responsible for their content or availability.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Liability</h2>
          <p className="mt-3 text-mute">
            We work to keep the site accurate and available, but it is provided as it is. To the extent the law allows, we are not liable for indirect or consequential loss arising from reliance on website content or from interruptions. Nothing here limits liability that cannot lawfully be excluded.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Governing law and contact</h2>
          <p className="mt-3 text-mute">
            These terms are governed by the laws of Ghana. Questions? Email <a href={`mailto:${EMAIL}`} className="font-semibold text-terra underline-offset-2 hover:underline">{EMAIL}</a> or call <a href={PHONE_HREF} className="font-semibold text-terra underline-offset-2 hover:underline">{PHONE}</a>. Our <Link href="/privacy" className="font-semibold text-terra underline-offset-2 hover:underline">privacy notice</Link> explains how we handle personal information.
          </p>
        </div>
      </div>
    </section>
  );
}
