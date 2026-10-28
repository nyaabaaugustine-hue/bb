export default function AdminLoading() {
  return (
    <section className="wrap !pt-6" aria-label="Loading operations workspace">
      <div className="h-10 w-80 animate-pulse rounded bg-line" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-card" />)}
      </div>
      <p className="sr-only" role="status">Loading the operations workspace…</p>
    </section>
  );
}
