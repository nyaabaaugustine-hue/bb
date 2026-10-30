import { Check } from "./Icons";

/** Shared "sent successfully" panel used by every public form after a successful submission. */
export default function SentNotice({ title, message, reference, titleId, children }: { title: string; message: React.ReactNode; reference?: string; titleId?: string; children?: React.ReactNode }) {
  return (
    <div role="status" className="pop-in py-2 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss/15 text-moss ring-8 ring-moss/5">
        <Check width={30} height={30} strokeWidth={2.4} />
      </span>
      <p className="eyebrow mt-4">Sent successfully</p>
      <h3 id={titleId} className="mt-1 text-xl leading-snug">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-mute">{message}</p>
      {reference && (
        <div className="mx-auto mt-4 w-fit rounded-xl border border-line bg-sand/25 px-5 py-2">
          <span className="block text-[11px] font-semibold uppercase tracking-[.14em] text-mute">Your reference</span>
          <span className="font-mono text-base font-bold tracking-[.18em]">{reference}</span>
        </div>
      )}
      {children}
    </div>
  );
}
