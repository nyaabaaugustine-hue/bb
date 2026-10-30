"use client";

import { useState } from "react";

export default function ReviewsSection() {
  const [notice, setNotice] = useState("");

  return (
    <section aria-labelledby="reviews-title" className="border-y border-line bg-card">
      <div className="wrap grid items-center gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
        <div>
          <p className="eyebrow">Customer reviews</p>
          <h2 id="reviews-title" className="mt-2 max-w-2xl text-2xl md:text-3xl">Your experience can help someone feel at home.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-mute">We are preparing a place for customers to share their experience with B B Homes. Published reviews will appear here once submissions are connected.</p>
        </div>
        <div className="border-l-2 border-terra pl-6">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-terra">Reviews opening soon</p>
          <p className="mt-2 text-sm leading-6 text-mute">No reviews have been published yet. Be among the first to share your journey.</p>
          <button type="button" className="btn-primary mt-5 min-h-11" onClick={() => setNotice("Review submissions are not connected yet. Please check back soon.")}>
            Add a review
          </button>
          {notice && <p role="status" className="mt-3 text-sm font-medium text-moss">{notice}</p>}
        </div>
      </div>
    </section>
  );
}