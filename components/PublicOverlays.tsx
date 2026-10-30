"use client";

import dynamic from "next/dynamic";

const NewsletterPopup = dynamic(() => import("@/components/NewsletterPopup"), { ssr: false });

export default function PublicOverlays() {
  return <NewsletterPopup />;
}
