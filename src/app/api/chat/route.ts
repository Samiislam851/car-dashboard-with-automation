import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { retrieveRelevantKnowledge } from "@/lib/retrieval";
import { isVehicleQuery, getVehicleInventory, formatVehicleInventory } from "@/lib/vehicle-lookup";
import {
  isBookingIntent,
  findMentionedVehicle,
  createBookingViaApi,
  missingTripFields,
  type TripDetails,
} from "@/lib/booking-action";

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
 * Retrieval- and vehicle-augmentation step, kept separate from streamCompletion
 * (the LLM provider integration) on purpose: this only ever changes the string
 * that gets passed in, never how it's sent to OpenRouter. Each source is
 * best-effort — a failure in one doesn't block the other or fail the request.
 *
 * Live vehicle data (availability/price/seats/type) always comes from the
 * Vehicle table, never from the RAG knowledge base — the knowledge base only
 * covers static company policy (cancellation, insurance, payment, etc.), so
 * it's not a source of truth for inventory and is labelled as such below.
 */
async function buildPromptWithContext(question: string): Promise<string> {
  const sections: string[] = [];

  if (isVehicleQuery(question)) {
    try {
      const vehicles = await getVehicleInventory();
      sections.push(
        "Live vehicle inventory from our database (this is the authoritative, up-to-date source for " +
          "availability, price, seats, and vehicle type — do not rely on the company information section " +
          "below for these facts):\n" +
          formatVehicleInventory(vehicles),
      );
    } catch (error) {
      console.error("Vehicle inventory lookup failed", error);
    }
  }

  try {
    const chunks = await retrieveRelevantKnowledge(question, 3);
    if (chunks.length > 0) {
      sections.push(`Relevant company information:\n${chunks.map((chunk) => chunk.content).join("\n---\n")}`);
    }
  } catch (error) {
    console.error("Knowledge retrieval failed", error);
  }

  if (sections.length === 0) return question;

  return `${sections.join("\n\n")}\n\nQuestion: ${question}`;
}

function textResponse(text: string) {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

async function drainStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
}

type ExtractedTrip = TripDetails & {
  /** True when a location was given but is outside Britain — the company only operates within the UK. */
  startLocationOutsideBritain: boolean;
  endLocationOutsideBritain: boolean;
};

/**
 * Reuses streamCompletion as-is (same OpenRouter call, just drained into a
 * string instead of piped to the client) to pull pickup/drop-off location and
 * pickup/return date-time out of the conversation so far, if the customer has
 * mentioned them. Never invents a value — anything not actually said stays null.
 * Also flags whether a given location falls outside Britain, since the
 * company only operates within England, Scotland, and Wales.
 */
async function extractTripDetails(transcript: string, vehicleName: string): Promise<ExtractedTrip | null> {
  const prompt =
    `Conversation so far (assistant and customer):\n${transcript}\n\n` +
    `The customer wants to book the "${vehicleName}". From the conversation above ONLY, extract: ` +
    "pickup location, drop-off location, pickup date/time, and return date/time. " +
    "Respond with ONLY a JSON object and nothing else, in exactly this shape: " +
    '{"startLocation": string or null, "endLocation": string or null, "startTime": string or null, ' +
    '"endTime": string or null, "startLocationOutsideBritain": boolean, "endLocationOutsideBritain": boolean}. ' +
    "Use ISO 8601 (e.g. \"2026-09-10T10:00:00.000Z\") for dates when a specific date/time was given. " +
    "Use null for anything not actually mentioned — never guess or invent a value. " +
    "This company only operates within Britain (England, Scotland, and Wales): set " +
    "startLocationOutsideBritain / endLocationOutsideBritain to true only if a location WAS given and it is " +
    "somewhere outside Britain (e.g. Paris, New York, Dublin); false if it's within Britain, or no location " +
    "was given at all.";

  try {
    const raw = await drainStream(streamCompletion(prompt));
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    return {
      startLocation: typeof parsed.startLocation === "string" ? parsed.startLocation : null,
      endLocation: typeof parsed.endLocation === "string" ? parsed.endLocation : null,
      startTime: typeof parsed.startTime === "string" ? parsed.startTime : null,
      endTime: typeof parsed.endTime === "string" ? parsed.endTime : null,
      startLocationOutsideBritain: parsed.startLocationOutsideBritain === true,
      endLocationOutsideBritain: parsed.endLocationOutsideBritain === true,
    };
  } catch (error) {
    console.error("Booking slot extraction failed", error);
    return null;
  }
}

