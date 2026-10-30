"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { formatDateTime } from "@/lib/format";
import OneTapContact from "@/components/OneTapContact";
import { Arrow } from "@/components/Icons";

export type CustomerMessage = {
  id: string;
  author_role: "customer" | "team";
  body: string;
  created_at: string | Date;
};

export default function CustomerMessages({ initialMessages }: { initialMessages: CustomerMessage[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const thread = useRef<HTMLDivElement>(null);

  useEffect(() => setMessages(initialMessages), [initialMessages]);

  useEffect(() => {
    const element = thread.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (text.length < 2 || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't send your message.");
      setMessages((current) => [...current, result.message]);
      setDraft("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't send your message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="panel !p-0">
        <div ref={thread} role="log" aria-live="polite" aria-label="Conversation with B B Homes" className="max-h-[60vh] min-h-[18rem] space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[14rem] flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand/50 text-terra"><Arrow width={22} height={22} /></span>
              <h2 className="mt-3 text-lg font-semibold">No messages yet</h2>
              <p className="mt-1 max-w-sm text-sm leading-6 text-mute">Send your agent a question about a home, a visit, documents or a payment plan. Replies appear here.</p>
            </div>
          ) : messages.map((message) => {
            const mine = message.author_role === "customer";
            return (
              <article key={message.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? "rounded-br-sm bg-ink text-cream" : "rounded-bl-sm border border-line bg-sand/30 text-ink"}`}>
                  {message.body}
                </p>
                <p className="mt-1 px-1 text-[11px] text-mute">
                  {mine ? "You" : "B B Homes team"} · {formatDateTime(message.created_at) ?? "just now"}
                </p>
              </article>
            );
          })}
        </div>

        <form onSubmit={submit} className="border-t border-line bg-card px-4 py-4 sm:px-6">
          <label htmlFor="message-body" className="sr-only">Message the B B Homes team</label>
          <textarea
            id="message-body"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            minLength={2}
            maxLength={4000}
            required
            placeholder="Tell your agent what you need. Include a reference number if you have one."
            className="field resize-y"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-mute">{draft.length}/4000 · Replies are saved in your account.</p>
            <button type="submit" className="btn-primary min-h-11 px-5" disabled={sending || draft.trim().length < 2}>
              {sending ? "Sending…" : "Send message"}
            </button>
          </div>
          {error && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}
        </form>
      </div>

      <aside className="space-y-4">
        <div className="panel">
          <h2 className="text-xl">Need a faster reply?</h2>
          <p className="mt-1 text-sm leading-6 text-mute">Call, WhatsApp or email the team directly. Your account conversation stays here as a record.</p>
          <OneTapContact variant="stack" className="mt-3" subject="Account message follow-up" message="Hello B B Homes, I would like to follow up on my account." />
        </div>
        <div className="panel">
          <h2 className="text-sm font-bold uppercase tracking-[.14em] text-terra">How it works</h2>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-mute">
            <li>Your message is saved to your account and the team workspace.</li>
            <li>A named agent replies on WhatsApp, phone or email as well as here.</li>
            <li>Do not send passwords, PINs or mobile-money codes in a message.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
