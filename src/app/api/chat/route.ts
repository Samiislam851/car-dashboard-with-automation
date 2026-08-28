import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { retrieveRelevantKnowledge } from "@/lib/retrieval";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

const SYSTEM_PROMPT =
  "You are the Best Car Assistant, a helpful support agent for a car rental platform. " +
  "Answer questions about bookings, vehicle availability, and pricing concisely and helpfully. " +
  "If you don't know something specific to this business, say so rather than making it up.";

/**
 * Calls OpenRouter's streaming chat-completions endpoint and re-emits only the
 * plain-text deltas, so the client keeps reading a flat text/plain stream
 * exactly as it did with the placeholder reply.
 */
function streamCompletion(userMessage: string) {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error("LLM_API_KEY is not set");
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let upstream: Response;
      try {
        upstream = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.LLM_MODEL ?? DEFAULT_MODEL,
            stream: true,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userMessage },
            ],
          }),
        });
      } catch (error) {
        console.error("OpenRouter request failed", error);
        controller.enqueue(encoder.encode("Sorry, the assistant is unavailable right now."));
        controller.close();
        return;
      }

      if (!upstream.ok || !upstream.body) {
        console.error("OpenRouter error", upstream.status, await upstream.text().catch(() => ""));
        controller.enqueue(encoder.encode("Sorry, the assistant is unavailable right now."));
        controller.close();
        return;
      }

      const reader = upstream.body.getReader();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep a possibly-incomplete trailing line for the next chunk

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice("data:".length).trim();
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            const content = parsed.choices?.[0]?.delta?.content;
            if (typeof content === "string" && content.length > 0) {
              controller.enqueue(encoder.encode(content));
            }
          } catch {
            // Ignore keep-alive / malformed SSE lines.
          }
        }
      }

      controller.close();
    },
  });
}

/**
 * Retrieval-augmentation step, kept separate from streamCompletion (the LLM
 * provider integration) on purpose: this only ever changes the string that
 * gets passed in, never how it's sent to OpenRouter. If retrieval fails for
 * any reason, we fall back to the plain question rather than fail the request.
 */
async function buildPromptWithContext(question: string): Promise<string> {
  try {
    const chunks = await retrieveRelevantKnowledge(question, 3);
    if (chunks.length === 0) return question;

    const context = chunks.map((chunk) => chunk.content).join("\n---\n");
    return `Relevant company information:\n${context}\n\nQuestion: ${question}`;
  } catch (error) {
    console.error("Knowledge retrieval failed", error);
    return question;
  }
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

  const prompt = await buildPromptWithContext(message.trim());

  let stream: ReadableStream<Uint8Array>;
  try {
    stream = streamCompletion(prompt);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Assistant is not configured" }, { status: 500 });
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      // Keeps proxies from buffering the stream.
      "X-Accel-Buffering": "no",
    },
  });
}