type HistoryMessage = { role: "user" | "assistant"; text: string };

function parseHistory(body: unknown): HistoryMessage[] {
  const raw = (body as { history?: unknown } | null)?.history;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (entry): entry is HistoryMessage =>
        !!entry &&
        typeof entry === "object" &&
        (entry as { role?: unknown }).role !== undefined &&
        ((entry as { role?: unknown }).role === "user" || (entry as { role?: unknown }).role === "assistant") &&
        typeof (entry as { text?: unknown }).text === "string",
    )
    .slice(-20); // bounded — no need for the full lifetime of a long conversation
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

  const trimmedMessage = message.trim();
  const history = parseHistory(body);

  // Look across the WHOLE conversation, not just this message — a vehicle named two
  // turns ago, or intent expressed earlier, still counts. The client sends this history
  // alongside each message specifically so a multi-turn "book → which car? → BMW X5 →
  // pickup/return details?" flow can complete without any server-side session state.
  const userTexts = [...history.filter((m) => m.role === "user").map((m) => m.text), trimmedMessage];
  const conversationHasBookingIntent = userTexts.some((text) => isBookingIntent(text));

  if (conversationHasBookingIntent) {
    const vehicle = await findMentionedVehicle(userTexts.join("\n"));

    // No specific vehicle identified yet → falls through to the normal flow below, which
    // already asks a clarifying question once the vehicle-inventory context is injected.
    if (vehicle) {
      const transcript = [...history, { role: "user" as const, text: trimmedMessage }]
        .map((m) => `${m.role}: ${m.text}`)
        .join("\n");

      const trip = await extractTripDetails(transcript, vehicle.name);

      // Pickup/drop-off must be within Britain — the company doesn't operate anywhere
      // else. Reject and ask again rather than silently accepting or booking with it.
      if (trip?.startLocationOutsideBritain || trip?.endLocationOutsideBritain) {
        const which =
          trip.startLocationOutsideBritain && trip.endLocationOutsideBritain
            ? "pickup and drop-off locations"
            : trip.startLocationOutsideBritain
              ? "pickup location"
              : "drop-off location";

        return textResponse(
          `We only operate within Britain (England, Scotland, and Wales), so I can't set your ${which} to ` +
            `${trip.startLocationOutsideBritain ? trip.startLocation : trip.endLocation}. ` +
            `Could you choose a ${which === "pickup and drop-off locations" ? "pickup and drop-off location" : which} within Britain instead?`,
        );
      }

      const missing = missingTripFields(trip);

      // Required detail is missing → ask for it. This step is never skipped: the booking
      // API is only ever called once every field below has actually been provided.
      if (missing.length > 0 || !trip) {
        return textResponse(
          `Great — I can help you book the ${vehicle.name}. Could you also let me know your ${missing.join(", ")}?`,
        );
      }

      // All required details present → call the SAME booking endpoint the frontend uses
      // (POST /api/bookings, see booking-modal.tsx) and report its real result. No LLM
      // involved in producing this reply, by design: it must exactly match what the API
      // actually did, never a generated guess.
      const result = await createBookingViaApi(request.nextUrl.origin, request.headers.get("cookie"), vehicle.id, {
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        startTime: trip.startTime,
        endTime: trip.endTime,
      });

      const reply = result.ok
        ? `Your booking for the ${result.vehicleName} is confirmed (status: ${result.status}, ` +
          `£${result.price}/day). Booking reference: ${result.id}.`
        : `Sorry, I couldn't complete that booking: ${result.error}`;

      return textResponse(reply);
    }
  }

  const prompt = await buildPromptWithContext(trimmedMessage);

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
