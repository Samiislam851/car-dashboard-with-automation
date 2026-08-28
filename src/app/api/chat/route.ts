import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { retrieveRelevantKnowledge } from "@/lib/retrieval";
import { isVehicleQuery, getVehicleInventory, formatVehicleInventory } from "@/lib/vehicle-lookup";
import {
  isBookingIntent,
  isCancelMessage,
  getBookableVehicles,
  createBookingViaApi,
  missingTripFields,
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
async function buildPromptWithContext(question: string, forceVehicleInventory = false): Promise<string> {
  const sections: string[] = [];

  if (forceVehicleInventory || isVehicleQuery(question)) {
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

type ExtractedBooking = {
  /** Exact name from the vehicles list passed in, or null if none was confidently identified. */
  vehicleName: string | null;
  startLocation: string | null;
  endLocation: string | null;
  startTime: string | null;
  endTime: string | null;
  /** True when a location was given but is outside Britain — the company only operates within the UK. */
  startLocationOutsideBritain: boolean;
  endLocationOutsideBritain: boolean;
};

/**
 * Reuses streamCompletion as-is (same OpenRouter call, just drained into a string
 * instead of piped to the client) to figure out, from the WHOLE conversation, which
 * vehicle the customer currently wants and what trip details they've given. Doing
 * this with the LLM rather than string-matching is deliberate: it correctly handles
 * a later correction winning over an earlier choice ("not the Range Rover, the BMW"),
 * a partial name ("BMW" → "BMW X5"), and — critically — NOT falling back to a
 * previously-mentioned vehicle just because the latest message names something
 * that isn't in the fleet at all (e.g. "Mercedes"). Never invents a value — anything
 * not actually said stays null.
 */
async function extractBookingDetails(transcript: string, vehicleNames: string[]): Promise<ExtractedBooking | null> {
  const prompt =
    `Conversation so far (assistant and customer):\n${transcript}\n\n` +
    `Vehicles available to book: ${vehicleNames.join(", ")}.\n\n` +
    "From the conversation above, determine:\n" +
    "1. Which ONE vehicle the customer currently wants to book, if any. Use the most recent relevant " +
    "message as authoritative — if they corrected an earlier choice or changed their mind, go with the " +
    "corrected one. If they name something that is NOT in the available-vehicles list above (a different " +
    "brand/model we don't offer), this is null — do NOT substitute a different vehicle from the list. If what " +
    "they said could match MORE THAN ONE vehicle in the list (e.g. they just said \"a Toyota\" and the list has " +
    "two Toyota models), this is also null — do NOT guess between them; only return a name when it uniquely " +
    "identifies exactly one vehicle. If not " +
    "null, copy the name EXACTLY (character-for-character) from the available-vehicles list.\n" +
    "2. Pickup location, drop-off location, pickup date/time, and return date/time, if mentioned.\n\n" +
    "Respond with ONLY a JSON object and nothing else, in exactly this shape: " +
    '{"vehicleName": string or null, "startLocation": string or null, "endLocation": string or null, ' +
    '"startTime": string or null, "endTime": string or null, "startLocationOutsideBritain": boolean, ' +
    '"endLocationOutsideBritain": boolean}. ' +
    "Use ISO 8601 (e.g. \"2026-09-10T10:00:00.000Z\") for dates when a specific date/time was given. " +
    "Use null for anything not actually mentioned or not confidently determined — never guess or invent a value. " +
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
      vehicleName: typeof parsed.vehicleName === "string" ? parsed.vehicleName : null,
      startLocation: typeof parsed.startLocation === "string" ? parsed.startLocation : null,
      endLocation: typeof parsed.endLocation === "string" ? parsed.endLocation : null,
      startTime: typeof parsed.startTime === "string" ? parsed.startTime : null,
      endTime: typeof parsed.endTime === "string" ? parsed.endTime : null,
      startLocationOutsideBritain: parsed.startLocationOutsideBritain === true,
      endLocationOutsideBritain: parsed.endLocationOutsideBritain === true,
    };
  } catch (error) {
    console.error("Booking detail extraction failed", error);
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

  // The user backing out ("cancel the booking", "never mind") must win outright, even
  // though "booking" itself also matches the booking-intent keywords above.
  if (conversationHasBookingIntent && isCancelMessage(trimmedMessage)) {
    return textResponse("No problem — I won't proceed with that booking. Let me know if you'd like to book a different vehicle.");
  }

  if (conversationHasBookingIntent) {
    const vehicles = await getBookableVehicles();
    const transcript = [...history, { role: "user" as const, text: trimmedMessage }]
      .map((m) => `${m.role}: ${m.text}`)
      .join("\n");

    const extracted = await extractBookingDetails(transcript, vehicles.map((v) => v.name));
    const vehicle = extracted?.vehicleName ? vehicles.find((v) => v.name === extracted.vehicleName) : undefined;

    // No specific (in-fleet) vehicle identified yet → falls through to the normal flow
    // below, which already asks a clarifying question once vehicle-inventory context is
    // injected. This also covers "that's not one of ours" (e.g. "Mercedes") correctly,
    // since extractBookingDetails deliberately returns null rather than guessing.
    if (vehicle && extracted) {
      // Pickup/drop-off must be within Britain — the company doesn't operate anywhere
      // else. Reject and ask again rather than silently accepting or booking with it.
      if (extracted.startLocationOutsideBritain || extracted.endLocationOutsideBritain) {
        const which =
          extracted.startLocationOutsideBritain && extracted.endLocationOutsideBritain
            ? "pickup and drop-off locations"
            : extracted.startLocationOutsideBritain
              ? "pickup location"
              : "drop-off location";

        return textResponse(
          `We only operate within Britain (England, Scotland, and Wales), so I can't set your ${which} to ` +
            `${extracted.startLocationOutsideBritain ? extracted.startLocation : extracted.endLocation}. ` +
            `Could you choose a ${which === "pickup and drop-off locations" ? "pickup and drop-off location" : which} within Britain instead?`,
        );
      }

      const missing = missingTripFields(extracted);

      // Required detail is missing → ask for it. This step is never skipped: the booking
      // API is only ever called once every field below has actually been provided.
      if (missing.length > 0) {
        return textResponse(
          `Great — I can help you book the ${vehicle.name}. Could you also let me know your ${missing.join(", ")}?`,
        );
      }

      // All required details present → call the SAME booking endpoint the frontend uses
      // (POST /api/bookings, see booking-modal.tsx) and report its real result. No LLM
      // involved in producing this reply, by design: it must exactly match what the API
      // actually did, never a generated guess.
      const result = await createBookingViaApi(request.nextUrl.origin, request.headers.get("cookie"), vehicle.id, {
        startLocation: extracted.startLocation,
        endLocation: extracted.endLocation,
        startTime: extracted.startTime,
        endTime: extracted.endTime,
      });

      const reply = result.ok
        ? `Your booking for the ${result.vehicleName} is confirmed (status: ${result.status}, ` +
          `£${result.price}/day). Booking reference: ${result.id}.`
        : `Sorry, I couldn't complete that booking: ${result.error}`;

      return textResponse(reply);
    }
  }

  // Falling through from an active booking conversation (e.g. they asked about a model
  // we don't stock) — make sure the LLM still has the real catalog, so it can say so
  // confidently instead of asking vague clarifying questions.
  const prompt = await buildPromptWithContext(trimmedMessage, conversationHasBookingIntent);

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
