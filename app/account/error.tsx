"use client";

export default function AccountError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="wrap !pt-6">
      <div className="mx-auto max-w-xl">
        <p className="eyebrow">Account unavailable</p>
        <h1 className="mt-2 text-3xl">We couldn't load your account.</h1>
        <p className="mt-3 text-sm leading-6 text-mute">Your sign-in is protected. Please try again; if the issue continues, contact the B B Homes team.</p>
        <button type="button" className="btn-primary mt-5" onClick={reset}>Try again</button>
      </div>
    </section>
  );
}
