import type { Metadata } from "next";
import Link from "next/link";
import { EMAIL, PHONE, PHONE_HREF } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "What B B Homes collects when you enquire, subscribe or create an account, why we hold it, and how to exercise your rights.",
};

const updated = "28 October 2026";

export default function PrivacyPage() {
  return (
    <section className="wrap max-w-3xl !pt-32 sm:!pt-36">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-3xl md:text-4xl">Privacy notice</h1>
      <p className="mt-2 text-sm text-mute">Last updated {updated}</p>
      <p className="mt-5 text-sm leading-6 text-mute">
        B B Homes handles personal information in line with Ghana&apos;s Data Protection Act, 2012 (Act 843). This notice explains what we collect through this website, why we hold it and the choices you have. It does not cover records you share with us offline.
      </p>

      <div className="mt-8 space-y-8 text-sm leading-6">
        <div>
          <h2 className="text-xl">Information we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-mute">
            <li><b className="text-ink">Enquiries and service requests.</b> Your name, phone number, optional email address, preferred contact channel, the category of enquiry and the message you send.</li>
            <li><b className="text-ink">Deal alerts.</b> Your email address, optional phone number and the time you consented to receive updates.</li>
            <li><b className="text-ink">Account and portal use.</b> Your sign-in identity, display name, phone number, saved homes, requests, site visits and the payment records our team enters.</li>
            <li><b className="text-ink">Technical data.</b> We use your connection address briefly to rate-limit forms and protect the service. We do not store it in the database and we do not run advertising or behavioural analytics.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl">Why we use it</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-mute">
            <li>To answer your enquiry, arrange a viewing or progress a service request.</li>
            <li>To manage your account and show you the records linked to it.</li>
            <li>To send deal alerts where you have opted in. Every message explains how to stop.</li>
            <li>To keep the website and your account secure, and to meet legal or accounting duties.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl">Who we share it with</h2>
          <p className="mt-3 text-mute">
            Our teammembers see the information needed to handle your request. We use service providers for database hosting (Neon), image delivery (Cloudinary) and the embedded map (Google Maps). They process data on our instructions or under their own terms. We do not sell personal information.
          </p>
        </div>

        <div>
          <h2 className="text-xl">How long we keep it</h2>
          <p className="mt-3 text-mute">
            We keep enquiry and account records while your relationship with us is active and for as long as needed to resolve requests, meet accounting duties and handle disputes. Deal-alert details are kept until you unsubscribe or ask us to delete them. You can ask us to remove information sooner where the law allows.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Cookies and local storage</h2>
          <p className="mt-3 text-mute">
            Signing in sets a secure session cookie. The newsletter dialog remembers a dismissal for the current browser session, and the on-page assistant keeps its conversation in session storage. We do not use advertising cookies.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Your rights</h2>
          <p className="mt-3 text-mute">
            You may ask for a copy of your information, correct it, withdraw consent for deal alerts, or request deletion. Contact us and we will respond within a reasonable period. You can also raise a concern with Ghana&apos;s Data Protection Commission.
          </p>
          <p className="mt-3 text-mute">
            Email <a href={`mailto:${EMAIL}`} className="font-semibold text-terra underline-offset-2 hover:underline">{EMAIL}</a> or call <a href={PHONE_HREF} className="font-semibold text-terra underline-offset-2 hover:underline">{PHONE}</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Changes</h2>
          <p className="mt-3 text-mute">If this notice changes materially we will update the date above. See also our <Link href="/terms" className="font-semibold text-terra underline-offset-2 hover:underline">website terms</Link>.</p>
        </div>
      </div>
    </section>
  );
}
