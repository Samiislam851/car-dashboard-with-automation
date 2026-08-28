"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import useSWR from "swr";
import { MessageCircle, Send, X } from "lucide-react";

type Message = { id: number; role: "user" | "assistant"; text: string };

const meFetcher = (url: string) => fetch(url).then((res) => (res.ok ? res.json() : null));

export function ChatWidget() {
  // Checked client-side so mounting the widget doesn't force every page to render dynamically.
  const { data: me } = useSWR<{ name?: string } | null>("/api/auth/me", meFetcher, {
    revalidateOnFocus: false,
  });
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as it streams in.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || streaming) return;

    const userMessage: Message = { id: Date.now(), role: "user", text };
    const replyId = userMessage.id + 1;

    setMessages((prev) => [...prev, userMessage, { id: replyId, role: "assistant", text: "" }]);
    setDraft("");
    setError(null);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The JWT rides along in the httpOnly cookie automatically.
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        throw new Error(res.status === 401 ? "Please log in to use chat." : "Couldn't reach the assistant.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const piece = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === replyId ? { ...m, text: m.text + piece } : m)),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) => prev.filter((m) => m.id !== replyId));
    } finally {
      setStreaming(false);
    }
  };

  // The endpoint is authenticated, so there's nothing to offer signed-out visitors.
  if (!me) return null;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Best Car"
          className="fixed right-5 bottom-24 z-50 flex h-[460px] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[10px] border border-line bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between gap-3 border-b border-line bg-brand-600 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Best Car Assistant</p>
              <p className="text-xs text-white/80">Ask about bookings or vehicles</p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-md p-1 text-white/90 transition hover:bg-white/15"
            >
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-ink/50">
                Hi! Ask me anything about your rentals — I&apos;ll reply here.
              </p>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-[10px] px-3 py-2 text-sm leading-6 whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-surface text-ink/80"
                  }`}
                >
                  {message.text}
                  {/* Caret while the assistant bubble is still filling in. */}
                  {message.role === "assistant" && streaming && message.text === "" && (
                    <span className="inline-block animate-pulse">…</span>
                  )}
                </p>
              </div>
            ))}

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message…"
              aria-label="Message"
              className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none transition focus:border-brand-600"
            />
            <button
              type="submit"
              disabled={streaming || !draft.trim()}
              aria-label="Send message"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-md bg-brand-600 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        className="fixed right-5 bottom-5 z-50 grid size-14 cursor-pointer place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
