import { prisma } from "./prisma";

/**
 * Live vehicle data — the source of truth for availability/price/seats/type
 * questions. Deliberately a separate module from both the RAG retrieval
 * service (src/lib/retrieval.ts) and the LLM call, so each concern stays
 * independent and swappable on its own.
 */
const VEHICLE_INTENT_KEYWORDS = [
  "available",
  "availability",
  "in stock",
  "book",
  "rent",
  "price",
  "cost",
  "how much",
  "per day",
  "rate",
  "seat",
  "seats",
  "seating",
  "vehicle",
  "vehicles",
  "car",
  "cars",
  "car type",
  "car types",
  "type of car",
  "types of car",
  "model",
  "models",
  "suv",
  "sedan",
  "compact",
  "transmission",
  "automatic",
  "manual",
  "fuel",
  "petrol",
  "diesel",
  "electric",
];

/** Lightweight keyword heuristic — cheap enough to run on every message, no extra LLM call needed. */
export function isVehicleQuery(question: string): boolean {
  const q = question.toLowerCase();
  return VEHICLE_INTENT_KEYWORDS.some((keyword) => q.includes(keyword));
}

export type VehicleSummary = {
  name: string;
  category: string | null;
  pricePerDay: string;
  seats: number | null;
  transmission: string | null;
  fuelType: string | null;
  status: string;
};

export async function getVehicleInventory(): Promise<VehicleSummary[]> {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { name: "asc" },
    select: {
      name: true,
      category: true,
      pricePerDay: true,
      seats: true,
      transmission: true,
      fuelType: true,
      status: true,
    },
  });

  return vehicles.map((vehicle) => ({
    name: vehicle.name,
    category: vehicle.category,
    pricePerDay: vehicle.pricePerDay.toString(),
    seats: vehicle.seats,
    transmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    status: vehicle.status,
  }));
}

export function formatVehicleInventory(vehicles: VehicleSummary[]): string {
  if (vehicles.length === 0) return "No vehicles are currently in the system.";

  return vehicles
    .map((vehicle) => {
      const details = [
        vehicle.category,
        vehicle.seats ? `${vehicle.seats} seats` : null,
        vehicle.transmission,
        vehicle.fuelType,
        `£${vehicle.pricePerDay}/day`,
        `status: ${vehicle.status}`,
      ].filter(Boolean);

      return `- ${vehicle.name} (${details.join(", ")})`;
    })
    .join("\n");
}
