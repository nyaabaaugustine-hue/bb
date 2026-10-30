"use client";

import { NEWSLETTER_EVENT } from "@/lib/newsletter";

export default function NewsletterButton({ className = "", children = "Get deal alerts" }: { className?: string; children?: React.ReactNode }) {
  return <button type="button" onClick={() => window.dispatchEvent(new Event(NEWSLETTER_EVENT))} className={className}>{children}</button>;
}
