import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

/**
 * Placeholder reply, streamed word by word so the client-side rendering path is
 * identical to a real LLM. Swap `streamReply` for the provider call later —
 * the request/response contract here already matches a streaming completion.
 */
function cannedReply(message: string, name: string) {
  return [
    `Hi ${name}, thanks for your message!`,
    `You asked: "${message}".`,
    "I'm a placeholder assistant for now — a real model isn't wired up yet,",
    "but this reply is streaming back exactly the way a live one will.",
    "Once the LLM API is connected you'll get genuine answers about bookings,",
    "vehicle availability and pricing right here.",
  ].join(" ");
}

function streamReply(text: string) {
  const encoder = new TextEncoder();
  const chunks = text.split(/(\s+)/).filter(Boolean);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        // Typing cadence — drop this when a real provider supplies the timing.
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      controller.close();
    },
  });
}

export async function POST(request: NextRequest) {
  // The JWT travels in the httpOnly cookie, so the session is read server-side.
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const message = (body as { message?: unknown } | null)?.message;

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  return new Response(streamReply(cannedReply(message.trim(), user.email.split("@")[0])), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      // Keeps proxies from buffering the stream.
      "X-Accel-Buffering": "no",
    },
  });
}
