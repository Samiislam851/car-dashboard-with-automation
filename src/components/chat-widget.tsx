"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import useSWR from "swr";
import { MessageCircle, Send, X } from "lucide-react";

type Message = { id: number; role: "user" | "assistant"; text: string };

const meFetcher = (url: string) => fetch(url).then((res) => (res.ok ? res.json() : null));

/**
 * The model's tokens don't arrive evenly — there's a pause while it thinks, then the
 * whole reply lands in a couple of hundred milliseconds, often several tokens per
 * millisecond. Rendering them as they arrive therefore looks instantaneous. So we
 * buffer what the network gives us and reveal it on our own clock instead.
 */
const REVEAL_INTERVAL_MS = 28;

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

  const receivedRef = useRef("");   // everything the network has handed us
  const revealedRef = useRef(0);    // how much of it the user can see
  const upstreamDoneRef = useRef(false);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the newest message in view as it streams in.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const stopReveal = () => {
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  };

  useEffect(() => stopReveal, []);

  /** Walks the buffer forward one word per tick so the reply types itself out. */
  const startReveal = (replyId: number) => {
    stopReveal();
    revealTimerRef.current = setInterval(() => {
      const full = receivedRef.current;

      if (revealedRef.current >= full.length) {
        // Caught up. Only finish once the network has actually closed.
        if (upstreamDoneRef.current) {
          stopReveal();
          setStreaming(false);
        }
        return;
      }

      // Speed up when a lot is queued, so long answers don't crawl.
      const backlog = full.length - revealedRef.current;
      const wordsThisTick = backlog > 240 ? 3 : backlog > 90 ? 2 : 1;

      let cursor = revealedRef.current;
      for (let i = 0; i < wordsThisTick && cursor < full.length; i += 1) {
        const nextSpace = full.indexOf(" ", cursor + 1);
        cursor = nextSpace === -1 ? full.length : nextSpace;
      }
      revealedRef.current = cursor;

      const visible = full.slice(0, cursor);
      setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, text: visible } : m)));
    }, REVEAL_INTERVAL_MS);
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || streaming) return;

    const userMessage: Message = { id: Date.now(), role: "user", text };
    const replyId = userMessage.id + 1;

    setMessages((prev) => [...prev, userMessage, { id: replyId, role: "assistant", text: "" }]);
    setDraft("");
    setError(null);

    // Known client-side already — skip the round trip and reply immediately in place of a stream.
    if (!me) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === replyId ? { ...m, text: "Please log in to use the AI chat assistant." } : m,
        ),
      );
      return;
    }

    setStreaming(true);
    receivedRef.current = "";
    revealedRef.current = 0;
    upstreamDoneRef.current = false;
    startReveal(replyId);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The JWT rides along in the httpOnly cookie automatically.
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        throw new Error(
          res.status === 401 ? "Please log in to use the AI chat assistant." : "Couldn't reach the assistant.",
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        // Feed the buffer; the reveal timer decides when it becomes visible.
        receivedRef.current += decoder.decode(value, { stream: true });
      }

      // Let the reveal loop drain what's left, then it clears `streaming` itself.
      upstreamDoneRef.current = true;
    } catch (err) {
      stopReveal();
      setStreaming(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) => prev.filter((m) => m.id !== replyId));
    }
  };

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
