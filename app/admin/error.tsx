"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="wrap !pt-6">
      <div className="mx-auto max-w-xl">
        <p className="eyebrow">Operations unavailable</p>
        <h1 className="mt-2 text-3xl">We couldn't load the management workspace.</h1>
        <p className="mt-3 text-sm leading-6 text-mute">No record was changed. Please try again or contact your system administrator.</p>
        <button type="button" className="btn-primary mt-5" onClick={reset}>Try again</button>
      </div>
    </section>
  );
}
