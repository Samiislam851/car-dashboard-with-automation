import { prisma } from "./prisma";

/**
 * Connects the chatbot to the EXISTING booking endpoint — the same one
 * src/components/booking-modal.tsx calls (POST /api/bookings). This module
 * only detects intent + resolves which vehicle was meant; the actual booking
 * is created by calling that real endpoint over HTTP, not by duplicating its
 * logic here.
 */
const BOOKING_INTENT_KEYWORDS = ["book", "rent", "reserve", "hire"];

export function isBookingIntent(message: string): boolean {
  const q = message.toLowerCase();
  return BOOKING_INTENT_KEYWORDS.some((keyword) => q.includes(keyword));
}

export type MatchedVehicle = { id: string; name: string };

/** Deliberately simple substring match against real vehicle names — no fuzzy NLP, keeps this minimal. */
export async function findMentionedVehicle(message: string): Promise<MatchedVehicle | null> {
  const vehicles = await prisma.vehicle.findMany({ select: { id: true, name: true } });
  const lower = message.toLowerCase();
  return vehicles.find((vehicle : any) => lower.includes(vehicle.name.toLowerCase())) ?? null;
}

export type BookingApiResult =
  | { ok: true; id: string; vehicleName: string; status: string; price: string }
  | { ok: false; error: string };

export type TripDetails = {
  startLocation: string | null;
  endLocation: string | null;
  startTime: string | null;
  endTime: string | null;
};

/** The fields the existing frontend flow collects before booking — required here too, not skipped. */
const REQUIRED_TRIP_FIELDS: { key: keyof TripDetails; label: string }[] = [
  { key: "startLocation", label: "pickup location" },
  { key: "endLocation", label: "drop-off location" },
  { key: "startTime", label: "pickup date/time" },
  { key: "endTime", label: "return date/time" },
];

/** Which of the required trip details are still missing, in plain-English labels for the user-facing prompt. */
export function missingTripFields(trip: Partial<TripDetails> | null): string[] {
  return REQUIRED_TRIP_FIELDS.filter(({ key }) => !trip?.[key]).map(({ label }) => label);
}

/**
 * Same endpoint, same method, same request body shape the frontend booking
 * modal uses — see booking-modal.tsx's confirmBooking(). No new API route,
 * no duplicated booking logic: this is a real call to /api/bookings.
 */
export async function createBookingViaApi(
  origin: string,
  cookieHeader: string | null,
  vehicleId: string,
  trip: TripDetails,
): Promise<BookingApiResult> {
  const res = await fetch(`${origin}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify({ vehicleId, ...trip }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return { ok: false, error: (data && data.error) || "Booking request failed." };
  }

  return {
    ok: true,
    id: data.id,
    vehicleName: data.vehicleName,
    status: data.status,
    price: String(data.price),
  };
}
