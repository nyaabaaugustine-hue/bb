import { EMAIL, PHONE, PHONE_HREF, gmailLink, whatsappLink } from "@/lib/data";
import { Gmail, Phone, WhatsApp } from "@/components/Icons";

type Variant = "grid" | "row" | "stack";

/**
 * One-tap WhatsApp, phone and email actions with the real brand marks.
 * Plain links, so this works on the server and inside client dialogs.
 */
export default function OneTapContact({
  subject = "Enquiry from the B B Homes website",
  message = "Hello B B Homes, I would like to speak to your team.",
  emailBody,
  variant = "grid",
  className = "",
}: {
  subject?: string;
  message?: string;
  emailBody?: string;
  variant?: Variant;
  className?: string;
}) {
  const body = emailBody ?? `${message}\n\nName:\nPhone:\nPreferred time to be contacted:`;
  const layout = variant === "grid" ? "grid gap-2 sm:grid-cols-3" : variant === "row" ? "grid grid-cols-3 gap-2" : "grid gap-2";

  return (
    <div className={`${layout} ${className}`}>
      <a
        href={whatsappLink(`${message}\n\nName:\nPhone:`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message B B Homes on WhatsApp"
        className="whatsapp-cta min-h-11 justify-center px-3 text-sm"
      >
        <WhatsApp width={20} height={20} />
        WhatsApp
      </a>
      <a
        href={PHONE_HREF}
        aria-label={`Call B B Homes on ${PHONE}`}
        className="btn min-h-11 justify-center px-3 text-sm"
      >
        <Phone width={18} height={18} className="text-terra" />
        Call now
      </a>
      <a
        href={gmailLink(subject, body)}
        target="_blank"
        rel="noopener"
        aria-label={`Email B B Homes at ${EMAIL}`}
        className="btn min-h-11 justify-center px-3 text-sm"
      >
        <Gmail width={18} height={18} />
        Email
      </a>
    </div>
  );
}
