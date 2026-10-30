"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { formatDateTime } from "@/lib/format";
import type { MessageThread } from "@/lib/admin-data";

type ThreadMessage = {
  id: string;
  author_role: "customer" | "team";
  body: string;
  created_at: string | Date;
};

type Customer = { id: string; email: string; display_name: string; phone: string | null };

export default function AdminMessages({ initialThreads }: { initialThreads: MessageThread[] }) {
  const [threads, setThreads] = useState(initialThreads);
  const [active, setActive] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const thread = useRef<HTMLDivElement>(null);

  useEffect(() => setThreads(initialThreads), [initialThreads]);

  useEffect(() => {
    const element = thread.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length]);

  async function openThread(customer: Pick<Customer, "id" | "email" | "display_name" | "phone">) {
    setLoading(true);
    setError("");
    setNotice("");
    setActive({ ...customer });
    setMessages([]);
    try {
      const response = await fetch(`/api/admin/messages?userId=${encodeURIComponent(customer.id)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't load that conversation.");
      setActive(result.customer);
      setMessages(result.messages);
      setThreads((current) => current.map((item) => item.user_id === customer.id ? { ...item, unread: 0 } : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't load that conversation.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const text = draft.trim();
    if (text.length < 2 || sending) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: active.id, body: text }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't send that reply.");
      setMessages((current) => [...current, result.message]);
      setThreads((current) => current.map((item) => item.user_id === active.id
        ? { ...item, last_body: text, last_role: "team", last_at: result.message.created_at }
        : item));
      setDraft("");
      setNotice("Reply saved. The customer sees it in their dashboard.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't send that reply.");
    } finally {
      setSending(false);
    }
  }

  const unreadTotal = threads.reduce((total, item) => total + item.unread, 0);

  return (
    <section id="messages" className="mt-8 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Customer messages</h2>
          <p className="mt-1 text-sm text-mute">Private threads from customer dashboards. Replies are saved instantly; no email is sent automatically.</p>
        </div>
        <span className="badge badge-sand">{unreadTotal} unread</span>
      </div>

      {error && <p role="alert" className="mt-3 rounded-lg border border-red-800/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{error}</p>}
      {notice && <p role="status" className="mt-3 rounded-lg border border-moss/20 bg-moss/5 px-4 py-3 text-sm font-medium text-moss">{notice}</p>}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {threads.length === 0 ? (
            <p className="px-4 py-6 text-sm text-mute">No customer messages yet. Threads appear here after a customer writes from their dashboard.</p>
          ) : threads.map((item) => (
            <button
              key={item.user_id}
              type="button"
              onClick={() => openThread({ id: item.user_id, email: item.email, display_name: item.display_name, phone: item.phone })}
              aria-current={active?.id === item.user_id ? "true" : undefined}
              className={`block w-full px-4 py-3 text-left transition hover:bg-sand/30 ${active?.id === item.user_id ? "bg-sand/40" : ""}`}
            >
              <span className="flex items-start justify-between gap-2">
                <b className="min-w-0 truncate">{item.display_name || item.email}</b>
                {item.unread > 0 && <span className="badge badge-terra shrink-0">{item.unread} new</span>}
              </span>
              <span className="mt-0.5 block truncate text-xs text-mute">{item.last_role === "team" ? "You: " : ""}{item.last_body}</span>
              <span className="mt-1 block text-[11px] text-mute">{formatDateTime(item.last_at) ?? ""}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-line bg-card">
          {active ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{active.display_name || active.email}</h3>
                  <p className="truncate text-xs text-mute">{active.email}{active.phone ? ` · ${active.phone}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  {active.phone && <a href={`tel:+${active.phone}`} className="btn min-h-9 px-3 text-xs">Call</a>}
                  {active.phone && <a href={`https://wa.me/${active.phone}`} target="_blank" rel="noopener noreferrer" className="btn min-h-9 px-3 text-xs">WhatsApp</a>}
                </div>
              </div>

              <div ref={thread} role="log" aria-live="polite" aria-label={`Conversation with ${active.display_name || active.email}`} className="max-h-[26rem] min-h-[12rem] space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
                {loading ? <p className="text-sm text-mute">Loading conversation…</p> : messages.length === 0 ? <p className="text-sm text-mute">No messages in this thread.</p> : messages.map((message) => {
                  const mine = message.author_role === "team";
                  return (
                    <article key={message.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-6 ${mine ? "rounded-br-sm bg-ink text-cream" : "rounded-bl-sm border border-line bg-sand/30"}`}>{message.body}</p>
                      <p className="mt-1 px-1 text-[11px] text-mute">{mine ? "Team" : "Customer"} · {formatDateTime(message.created_at) ?? ""}</p>
                    </article>
                  );
                })}
              </div>

              <form onSubmit={sendReply} className="border-t border-line px-4 py-3 sm:px-5">
                <label htmlFor="admin-reply" className="sr-only">Reply to the customer</label>
                <textarea id="admin-reply" value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} minLength={2} maxLength={4000} required placeholder="Write a reply. It appears in the customer's dashboard." className="field resize-y" />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-mute">{draft.length}/4000</p>
                  <button type="submit" className="btn-primary min-h-10 px-4" disabled={sending || draft.trim().length < 2}>{sending ? "Sending…" : "Send reply"}</button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex min-h-[18rem] flex-col items-center justify-center px-5 text-center">
              <h3 className="text-lg font-semibold">Choose a conversation</h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-mute">Open a thread to read the customer's message and reply. The latest conversation appears first.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
